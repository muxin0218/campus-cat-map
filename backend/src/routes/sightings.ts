import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/pool.js";

export const sightingsRouter = Router();

const CreateSightingSchema = z.object({
  cat_id: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  note: z.string().max(500).optional(),
  happened_at: z.string().datetime().optional()
});

sightingsRouter.get("/", (req, res) => {
  void (async () => {
    const catId = typeof req.query.cat_id === "string" ? Number(req.query.cat_id) : undefined;
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
        s.created_at
      FROM public.sightings s
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY s.happened_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      values
    );

    res.status(200).json({ items: rows });
  })().catch(() => {
    res.status(500).json({ message: "Internal Server Error" });
  });
});

sightingsRouter.post("/", (req, res) => {
  void (async () => {
    const parsed = CreateSightingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { cat_id, latitude, longitude, note, happened_at } = parsed.data;

    const { rows } = await getPool().query(
      `
      INSERT INTO public.sightings (cat_id, latitude, longitude, note, happened_at)
      VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()))
      RETURNING id, cat_id, latitude, longitude, note, happened_at, created_at
      `,
      [cat_id, latitude, longitude, note ?? null, happened_at ?? null]
    );

    res.status(201).json(rows[0]);
  })().catch((err: any) => {
    if (err?.code === "23503") {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  });
});
