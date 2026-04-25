import { Router } from "express";
import { z } from "zod";

export const catsRouter = Router();

const CreateCatSchema = z.object({
  name: z.string().min(1).max(50),
  sex: z.enum(["unknown", "male", "female"]).default("unknown"),
  description: z.string().max(500).optional()
});

catsRouter.get("/", (_req, res) => {
  res.status(200).json({ items: [] });
});

catsRouter.get("/:id", (req, res) => {
  res.status(200).json({ id: req.params.id });
});

catsRouter.post("/", (req, res) => {
  const parsed = CreateCatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
  }
  res.status(201).json({ id: 1, ...parsed.data });
});

