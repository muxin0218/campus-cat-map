/** Express 后端 JWT 认证中间件 */
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// 必须与 Python 后端的 JWT_SECRET 一致
const JWT_SECRET = "campus-cat-map-secret-key-change-in-production";

export interface AuthUser {
    userId: number;
    username: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            authUser?: AuthUser;
        }
    }
}

/**
 * 解析 JWT token，将用户信息挂到 req.authUser 上
 * 如果无 token 或无效，authUser 为 undefined（不报错，方便未登录用户访问）
 */
export function parseAuth(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next();
        return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        next();
        return;
    }

    try {
        const payload = jwt.verify(parts[1], JWT_SECRET) as any;
        req.authUser = {
            userId: Number(payload.sub),
            username: payload.username,
            role: payload.role,
        };
    } catch {
        // token 无效，视为未登录
    }

    next();
}

/**
 * 要求必须登录
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.authUser) {
        return res.status(401).json({ message: "请先登录" });
    }
    next();
}

/**
 * 要求必须是管理员
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.authUser || req.authUser.role !== "admin") {
        return res.status(403).json({ message: "无权限，仅管理员可操作" });
    }
    next();
}

/**
 * 生成 status WHERE 条件
 * 管理员看到全部，非管理员只看 approved
 */
export function statusFilterClause(authUser?: AuthUser): {
    clause: string;
    values: any[];
} {
    if (authUser?.role === "admin") {
        return { clause: "", values: [] };
    }
    return { clause: "AND status = 'approved'", values: [] };
}
