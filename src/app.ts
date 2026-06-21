import express from "express";
import { getRedis, isRedisConnected } from "./core/cache/redis";
import { isMongoConnected } from "./core/db/mongoose";
import {
  errorHandler,
  notFoundHandler,
} from "./core/middleware/errorHandler";
import { setupSecurityMiddleware } from "./core/middleware/security";
import routes from "./routes";

export function createApp(): express.Application {
  const app = express();

  setupSecurityMiddleware(app);

  app.get("/health", async (_req, res) => {
    const mongoReady = isMongoConnected();
    let redisReady = isRedisConnected();

    if (redisReady) {
      try {
        await getRedis().ping();
      } catch {
        redisReady = false;
      }
    }

    const ok = mongoReady && redisReady;

    res.status(ok ? 200 : 503).json({
      status: ok ? "ok" : "degraded",
      mongo: mongoReady ? "connected" : "disconnected",
      redis: redisReady ? "connected" : "disconnected",
    });
  });

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
