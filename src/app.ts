import express from "express";
import { getRedis, isRedisConnected } from "./cache/redis";
import { isMongoConnected } from "./db/mongoose";

export function createApp(): express.Application {
  const app = express();

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

  return app;
}
