import { Router } from "express";
import {
  createOrderHandler,
  getOrdersHandler,
  updateOrderStageHandler,
} from "../controllers/order.controller";
import { validate } from "../core/middleware/validate";
import {
  createOrderBodySchema,
  orderIdParamsSchema,
  searchOrdersQuerySchema,
  updateOrderStageBodySchema,
} from "../validation/order.schemas";

const router = Router();

router.get(
  "/",
  validate({ query: searchOrdersQuerySchema }),
  getOrdersHandler,
);

router.post(
  "/",
  validate({ body: createOrderBodySchema }),
  createOrderHandler,
);

router.patch(
  "/:id/stage",
  validate({
    params: orderIdParamsSchema,
    body: updateOrderStageBodySchema,
  }),
  updateOrderStageHandler,
);

export default router;
