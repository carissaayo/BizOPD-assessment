import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, type ZodType } from "zod";
import { HttpError } from "../errors/custom-error-handler";

type RequestProperty = "body" | "params" | "query";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "request";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function assignParsedRequestProperty(
  req: Request,
  property: RequestProperty,
  data: unknown,
): void {
  if (property === "query") {
    const query = req.query as Record<string, unknown>;

    for (const key of Object.keys(query)) {
      delete query[key];
    }

    Object.assign(query, data);
    return;
  }

  if (property === "params") {
    Object.assign(req.params, data);
    return;
  }

  req.body = data;
}

function parseRequestProperty(
  req: Request,
  property: RequestProperty,
  schema: ZodType,
): void {
  const result = schema.safeParse(req[property]);

  if (!result.success) {
    throw HttpError.badRequest(formatZodError(result.error), {
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join(".") || property,
        message: issue.message,
      })),
    });
  }

  assignParsedRequestProperty(req, property, result.data);
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        parseRequestProperty(req, "body", schemas.body);
      }

      if (schemas.params) {
        parseRequestProperty(req, "params", schemas.params);
      }

      if (schemas.query) {
        parseRequestProperty(req, "query", schemas.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
