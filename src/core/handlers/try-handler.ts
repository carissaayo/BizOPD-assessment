import type { NextFunction, Request, Response, RequestHandler } from "express";
import { ThrowException } from "../errors/custom-error-handler";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function tryCatch(func: AsyncHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    func(req, res, next).catch((err: Error | ThrowException) => {
      if (err instanceof ThrowException) {
        next(err);
      } else {
        next(err);
      }
    });
  };
}
