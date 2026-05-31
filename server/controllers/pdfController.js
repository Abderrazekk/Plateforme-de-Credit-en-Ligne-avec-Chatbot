import Loan from "../models/Loan.js";
import {
  generateContractPDF,
  generateSchedulePDF,
  generateReportPDF,
} from "../utils/pdfGenerator.js";
import {
  getAdminStatsData,
  getMonthlyRevenueData,
} from "../services/dashboardService.js";

export const downloadContract = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.loanId).populate("client");
    if (!loan) {
      res.status(404);
      throw new Error("Prêt non trouvé");
    }
    if (
      req.user.role !== "admin" &&
      loan.client._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Non autorisé");
    }
    const pdfBuffer = await generateContractPDF(loan, loan.client);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=contrat-${loan._id}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const downloadSchedule = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.loanId).populate("client");
    if (!loan) {
      res.status(404);
      throw new Error("Prêt non trouvé");
    }

    // CORRECTION ICI : On autorise 'admin' ET 'agent'
    if (
      req.user.role !== "admin" &&
      req.user.role !== "agent" &&
      loan.client._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Non autorisé de télécharger ce fichier");
    }

    const pdfBuffer = await generateSchedulePDF(loan, loan.client);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=echeancier-${loan._id}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const downloadReport = async (req, res, next) => {
  try {
    const [stats, monthlyRevenue] = await Promise.all([
      getAdminStatsData(),
      getMonthlyRevenueData(),
    ]);
    const pdfBuffer = await generateReportPDF(stats, monthlyRevenue);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=rapport-statistique.pdf",
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
