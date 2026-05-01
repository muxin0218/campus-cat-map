import { Router } from "express";
import { z } from "zod";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { getPool } from "../db/pool.js";

export const sightingsRouter = Router();

const CreateSightingSchema = z.object({
  cat_id: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  note: z.string().max(500).optional(),
  happened_at: z.string().datetime().optional(),
  reporter_id: z.number().int().positive().optional(),
  image: z.string().optional() // base64 data URL (e.g. data:image/jpeg;base64,...)
});

sightingsRouter.get("/", (req, res) => {
  void (async () => {
    const catId = typeof req.query.cat_id === "string" ? Number(req.query.cat_id) : undefined;
    const reporterId = typeof req.query.reporter_id === "string" ? Number(req.query.reporter_id) : undefined;
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit ?? 50) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0);

    const where: string[] = [];
    const values: any[] = [];

    if (Number.isFinite(catId) && (catId as number) > 0) {
      values.push(catId);
      where.push(`s.cat_id = $${values.length}`);
    }
    if (Number.isFinite(reporterId) && (reporterId as number) > 0) {
      values.push(reporterId);
      where.push(`s.reporter_id = $${values.length}`);
    }
    if (from) {
      values.push(from);
      where.push(`s.happened_at >= $${values.length}::timestamptz`);
    }
    if (to) {
      values.push(to);
      where.push(`s.happened_at <= $${values.length}::timestamptz`);
    }

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const { rows } = await getPool().query(
      `
      SELECT
        s.id,
        s.cat_id,
        s.latitude,
        s.longitude,
        s.note,
        s.happened_at,
        s.created_at,
        cp.url AS photo_url
      FROM public.sightings s
      LEFT JOIN LATERAL (
        SELECT p.url
        FROM public.cat_photos p
        WHERE p.sighting_id = s.id
        ORDER BY p.created_at DESC
        LIMIT 1
      ) cp ON true
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY s.happened_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      values
    );

    res.status(200).json({ items: rows });
  })().catch(() => {
    console.error("GET /api/sightings failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});

sightingsRouter.post("/", (req, res) => {
  void (async () => {
    const parsed = CreateSightingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { cat_id, latitude, longitude, note, happened_at, reporter_id, image } = parsed.data;

    // 1. 插入 sightings
    const { rows } = await getPool().query(
      `
      INSERT INTO public.sightings (cat_id, latitude, longitude, note, happened_at, reporter_id)
      VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()), $6)
      RETURNING id, cat_id, latitude, longitude, note, happened_at, created_at
      `,
      [cat_id, latitude, longitude, note ?? null, happened_at ?? null, reporter_id ?? null]
    );

    const sighting = rows[0];
    let photoUrl: string | null = null;

    // 2. 如果有图片，保存到 uploads 目录并写入 cat_photos
    if (image) {
      try {
        const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1].replace("image/", "");
          const buffer = Buffer.from(matches[2], "base64");
          const uploadDir = join(process.cwd(), "uploads");
          if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
          const filename = `${randomUUID()}.${ext}`;
          const filepath = join(uploadDir, filename);
          writeFileSync(filepath, buffer);

          photoUrl = `/uploads/${filename}`;

          await getPool().query(
            `
            INSERT INTO public.cat_photos (cat_id, url, sighting_id, uploaded_by)
            VALUES ($1, $2, $3, $4)
            `,
            [cat_id, photoUrl, sighting.id, reporter_id ?? null]
          );
        }
      } catch (imgErr) {
        console.error("Failed to save image:", imgErr);
        // 图片保存失败不阻塞打卡，继续返回
      }
    }

    res.status(201).json({ ...sighting, photo_url: photoUrl });
  })().catch((err: any) => {
    if (err?.code === "23503") {
      return res.status(404).json({ message: "Not Found" });
    }
    console.error("POST /api/sightings failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  });
});
