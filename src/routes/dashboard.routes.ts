import { Router } from "express";
import { getDashboardHandler } from "../controllers/dashboard.controller";

const router = Router();

router.get("/", getDashboardHandler);

export default router;
