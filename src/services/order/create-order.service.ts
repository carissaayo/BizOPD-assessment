import { INITIAL_STAGE } from "../../core/constants/stages";
import { orderRepository } from "../../repositories/order.repository";
import type { CreateOrderBody } from "../../validation/order.schemas";
import { invalidateDashboardCache } from "../dashboard/dashboard.service";

export async function createOrder(input: CreateOrderBody) {
  const order = await orderRepository.create({
    customerName: input.customerName,
    phone: input.phone,
    product: input.product,
    stage: input.stage ?? INITIAL_STAGE,
  });

  await invalidateDashboardCache();

  return {
    message: "Order created successfully",
    order: orderRepository.toOrderResponse(order),
  };
}
