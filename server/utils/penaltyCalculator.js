// Penalty rate: 5% per month on overdue amount (Tunisian standard)
const MONTHLY_PENALTY_RATE = 0.05;

export const calculerPenalite = (montantEcheance, dateEcheance, datePaiement = new Date()) => {
  const dueDate = new Date(dateEcheance);
  const today = datePaiement;
  if (today <= dueDate) return 0;
  const diffMs = today - dueDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 0;
  // monthly penalty for the fraction of month overdue
  const monthsOverdue = diffDays / 30;
  const penalty = montantEcheance * MONTHLY_PENALTY_RATE * monthsOverdue;
  return Math.round(penalty * 1000) / 1000; // 3 decimals for millimes
};