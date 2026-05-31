import express from "express";
import {
  createLoan,
  getMyLoans,
  getLoanById,
  getClientStats,
  getAllLoans,
  reviewLoan,
  getAdminStats,
  disburseLoan,
  markRepaymentPaid,
  deleteLoan,
} from "../controllers/loanController.js";
import protect from "../middlewares/auth.js";
import authorize from "../middlewares/roleCheck.js";
import { uploadLoanDocuments } from "../middlewares/upload.js"; // Import du nouveau middleware

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin routes (already protected by `router.use(protect)`)
router.get("/", authorize("admin"), getAllLoans);
router.put("/:id/review", authorize("admin"), reviewLoan);
router.get("/admin/stats", authorize("admin"), getAdminStats);
router.put("/:id/disburse", authorize("admin"), disburseLoan);
router.put(
  "/:id/repayments/:repaymentId/pay",
  authorize("admin"),
  markRepaymentPaid,
);
router.delete("/:id", authorize("admin"), deleteLoan);

// Client routes
// NOUVEAU : Ajout de `uploadLoanDocuments` pour intercepter les fichiers
router.post("/", authorize("client", "admin"), uploadLoanDocuments, createLoan);
router.get("/user", authorize("client"), getMyLoans);
router.get("/stats", authorize("client"), getClientStats);

// Shared route (client or admin)
router.get("/:id", getLoanById);

export default router;
