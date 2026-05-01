import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/pool.js";

export const feedingEventsRouter = Router();

const CreateFeedingEventSchema = z.object({
    feeding_point_id: z.number().int().positive(),
    feeder_id: z.number().int().positive().optional(),
    food_type: z.string().max(50).optional(),
    amount: z.string().max(50).optional(),
    note: z.string().max(500).optional(),
    fed_at: z.string().datetime().optional()
});

feedingEventsRouter.post("/", (req, res) => {
    void (async () => {
        const parsed = CreateFeedingEventSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
        }

        const { feeding_point_id, feeder_id, food_type, amount, note, fed_at } = parsed.data;
        const { rows } = await getPool().query(
            `
      INSERT INTO public.feeding_events (feeding_point_id, feeder_id, food_type, amount, note, fed_at)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()))
      RETURNING id, feeding_point_id, feeder_id, food_type, amount, note, fed_at, created_at
      `,
            [feeding_point_id, feeder_id ?? null, food_type ?? null, amount ?? null, note ?? null, fed_at ?? null]
        );

        res.status(201).json(rows[0]);
    })().catch((err: any) => {
        if (err?.code === "23503") {
            return res.status(404).json({ message: "Feeding point not found" });
        }
        console.error("POST /api/feeding-events failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    });
});
