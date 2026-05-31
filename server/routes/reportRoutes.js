import express from "express";
import {
  getReportSummary,
  getMonthlyLoans,
  getStatusDistribution,
} from "../controllers/reportController.js";
import protect from "../middlewares/auth.js";
import authorize from "../middlewares/roleCheck.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/summary", getReportSummary);
router.get("/monthly", getMonthlyLoans);
router.get("/status", getStatusDistribution);

export default router;
