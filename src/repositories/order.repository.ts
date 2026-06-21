import type { Stage } from "../core/constants/stages";
import {
  OrderModel,
  type IOrder,
  type OrderDocument,
} from "../models/order.model";

export type OrderFilter = {
  stage?: Stage;
  $or?: Array<{ customerName: RegExp } | { phone: RegExp }>;
};

export type CreateOrderInput = Pick<
  IOrder,
  "customerName" | "phone" | "product" | "stage"
>;

export type SearchOrdersOptions = {
  search?: string;
  page: number;
  limit: number;
};

export type SearchOrdersResult = {
  orders: ReturnType<OrderDocument["toJSON"]>[];
  total: number;
  page: number;
  limit: number;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toOrderResponse(order: OrderDocument) {
  return order.toJSON();
}

async function create(input: CreateOrderInput): Promise<OrderDocument> {
  return OrderModel.create({
    customerName: input.customerName,
    phone: input.phone,
    product: input.product,
    stage: input.stage,
  });
}

async function findById(id: string): Promise<OrderDocument | null> {
  return OrderModel.findById(id);
}

async function search(
  options: SearchOrdersOptions,
): Promise<SearchOrdersResult> {
  const { search, page, limit } = options;
  const filter: OrderFilter = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ customerName: regex }, { phone: regex }];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    OrderModel.countDocuments(filter),
  ]);

  return {
    orders: orders.map(toOrderResponse),
    total,
    page,
    limit,
  };
}

async function updateStage(
  id: string,
  stage: Stage,
): Promise<OrderDocument | null> {
  return OrderModel.findByIdAndUpdate(
    id,
    { stage },
    { new: true, runValidators: true },
  );
}

async function count(filter: OrderFilter = {}): Promise<number> {
  return OrderModel.countDocuments(filter);
}

export const orderRepository = {
  create,
  findById,
  search,
  updateStage,
  count,
  toOrderResponse,
};
