import { Router } from "express";
import { z } from "zod";

export const sightingsRouter = Router();

const CreateSightingSchema = z.object({
  cat_id: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  note: z.string().max(500).optional(),
  happened_at: z.string().datetime().optional()
});

sightingsRouter.get("/", (_req, res) => {
  res.status(200).json({ items: [] });
});

sightingsRouter.post("/", (req, res) => {
  const parsed = CreateSightingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
  }
  res.status(201).json({ id: 1, ...parsed.data });
});

