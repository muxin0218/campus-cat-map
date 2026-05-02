import { Router } from "express";
import { z } from "zod";
import { getPool } from "../db/pool.js";
import { statusFilterClause, requireAdmin } from "../auth/middleware.js";

export const catsRouter = Router();

const CreateCatSchema = z.object({
  name: z.string().min(1).max(50),
  sex: z.enum(["unknown", "male", "female"]).default("unknown"),
  description: z.string().max(500).optional(),
  neutered: z.boolean().optional(),
  created_by: z.number().int().positive().optional()
});

// 审核入参
const ReviewCatSchema = z.object({
  status: z.enum(["approved", "rejected"])
});

// GET /api/cats - 列表
// 普通用户只看 approved，管理员看全部（也可用 ?status= 指定）
catsRouter.get("/", (_req, res) => {
  void (async () => {
    const q = typeof _req.query.q === "string" && _req.query.q.trim() ? _req.query.q.trim() : null;
    const limit = Math.min(Math.max(Number(_req.query.limit ?? 20) || 20, 1), 100);
    const offset = Math.max(Number(_req.query.offset ?? 0) || 0, 0);
    const statusFilter = typeof _req.query.status === "string" ? _req.query.status : null;

    // status 过滤：管理员可指定 status，否则走默认角色过滤
    let statusClause = "";
    if (statusFilter && _req.authUser?.role === "admin") {
      statusClause = `AND c.status = '${statusFilter.replace(/[^a-z]/g, "")}'`;
    } else {
      const sf = statusFilterClause(_req.authUser);
      statusClause = sf.clause;
    }

    const { rows } = await getPool().query(
      `
      SELECT
        c.id,
        c.name,
        c.sex,
        c.description,
        c.neutered,
        c.status,
        c.created_by,
        c.created_at,
        ls.latitude,
        ls.longitude,
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
        ${statusClause}
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

// GET /api/cats/:id - 详情（同样过滤 status）
catsRouter.get("/:id", (req, res) => {
  void (async () => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const sf = statusFilterClause(req.authUser);

    const { rows } = await getPool().query(
      `
      SELECT
        c.id,
        c.name,
        c.sex,
        c.description,
        c.neutered,
        c.status,
        ls.latitude,
        ls.longitude,
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
      WHERE c.id = $1 ${sf.clause}
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

// POST /api/cats - 添加猫咪（新建时 status 自动为 pending）
catsRouter.post("/", (req, res) => {
  void (async () => {
    const parsed = CreateCatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { name, sex, description, neutered, created_by } = parsed.data;
    const { rows } = await getPool().query(
      `
      INSERT INTO public.cats (name, sex, description, neutered, created_by, status)
      VALUES ($1, $2, $3, COALESCE($4, FALSE), $5, 'pending')
      RETURNING id, name, sex, description, neutered, status
      `,
      [name, sex, description ?? null, neutered ?? null, created_by ?? null]
    );

    res.status(201).json(rows[0]);
  })().catch(() => {
    console.error("POST /api/cats failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});

// PUT /api/cats/:id/review - 管理员审核
catsRouter.put("/:id/review", requireAdmin, (req, res) => {
  void (async () => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const parsed = ReviewCatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const { status } = parsed.data;
    const { rows } = await getPool().query(
      `UPDATE public.cats SET status = $1 WHERE id = $2 RETURNING id, name, status`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Not Found" });
    }

    res.status(200).json(rows[0]);
  })().catch(() => {
    console.error("PUT /api/cats/:id/review failed");
    res.status(500).json({ message: "Internal Server Error" });
  });
});
