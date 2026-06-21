import { z } from "zod";
import { INITIAL_STAGE, STAGES } from "../core/constants/stages";

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^[\d+\-\s()]+$/, "Invalid phone number format");

const nonEmptyString = (field: string) =>
  z.string().trim().min(1, `${field} is required`);

export const createOrderBodySchema = z.strictObject({
  customerName: nonEmptyString("Customer name"),
  phone: phoneSchema,
  product: nonEmptyString("Product"),
  stage: z.literal(INITIAL_STAGE, {
    error: `Stage can only be "${INITIAL_STAGE}" while creating an order`,
  }).default(INITIAL_STAGE),
});

export const updateOrderStageBodySchema = z.strictObject({
  newStage: z.enum(STAGES, {
    error: "Invalid stage",
  }),
});

export const orderIdParamsSchema = z.strictObject({
  id: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Invalid order ID"),
});

export const searchOrdersQuerySchema = z.strictObject({
  search: z.string().trim().min(1, "Search term cannot be empty").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, "Limit cannot exceed 100")
    .optional()
    .default(20),
});

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type UpdateOrderStageBody = z.infer<typeof updateOrderStageBodySchema>;
export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type SearchOrdersQuery = z.infer<typeof searchOrdersQuerySchema>;
