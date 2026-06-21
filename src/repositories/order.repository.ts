import type { Stage } from "../core/constants/stages";
import {
  DBQuery,
  DBQueryCount,
  type QueryString,
} from "../core/db/db-query";
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

function toQueryString(options: SearchOrdersOptions): QueryString {
  return {
    search: options.search,
    page: String(options.page),
    limit: String(options.limit),
  };
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
  const queryString = toQueryString(options);
  const limit = Math.min(options.limit, 100);

  const dbQuery = new DBQuery(OrderModel.find(), queryString);
  dbQuery.filter().sort().limitFields().paginate();

  const [orders, total] = await Promise.all([
    dbQuery.query,
    new DBQueryCount(OrderModel.find(), queryString).countDocuments(),
  ]);

  return {
    orders: orders.map(toOrderResponse),
    total,
    page: dbQuery.page,
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
