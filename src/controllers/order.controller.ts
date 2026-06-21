import type { Request } from "express";
import { Controller } from "../core/handlers/controller";
import { createOrder } from "../services/order/create-order.service";
import { updateOrderStage } from "../services/order/update-order.service";
import type {
  CreateOrderBody,
  OrderIdParams,
  UpdateOrderStageBody,
} from "../validation/order.schemas";

export const createOrderHandler = Controller(async (req: Request) => {
  return createOrder(req.body as CreateOrderBody);
}, 201);

export const updateOrderStageHandler = Controller(async (req: Request) => {
  const { id } = req.params as OrderIdParams;

  return updateOrderStage(id, req.body as UpdateOrderStageBody);
});
