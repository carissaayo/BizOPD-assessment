import type { NextFunction, Request, RequestHandler, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";

type SanitizeOptions = {
  replaceWith?: string;
  onSanitize?: (params: { req: Request; key: string }) => void;
  dryRun?: boolean;
};

const REQUEST_PARTS = ["body", "params", "headers"] as const;

/**
 * Express 5 makes `req.query` read-only. The default mongo-sanitize middleware
 * reassigns `req.query`, which throws. Query is sanitized in place instead.
 */
export function createMongoSanitizeMiddleware(
  options: SanitizeOptions = {},
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const key of REQUEST_PARTS) {
      const value = req[key];
      if (value && typeof value === "object") {
        req[key] = mongoSanitize.sanitize(value, options);
      }
    }

    if (req.query && typeof req.query === "object") {
      mongoSanitize.sanitize(req.query, options);
    }

    next();
  };
}
