import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/pool.js";
import { statusFilterClause, requireAdmin } from "../auth/middleware.js";

export const feedingEventsRouter = Router();

const CreateFeedingEventSchema = z.object({
    feeding_point_id: z.number().int().positive(),
    cat_id: z.number().int().positive().optional(), // 关联猫咪
    feeder_id: z.number().int().positive().optional(),
    food_type: z.string().max(50).optional(),
    amount: z.string().max(50).optional(),
    note: z.string().max(500).optional(),
    fed_at: z.string().datetime().optional()
});

// 审核入参
const ReviewFeedingEventSchema = z.object({
    status: z.enum(["approved", "rejected"])
});

// GET /api/feeding-events?cat_id=xxx&status=xxx
feedingEventsRouter.get("/", (req, res) => {
    void (async () => {
        const catId = typeof req.query.cat_id === "string" ? Number(req.query.cat_id) : undefined;
        const limit = Math.min(Math.max(Number(req.query.limit ?? 50) || 50, 1), 200);
        const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0);
        const statusFilter = typeof req.query.status === "string" ? req.query.status : null;

        const where: string[] = [];
        const values: any[] = [];

        if (Number.isFinite(catId) && (catId as number) > 0) {
            values.push(catId);
            where.push(`fe.cat_id = $${values.length}`);
        }

        // status 过滤：管理员可指定 status，否则走默认角色过滤
        let statusClause = "";
        if (statusFilter && req.authUser?.role === "admin") {
            statusClause = `AND fe.status = '${statusFilter.replace(/[^a-z]/g, "")}'`;
        } else {
            const sf = statusFilterClause(req.authUser);
            statusClause = sf.clause ? sf.clause.replace(/AND (\w+\.)?status/g, "AND fe.status") : "";
        }

        values.push(limit);
        const limitIdx = values.length;
        values.push(offset);
        const offsetIdx = values.length;

        const { rows } = await getPool().query(
            `SELECT
        fe.id,
        fe.feeding_point_id,
        fe.cat_id,
        fe.feeder_id,
        fe.food_type,
        fe.amount,
        fe.note,
        fe.status,
        fe.fed_at,
        fe.created_at,
        fp.name AS feeding_point_name,
        u.username AS feeder_username
      FROM public.feeding_events fe
      LEFT JOIN public.feeding_points fp ON fp.id = fe.feeding_point_id
      LEFT JOIN public.users u ON u.id = fe.feeder_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ${statusClause}
      ORDER BY fe.fed_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
            values
        );

        res.status(200).json({ items: rows });
    })().catch((err: unknown) => {
        console.error("GET /api/feeding-events failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    });
});

feedingEventsRouter.post("/", (req, res) => {
    void (async () => {
        const parsed = CreateFeedingEventSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
        }

        const { feeding_point_id, cat_id, feeder_id, food_type, amount, note, fed_at } = parsed.data;
        const { rows } = await getPool().query(
            `INSERT INTO public.feeding_events (feeding_point_id, cat_id, feeder_id, food_type, amount, note, fed_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()), 'pending')
      RETURNING id, feeding_point_id, cat_id, feeder_id, food_type, amount, note, fed_at, created_at, status
      `,
            [feeding_point_id, cat_id ?? null, feeder_id ?? null, food_type ?? null, amount ?? null, note ?? null, fed_at ?? null]
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

// PUT /api/feeding-events/:id/review - 管理员审核
feedingEventsRouter.put("/:id/review", requireAdmin, (req, res) => {
    void (async () => {
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const parsed = ReviewFeedingEventSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
        }

        const { status } = parsed.data;
        const { rows } = await getPool().query(
            `UPDATE public.feeding_events SET status = $1 WHERE id = $2 RETURNING id, feeding_point_id, status`,
            [status, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Not Found" });
        }

        res.status(200).json(rows[0]);
    })().catch(() => {
        console.error("PUT /api/feeding-events/:id/review failed");
        res.status(500).json({ message: "Internal Server Error" });
    });
});
