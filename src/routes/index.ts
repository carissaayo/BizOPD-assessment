import { Router } from "express";
import orderRoutes from "./order.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/orders", orderRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
