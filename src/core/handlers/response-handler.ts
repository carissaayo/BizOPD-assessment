import type { Response } from "express";


export type ResponseData = {
  message?: string;
} & Record<string, unknown>;

interface ModifiedResponseData {
  statusCode: number;
  status: "success" | "failed";
  message?: string;
  data: Omit<ResponseData, "message">;
  meta: {
    timestamp: Date;
  };
}

export function sendResponse(
  res: Response,
  statusCode: number,
  data: ResponseData,
): Response {
  console.log("RESPONSE HANDLER:", statusCode, data.message);

  const { message, ...newData } = data;
  const status = statusCode >= 200 && statusCode < 400 ? "success" : "failed";

  const modifiedData: ModifiedResponseData = {
    statusCode,
    status,
    message,
    data: newData,
    meta: {
      timestamp: new Date(),

    },
  };

  return res.status(statusCode).json(modifiedData);
}
