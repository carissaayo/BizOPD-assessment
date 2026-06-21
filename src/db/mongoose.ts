import mongoose from "mongoose";
import { env } from "../config/env";
import { OrderModel } from "../models/order.model";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let listenersRegistered = false;

function registerConnectionListeners(): void {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });
}

function isRetryableMongoError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("ETIMEOUT") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Server selection timed out")
  );
}

async function attemptConnect(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  await OrderModel.syncIndexes();
}

export async function connectMongo(retryCount = MAX_RETRIES): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  registerConnectionListeners();

  try {
    await attemptConnect();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("DB CONNECTION ERR:", message);

    if (isRetryableMongoError(err)) {
      if (retryCount > 0) {
        console.log(
          `Retrying connection... (Attempt ${MAX_RETRIES - retryCount + 1}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return connectMongo(retryCount - 1);
      }

      console.error(
        `Failed to connect to the database after ${MAX_RETRIES} attempts.`,
      );
      throw new Error("MongoDB connection failed after retries");
    }

    throw err;
  }
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
