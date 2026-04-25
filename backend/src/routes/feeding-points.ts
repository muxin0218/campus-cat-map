import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/pool.js";

export const feedingPointsRouter = Router();

const CreateFeedingPointSchema = z.object({
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(500).optional()
});

feedingPointsRouter.get("/", (_req, res) => {
  void (async () => {
    const limit = Math.min(Math.max(Number(_req.query.limit ?? 50) || 50, 1), 200);
    const offset = Math.max(Number(_req.query.offset ?? 0) || 0, 0);

    const { rows } = await getPool().query(
      `
      SELECT id, name, latitude, longitude, description, created_at, updated_at
      FROM public.feeding_points
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.status(200).json({ items: rows });
  })().catch(() => {
    res.status(500).json({ message: "Internal Server Error" });
  });
});

feedingPointsRouter.post("/", (req, res) => {
  void (async () => {
    const parsed = CreateFeedingPointSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { name, latitude, longitude, description } = parsed.data;
    const { rows } = await getPool().query(
      `
      INSERT INTO public.feeding_points (name, latitude, longitude, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, latitude, longitude, description, created_at, updated_at
      `,
      [name, latitude, longitude, description ?? null]
    );

    res.status(201).json(rows[0]);
  })().catch(() => {
    res.status(500).json({ message: "Internal Server Error" });
  });
});
