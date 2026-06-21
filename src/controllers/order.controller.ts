import type { Request } from "express";
import { Controller } from "../core/handlers/controller";
import { createOrder } from "../services/order/create-order.service";
import type { CreateOrderBody } from "../validation/order.schemas";

export const createOrderHandler = Controller(async (req: Request) => {
  return createOrder(req.body as CreateOrderBody);
}, 201);
