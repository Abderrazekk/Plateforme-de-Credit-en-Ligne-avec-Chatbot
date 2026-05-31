import express from "express";
import {
  downloadContract,
  downloadSchedule,
  downloadReport,
} from "../controllers/pdfController.js";
import protect from "../middlewares/auth.js";
import authorize from "../middlewares/roleCheck.js";

const router = express.Router();

router.use(protect);

router.get("/contract/:loanId", downloadContract);
router.get("/schedule/:loanId", downloadSchedule);
router.get("/report", authorize("admin"), downloadReport);

export default router;
