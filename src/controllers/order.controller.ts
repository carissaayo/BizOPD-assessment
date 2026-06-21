import type { Request } from "express";
import { Controller } from "../core/handlers/controller";
import { createOrder } from "../services/order/create-order.service";
import { getOrders } from "../services/order/get-orders.service";
import { updateOrderStage } from "../services/order/update-order.service";
import type {
  CreateOrderBody,
  OrderIdParams,
  SearchOrdersQuery,
  UpdateOrderStageBody,
} from "../validation/order.schemas";

export const createOrderHandler = Controller(async (req: Request) => {
  return createOrder(req.body as CreateOrderBody);
}, 201);

export const getOrdersHandler = Controller(async (req: Request) => {
  return getOrders(req.query as unknown as SearchOrdersQuery);
});

export const updateOrderStageHandler = Controller(async (req: Request) => {
  const { id } = req.params as OrderIdParams;

  return updateOrderStage(id, req.body as UpdateOrderStageBody);
});
