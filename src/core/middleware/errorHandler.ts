import type { NextFunction, Request, Response } from "express";
import { ErrorCode, HttpError, ThrowException } from "../errors/custom-error-handler";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ThrowException) {
    const body: Record<string, unknown> = {
      status: err.status,
      message: err.message,
    };

    if (err.errorCode) {
      body.errorCode = err.errorCode;
    }

    if (err.data) {
      body.data = err.data;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  console.error("Unexpected error:", err);

  const internalError = HttpError.internalServerError();
  res.status(internalError.statusCode).json({
    status: internalError.status,
    message: internalError.message,
    errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
  });
}
