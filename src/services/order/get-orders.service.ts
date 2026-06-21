import { orderRepository } from "../../repositories/order.repository";
import type { SearchOrdersQuery } from "../../validation/order.schemas";

export async function getOrders(query: SearchOrdersQuery) {
  const result = await orderRepository.search({
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

  return {
    message: query.search
      ? "Orders retrieved successfully"
      : "All orders retrieved successfully",
    orders: result.orders,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit) || 0,
    },
  };
}
