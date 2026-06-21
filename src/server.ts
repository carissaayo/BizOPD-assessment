import { createServer, type Server } from "http";
import { createApp } from "./app";
import { connectRedis, disconnectRedis } from "./core/cache/redis";
import { env } from "./config/env";
import { connectMongo, disconnectMongo } from "./core/db/mongoose";

const SHUTDOWN_TIMEOUT_MS = 10_000;

let isShuttingDown = false;

async function bootstrap(): Promise<void> {
  await connectMongo();

  await connectRedis();
  console.log("Connected to Redis");

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server is listening on port ${env.PORT}`);
  });

  setupGracefulShutdown(server);
}

function setupGracefulShutdown(server: Server): void {
  const shutdown = (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`${signal} received, shutting down gracefully...`);

    const forceExitTimer = setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExitTimer.unref();

    server.close(async (error) => {
      clearTimeout(forceExitTimer);

      if (error) {
        console.error("Error closing HTTP server:", error);
        process.exit(1);
      }

      try {
        await disconnectMongo();
        await disconnectRedis();
        console.log("Shutdown complete");
        process.exit(0);
      } catch (shutdownError) {
        console.error("Error during shutdown:", shutdownError);
        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
