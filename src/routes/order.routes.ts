import { Router } from "express";
import {
  createOrderHandler,
  updateOrderStageHandler,
} from "../controllers/order.controller";
import { validate } from "../core/middleware/validate";
import {
  createOrderBodySchema,
  orderIdParamsSchema,
  updateOrderStageBodySchema,
} from "../validation/order.schemas";

const router = Router();

router.post(
  "/",
  validate({ body: createOrderBodySchema }),
  createOrderHandler,
);

router.patch(
  "/:id",
  validate({
    params: orderIdParamsSchema,
    body: updateOrderStageBodySchema,
  }),
  updateOrderStageHandler,
);

export default router;
