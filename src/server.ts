import { createServer, type Server } from "http";
import readline from "readline";
import { createApp } from "./app";
import { connectRedis, disconnectRedis } from "./cache/redis";
import { env } from "./config/env";
import { connectMongo, disconnectMongo } from "./db/mongoose";

const SHUTDOWN_TIMEOUT_MS = 10_000;

let httpServer: Server | null = null;
let isShuttingDown = false;

function closeHttpServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    console.log("Force quitting...");
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    if (httpServer) {
      await closeHttpServer(httpServer);
    }

    await disconnectMongo();
    await disconnectRedis();

    clearTimeout(forceExitTimer);
    console.log("Shutdown complete");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

function registerShutdownHandlers(): void {
  const handleSignal = (signal: NodeJS.Signals) => {
    void shutdown(signal);
  };

  process.on("SIGTERM", () => handleSignal("SIGTERM"));
  process.on("SIGINT", () => handleSignal("SIGINT"));

  // Windows terminals (incl. PowerShell) don't always deliver SIGINT reliably.
  if (process.platform === "win32") {
    readline
      .createInterface({ input: process.stdin, output: process.stdout })
      .on("SIGINT", () => handleSignal("SIGINT"));
  }
}

async function bootstrap(): Promise<void> {
  registerShutdownHandlers();

  await connectMongo();
  await connectRedis();

  const app = createApp();
  httpServer = createServer(app);

  httpServer.listen(env.PORT, () => {
    console.log(`Server is listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
