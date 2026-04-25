import { Router } from "express";
import { z } from "zod";

export const feedingPointsRouter = Router();

const CreateFeedingPointSchema = z.object({
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(500).optional()
});

feedingPointsRouter.get("/", (_req, res) => {
  res.status(200).json({ items: [] });
});

feedingPointsRouter.post("/", (req, res) => {
  const parsed = CreateFeedingPointSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
  }
  res.status(201).json({ id: 1, ...parsed.data });
});

