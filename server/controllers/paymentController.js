import Loan from '../models/Loan.js';
import { calculerPenalite } from '../utils/penaltyCalculator.js';

// @desc    Get all paid installments for the logged-in client (history)
// @route   GET /api/payments/history
// @access  Private (client)
export const getClientPaymentHistory = async (req, res, next) => {
  try {
    const loans = await Loan.find({ client: req.user._id, status: { $in: ['active', 'closed'] } })
      .select('remboursements objet montant')
      .lean();
    const payments = [];
    loans.forEach(loan => {
      if (loan.remboursements) {
        loan.remboursements.forEach(r => {
          if (r.status === 'paid') {
            payments.push({
              loanId: loan._id,
              objet: loan.objet,
              montant: r.montant,
              dateEcheance: r.dateEcheance,
              datePaiement: r.payeLe,
              penalite: r.penalite || 0,
              justificatif: r.justificatifPaiement || ''
            });
          }
        });
      }
    });
    payments.sort((a, b) => new Date(b.datePaiement) - new Date(a.datePaiement));
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all overdue installments (admin)
// @route   GET /api/payments/overdue
// @access  Private (admin)
export const getOverdueInstallments = async (req, res, next) => {
  try {
    const loans = await Loan.find({ status: 'active' })
      .populate('client', 'nom prenom email telephone')
      .lean();
    const overdue = [];
    const now = new Date();
    loans.forEach(loan => {
      if (loan.remboursements) {
        loan.remboursements.forEach(r => {
          if (r.status === 'unpaid' && new Date(r.dateEcheance) < now) {
            overdue.push({
              _id: r._id,
              loanId: loan._id,
              client: loan.client,
              objet: loan.objet,
              montant: r.montant,
              dateEcheance: r.dateEcheance,
              joursRetard: Math.floor((now - new Date(r.dateEcheance)) / (1000 * 60 * 60 * 24)),
              penalite: calculerPenalite(r.montant, r.dateEcheance, now)
            });
          }
        });
      }
    });
    // sort by days overdue descending
    overdue.sort((a, b) => b.joursRetard - a.joursRetard);
    res.json(overdue);
  } catch (error) {
    next(error);
  }
};