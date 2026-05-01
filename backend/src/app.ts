import { join } from "path";
import cors from "cors";
import express from "express";
import { catsRouter } from "./routes/cats.js";
import { feedingPointsRouter } from "./routes/feeding-points.js";
import { feedingEventsRouter } from "./routes/feeding-events.js";
import { healthRouter } from "./routes/health.js";
import { sightingsRouter } from "./routes/sightings.js";

export function createApp() {
  const app = express();

  app.use(cors());
  // 增大 limit 以支持 base64 图片上传
  app.use(express.json({ limit: "10mb" }));

  // 静态文件：上传的图片
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  app.use("/api/health", healthRouter);
  app.use("/api/cats", catsRouter);
  app.use("/api/sightings", sightingsRouter);
  app.use("/api/feeding-points", feedingPointsRouter);
  app.use("/api/feeding-events", feedingEventsRouter);

  return app;
}

