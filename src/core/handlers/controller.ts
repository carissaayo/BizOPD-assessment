import type { Request, Response, RequestHandler } from "express";
import { sendResponse, type ResponseData } from "./response-handler";
import { tryCatch } from "./try-handler";

type ControllerHandler = (
  req: Request,
  res: Response,
) => Promise<ResponseData>;

export function Controller(
  handler: ControllerHandler,
  statusCode = 200,
): RequestHandler {
  return tryCatch(async (req, res) => {
    const responseData = await handler(req, res);
    sendResponse(res, statusCode, responseData);
  });
}
