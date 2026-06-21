import Redis from "ioredis";
import { env } from "../config/env";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let redis: Redis | null = null;
let listenersRegistered = false;

function registerRedisListeners(client: Redis): void {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  client.on("connect", () => {
    console.log("Redis connecting");
  });

  client.on("ready", () => {
    console.log("Redis connected");
  });

  client.on("close", () => {
    console.warn("Redis disconnected");
  });

  client.on("reconnecting", () => {
    console.log("Redis reconnecting");
  });

  client.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });
}

function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    connectTimeout: 5000,
  });

  registerRedisListeners(client);
  return client;
}

function isRetryableRedisError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEOUT") ||
    message.includes("Connection is closed")
  ) {
    return true;
  }

  if (error instanceof AggregateError) {
    return error.errors.some((inner) => isRetryableRedisError(inner));
  }

  return false;
}

async function teardownRedisClient(): Promise<void> {
  if (!redis) {
    return;
  }

  redis.removeAllListeners();

  if (redis.status !== "end") {
    redis.disconnect();
  }

  redis = null;
  listenersRegistered = false;
}

async function attemptConnect(): Promise<void> {
  if (!redis) {
    redis = createRedisClient();
  }

  if (redis.status === "ready") {
    return;
  }

  await redis.connect();
  await redis.ping();
}

export function getRedis(): Redis {
  if (!redis) {
    redis = createRedisClient();
  }

  return redis;
}

export async function connectRedis(retryCount = MAX_RETRIES): Promise<void> {
  if (redis?.status === "ready") {
    return;
  }

  try {
    await attemptConnect();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("REDIS CONNECTION ERR:", message);

    await teardownRedisClient();

    if (isRetryableRedisError(err)) {
      if (retryCount > 0) {
        console.log(
          `Retrying Redis connection... (Attempt ${MAX_RETRIES - retryCount + 1}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return connectRedis(retryCount - 1);
      }

      console.error(
        `Failed to connect to Redis after ${MAX_RETRIES} attempts.`,
      );
      throw new Error("Redis connection failed after retries");
    }

    throw err;
  }
}

export async function disconnectRedis(): Promise<void> {
  await teardownRedisClient();
}

export function isRedisConnected(): boolean {
  return redis?.status === "ready";
}
