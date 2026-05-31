import express from "express";
import {
  getAdminStats,
  getMonthlyRevenue,
} from "../controllers/dashboardController.js";
import protect from "../middlewares/auth.js";
import authorize from "../middlewares/roleCheck.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/admin", getAdminStats);
router.get("/monthly-revenue", getMonthlyRevenue);

export default router;
