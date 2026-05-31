/**
 * Détermine le taux d'intérêt selon la durée choisie
 * @param {number} dureeMois - Durée en mois
 * @returns {number} Taux d'intérêt annuel
 */
export const getTauxInteret = (dureeMois) => {
  const duree = parseInt(dureeMois, 10);
  if (duree <= 3) return 8.0;   // 3 mois
  if (duree <= 6) return 10.0;  // 6 mois
  if (duree <= 12) return 12.0; // 12 mois
  if (duree <= 18) return 13.0; // 18 mois
  if (duree <= 24) return 14.0; // 24 mois
  if (duree <= 36) return 15.0; // 36 mois
  if (duree <= 48) return 15.5; // 48 mois
  return 16.0;                  // 60 mois
};

export const calculerMensualite = (montant, tauxAnnuel, dureeMois) => {
  if (dureeMois <= 0 || montant <= 0) return 0;
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const mensualite = 
    (montant * tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) /
    (Math.pow(1 + tauxMensuel, dureeMois) - 1);
  return Math.round(mensualite * 100) / 100;
};

export const calculerCoutTotal = (mensualite, dureeMois) => {
  return Math.round(mensualite * dureeMois * 100) / 100;
};