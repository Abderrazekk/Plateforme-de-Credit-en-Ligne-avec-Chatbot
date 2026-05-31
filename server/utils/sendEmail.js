// server/utils/sendEmail.js
import nodemailer from "nodemailer";

/**
 * Utility to send professional transactional emails via SMTP
 * @param {Object} options - Email configurations (to, subject, html)
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "E-Crédit"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email envoyé avec succès: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[SMTP Error] Échec de l'envoi de l'email:", error);
    // We don't throw the error here so that a failing email server 
    // doesn't crash or block the main administrative database operations.
  }
};

/**
 * Generates a clean corporate HTML template for Loan Status updates
 */
export const getLoanStatusEmailTemplate = (clientName, loanAmount, status, comment, loanId) => {
  const isApproved = status === "approved";
  const primaryColor = isApproved ? "#10B981" : "#EF4444"; // Green vs Red
  const statusLabel = isApproved ? "APPROUVÉE" : "REJETÉE";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mise à jour de votre demande de crédit</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB;">
        
        <div style="background-color: #1E3A8A; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">E-CRÉDIT EN LIGNE</h1>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Bonjour <strong>${clientName}</strong>,</p>
          
          <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            Nous vous informons que notre comité d'analyse financière a examiné votre demande de crédit référencée sous le numéro <code style="background-color: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">#${loanId.slice(-8).toUpperCase()}</code>.
          </p>

          <div style="margin: 30px 0; padding: 20px; border-left: 4px solid ${primaryColor}; background-color: #F9FAFB; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280; font-weight: 600; uppercase; tracking-wider;">Statut de la demande :</p>
            <p style="margin: 0 0 12px 0; font-size: 18px; color: ${primaryColor}; font-weight: 800;">${statusLabel}</p>
            <p style="margin: 0; font-size: 15px; color: #1F2937;">Montant du dossier : <strong>${loanAmount.toLocaleString('fr-TN')} TND</strong></p>
          </div>

          ${comment ? `
            <div style="margin-bottom: 30px; padding: 15px; background-color: #F0F4F8; border-radius: 8px; font-size: 14px; color: #334155; border: 1px solid #E2E8F0;">
              <strong style="color: #1E3A8A; display: block; margin-bottom: 5px;">Note de l'analyste :</strong>
              <p style="margin: 0; font-style: italic; white-space: pre-wrap;">"${comment}"</p>
            </div>
          ` : ''}

          <p style="font-size: 14px; color: #4B5563; line-height: 1.5; margin-bottom: 30px;">
            ${isApproved 
              ? "Votre dossier est prêt pour l'étape suivante. Notre équipe administrative procèdera prochainement au décaissement officiel des fonds sur le RIB lié à votre compte." 
              : "Si vous estimez que des informations cruciales ont été omises ou si votre situation financière évolue, vous pouvez soumettre un nouveau dossier mis à jour depuis votre espace client."}
          </p>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/client/loans/${loanId}" 
               style="background-color: #1E3A8A; color: #FFFFFF; text-decoration: none; padding: 12px 25px; font-weight: bold; font-size: 14px; border-radius: 6px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);">
              Accéder à mon Espace Client
            </a>
          </div>
        </div>

        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
          Ce message est automatisé, merci de ne pas y répondre directement.<br>
          &copy; ${new Date().getFullYear()} E-Crédit Application Web. Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates a corporate HTML template for Loan Repayment confirmations
 */
export const getRepaymentEmailTemplate = (clientName, amountPaid, dateEcheance, remainingTranches, loanId) => {
  const isFullySettled = remainingTranches === 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de paiement - E-Crédit</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB;">
        
        <div style="background-color: #10B981; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">PAIEMENT ENREGISTRÉ</h1>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Bonjour <strong>${clientName}</strong>,</p>
          
          <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            Nous vous confirmons la bonne réception de votre règlement concernant l'échéance de votre crédit réf. <code style="background-color: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">#${loanId.slice(-8).toUpperCase()}</code>.
          </p>

          <div style="margin: 30px 0; padding: 20px; background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Montant encaissé :</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #111827;">${amountPaid.toLocaleString('fr-TN')} TND</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Échéance du :</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #4B5563;">${dateEcheance}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0 0; color: #6B7280; border-t: 1px solid #F3F4F6; font-weight: 600;">Statut du compte :</td>
                <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; color: ${isFullySettled ? '#10B981' : '#3B82F6'};">
                  ${isFullySettled ? 'CRÉDIT CLÔTURÉ' : 'EN COURS'}
                </td>
              </tr>
            </table>
          </div>

          ${isFullySettled ? `
            <div style="padding: 15px; background-color: #ECFDF5; border-left: 4px solid #10B981; color: #065F46; border-radius: 4px; font-size: 14px; line-height: 1.5; margin-bottom: 30px;">
              🎉 <strong>Félicitations !</strong> Vous avez remboursé l'intégralité de votre crédit. Votre dossier est désormais clôturé avec succès auprès de notre établissement. Merci de votre confiance.
            </div>
          ` : `
            <div style="padding: 15px; background-color: #EFF6FF; border-left: 4px solid #3B82F6; color: #1E40AF; border-radius: 4px; font-size: 14px; line-height: 1.5; margin-bottom: 30px;">
              ℹ️ Il vous reste encore <strong>${remainingTranches} mensualité(s)</strong> à honorer pour solder définitivement ce plan de financement.
            </div>
          `}

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/client/loans/${loanId}" 
               style="background-color: #1E3A8A; color: #FFFFFF; text-decoration: none; padding: 12px 25px; font-weight: bold; font-size: 14px; border-radius: 6px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);">
              Voir mon tableau d'amortissement
            </a>
          </div>
        </div>

        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
          Ce courriel est généré automatiquement par notre système de facturation centralisé.<br>
          &copy; ${new Date().getFullYear()} E-Crédit Tunisie. Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
  `;
};