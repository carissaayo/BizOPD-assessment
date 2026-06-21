import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { sendResponse, type ResponseData } from "../handlers/response-handler";
import { HttpError, ThrowException } from "../errors/custom-error-handler";
import {
  isMongoDBErrorMessage,
  processMongoDBError,
} from "../errors/mongodb-errors-handler";

export function setupUnhandledExceptionHandlers(): void {
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error.message);
    console.error(error.stack);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    console.error("Unhandled Rejection:", error.message);
    console.error(error.stack);
  });

  process.on("warning", (warning: Error) => {
    console.warn("Process Warning:", warning.name, warning.message);
  });
}

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    HttpError.notFound(`Can't find ${req.originalUrl} on this server!`),
  );
}

function buildThrowExceptionPayload(err: ThrowException): ResponseData {
  const payload: ResponseData = { message: err.message };

  if (err.errorCode) {
    payload.errorCode = err.errorCode;
  }

  if (err.data !== undefined && err.data !== null) {
    if (typeof err.data === "object" && !Array.isArray(err.data)) {
      Object.assign(payload, err.data);
    } else {
      payload.details = err.data;
    }
  }

  return payload;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ThrowException) {
    sendResponse(res, err.statusCode, buildThrowExceptionPayload(err));
    return;
  }

  if (!(err instanceof Error)) {
    sendResponse(
      res,
      500,
      env.NODE_ENV === "production"
        ? { message: "An unexpected error occurred" }
        : { message: String(err) },
    );
    return;
  }

  let statusCode = 500;
  let message = err.message || "Internal Server Error";
  let data: Record<string, unknown> = {};

  if (isMongoDBErrorMessage(message)) {
    const processed = processMongoDBError(message, statusCode);
    message = processed.message;
    statusCode = processed.statusCode;
  } else {
    console.error("Unexpected Error:", err.message);
    console.error(err.stack);

    if (env.NODE_ENV === "production") {
      message = "An unexpected error occurred";
      data = {};
    }
  }

  sendResponse(res, statusCode, { message, ...data });
}
