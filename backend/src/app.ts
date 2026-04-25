import cors from "cors";
import express from "express";
import { catsRouter } from "./routes/cats.js";
import { feedingPointsRouter } from "./routes/feeding-points.js";
import { healthRouter } from "./routes/health.js";
import { sightingsRouter } from "./routes/sightings.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/cats", catsRouter);
  app.use("/api/sightings", sightingsRouter);
  app.use("/api/feeding-points", feedingPointsRouter);

  return app;
}

