import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/pool.js";

export const catsRouter = Router();

const CreateCatSchema = z.object({
  name: z.string().min(1).max(50),
  sex: z.enum(["unknown", "male", "female"]).default("unknown"),
  description: z.string().max(500).optional(),
  neutered: z.boolean().optional(),
  created_by: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

catsRouter.get("/", (_req, res) => {
  void (async () => {
    const q = typeof _req.query.q === "string" && _req.query.q.trim() ? _req.query.q.trim() : null;
    const limit = Math.min(Math.max(Number(_req.query.limit ?? 20) || 20, 1), 100);
    const offset = Math.max(Number(_req.query.offset ?? 0) || 0, 0);

    const { rows } = await getPool().query(
      `
      SELECT
        c.id,
        c.name,
        c.sex,
        c.description,
        c.neutered,
        COALESCE(ls.latitude, c.latitude) AS latitude,
        COALESCE(ls.longitude, c.longitude) AS longitude,
        ls.happened_at AS last_seen_at,
        lp.url AS photo_url
      FROM public.cats c
      LEFT JOIN LATERAL (
        SELECT s.latitude, s.longitude, s.happened_at
        FROM public.sightings s
        WHERE s.cat_id = c.id
        ORDER BY s.happened_at DESC
        LIMIT 1
      ) ls ON true
      LEFT JOIN LATERAL (
        SELECT p.url
        FROM public.cat_photos p
        WHERE p.cat_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 1
      ) lp ON true
      WHERE ($1::text IS NULL OR c.name ILIKE ('%' || $1 || '%'))
      ORDER BY c.id DESC
      LIMIT $2 OFFSET $3
      `,
      [q, limit, offset]
    );

    res.status(200).json({ items: rows });
  })().catch((err: unknown) => {
    console.error("GET /api/cats failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  });
});

catsRouter.get("/:id", (req, res) => {
  void (async () => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { rows } = await getPool().query(
      `
      SELECT
        c.id,
        c.name,
        c.sex,
        c.description,
        c.neutered,
        COALESCE(ls.latitude, c.latitude) AS latitude,
        COALESCE(ls.longitude, c.longitude) AS longitude,
        ls.happened_at AS last_seen_at,
        lp.url AS photo_url
      FROM public.cats c
      LEFT JOIN LATERAL (
        SELECT s.latitude, s.longitude, s.happened_at
        FROM public.sightings s
        WHERE s.cat_id = c.id
        ORDER BY s.happened_at DESC
        LIMIT 1
      ) ls ON true
      LEFT JOIN LATERAL (
        SELECT p.url
        FROM public.cat_photos p
        WHERE p.cat_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 1
      ) lp ON true
      WHERE c.id = $1
      `,
      [id]
    );

    const cat = rows[0];
    if (!cat) return res.status(404).json({ message: "Not Found" });
    res.status(200).json(cat);
  })().catch(() => {
    console.error("GET /api/cats/:id failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});

catsRouter.post("/", (req, res) => {
  void (async () => {
    const parsed = CreateCatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { name, sex, description, neutered, created_by, latitude, longitude } = parsed.data;
    const { rows } = await getPool().query(
      `
      INSERT INTO public.cats (name, sex, description, neutered, created_by, latitude, longitude)
      VALUES ($1, $2, $3, COALESCE($4, FALSE), $5, $6, $7)
      RETURNING id, name, sex, description, neutered
      `,
      [name, sex, description ?? null, neutered ?? null, created_by ?? null, latitude ?? null, longitude ?? null]
    );

    res.status(201).json(rows[0]);
  })().catch(() => {
    console.error("POST /api/cats failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});
