import express from "express";
import {
  getClientPaymentHistory,
  getOverdueInstallments,
} from "../controllers/paymentController.js";
import protect from "../middlewares/auth.js";
import authorize from "../middlewares/roleCheck.js";

const router = express.Router();

router.use(protect);
router.get("/history", authorize("client"), getClientPaymentHistory);
router.get("/overdue", authorize("admin"), getOverdueInstallments);

export default router;
