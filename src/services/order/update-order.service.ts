import {
  validateStageTransition,
} from "../../core/constants/stages";
import { HttpError } from "../../core/errors/custom-error-handler";
import { orderRepository } from "../../repositories/order.repository";
import type { UpdateOrderStageBody } from "../../validation/order.schemas";
import { invalidateDashboardCache } from "../dashboard.service";

export async function updateOrderStage(
  orderId: string,
  input: UpdateOrderStageBody,
) {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw HttpError.notFound("Order not found");
  }

  validateStageTransition(order.stage, input.newStage);

  const updatedOrder = await orderRepository.updateStage(
    orderId,
    input.newStage,
  );

  if (!updatedOrder) {
    throw HttpError.notFound("Order not found");
  }

  await invalidateDashboardCache();

  return {
    message: "Order stage updated successfully",
    order: orderRepository.toOrderResponse(updatedOrder),
  };
}
