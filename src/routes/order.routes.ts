import { Router } from "express";
import { createOrderHandler } from "../controllers/order.controller";
import { validate } from "../core/middleware/validate";
import { createOrderBodySchema } from "../validation/order.schemas";

const router = Router();

router.post(
  "/",
  validate({ body: createOrderBodySchema }),
  createOrderHandler,
);

export default router;
