import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/pool.js";

export const feedingPointsRouter = Router();

const CreateFeedingPointSchema = z.object({
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(500).optional(),
  created_by: z.number().int().positive().optional()
});

const UpdateFeedingPointSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  description: z.string().max(500).optional()
});

feedingPointsRouter.get("/", (_req, res) => {
  void (async () => {
    const limit = Math.min(Math.max(Number(_req.query.limit ?? 50) || 50, 1), 200);
    const offset = Math.max(Number(_req.query.offset ?? 0) || 0, 0);

    const { rows } = await getPool().query(
      `
      SELECT id, name, latitude, longitude, description, created_by, created_at, updated_at
      FROM public.feeding_points
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.status(200).json({ items: rows });
  })().catch(() => {
    console.error("GET /api/feeding-points failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});

feedingPointsRouter.post("/", (req, res) => {
  void (async () => {
    const parsed = CreateFeedingPointSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { name, latitude, longitude, description, created_by } = parsed.data;
    const { rows } = await getPool().query(
      `
      INSERT INTO public.feeding_points (name, latitude, longitude, description, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, latitude, longitude, description, created_at, updated_at
      `,
      [name, latitude, longitude, description ?? null, created_by ?? null]
    );

    res.status(201).json(rows[0]);
  })().catch(() => {
    console.error("POST /api/feeding-points failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});

feedingPointsRouter.put("/:id", (req, res) => {
  void (async () => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const parsed = UpdateFeedingPointSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { name, latitude, longitude, description } = parsed.data;
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 0;

    if (name !== undefined) { idx++; setClauses.push(`name = $${idx}`); values.push(name); }
    if (latitude !== undefined) { idx++; setClauses.push(`latitude = $${idx}`); values.push(latitude); }
    if (longitude !== undefined) { idx++; setClauses.push(`longitude = $${idx}`); values.push(longitude); }
    if (description !== undefined) { idx++; setClauses.push(`description = $${idx}`); values.push(description); }
    setClauses.push("updated_at = NOW()");

    if (setClauses.length === 1) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(id);
    const { rows } = await getPool().query(
      `
      UPDATE public.feeding_points
      SET ${setClauses.join(", ")}
      WHERE id = $${idx + 1}
      RETURNING id, name, latitude, longitude, description, created_at, updated_at
      `,
      values
    );

    if (rows.length === 0) return res.status(404).json({ message: "Not Found" });
    res.status(200).json(rows[0]);
  })().catch(() => {
    console.error("PUT /api/feeding-points/:id failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});

feedingPointsRouter.delete("/:id", (req, res) => {
  void (async () => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { rows } = await getPool().query(
      `DELETE FROM public.feeding_points WHERE id = $1 RETURNING id`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Not Found" });
    res.status(204).send();
  })().catch(() => {
    console.error("DELETE /api/feeding-points/:id failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});
