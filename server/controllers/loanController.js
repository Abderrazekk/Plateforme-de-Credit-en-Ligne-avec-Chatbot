import Loan from "../models/Loan.js";
import User from "../models/User.js";
import {
  calculerMensualite,
  calculerCoutTotal,
  getTauxInteret,
} from "../utils/loanCalculator.js";
import { calculerPenalite } from "../utils/penaltyCalculator.js";
import { createNotification } from "../utils/createNotification.js";
import {
  sendEmail,
  getLoanStatusEmailTemplate,
  getRepaymentEmailTemplate,
} from "../utils/sendEmail.js";

// @desc    Create a new loan application (client)
// @route   POST /api/loans
// @access  Private (client)
export const createLoan = async (req, res, next) => {
  try {
    // 1. Décoder les objets JSON envoyés depuis le frontend en FormData
    const personalInfo = req.body.personalInfo
      ? JSON.parse(req.body.personalInfo)
      : {};
    const contactInfo = req.body.contactInfo
      ? JSON.parse(req.body.contactInfo)
      : {};
    const employmentInfo = req.body.employmentInfo
      ? JSON.parse(req.body.employmentInfo)
      : {};
    const financialInfo = req.body.financialInfo
      ? JSON.parse(req.body.financialInfo)
      : {};

    const montant = parseFloat(req.body.montant);
    const dureeMois = parseInt(req.body.dureeMois, 10);
    const objet = req.body.objet;

    // NOUVEAU : Calcul dynamique du taux
    const tauxApplique = getTauxInteret(dureeMois);

    // Validation des durées strictes
    const dureesAutorisees = [3, 6, 12, 18, 24, 36, 48, 60];
    if (!dureesAutorisees.includes(dureeMois)) {
      res.status(400);
      throw new Error(
        "Durée non valide. Veuillez sélectionner une durée autorisée (3, 6, 12... mois).",
      );
    }
    const preferredMonthlyPayment =
      parseFloat(req.body.preferredMonthlyPayment) || 0;
    const insuranceSelected = req.body.insuranceSelected === "true";

    // 2. Extraire les fichiers attachés via Multer (req.files)
    const files = req.files || {};

    // Assigner les chemins des fichiers
    const documents = {
      cinRecto: files.cinRecto
        ? `uploads/documents/${files.cinRecto[0].filename}`
        : null,
      cinVerso: files.cinVerso
        ? `uploads/documents/${files.cinVerso[0].filename}`
        : null,
      salarySlips: files.salarySlips
        ? `uploads/documents/${files.salarySlips[0].filename}`
        : null,
      bankStatement: files.bankStatement
        ? `uploads/documents/${files.bankStatement[0].filename}`
        : null,
      workCertificate: files.workCertificate
        ? `uploads/documents/${files.workCertificate[0].filename}`
        : null,
      taxDeclaration: files.taxDeclaration
        ? `uploads/documents/${files.taxDeclaration[0].filename}`
        : null,
      proofOfAddress: files.proofOfAddress
        ? `uploads/documents/${files.proofOfAddress[0].filename}`
        : null,
      businessRegistration: files.businessRegistration
        ? `uploads/documents/${files.businessRegistration[0].filename}`
        : null,
    };

    // 3. Validation de base
    if (!montant || !dureeMois || !objet) {
      res.status(400);
      throw new Error(
        "Veuillez remplir les informations obligatoires du crédit.",
      );
    }
    if (montant < 500 || montant > 100000) {
      res.status(400);
      throw new Error("Le montant doit être compris entre 500 et 100 000 TND.");
    }

    let targetClientId = req.user._id;
    // Si c'est un agent qui soumet, on prend l'ID du client depuis le body
    if (["admin"].includes(req.user.role) && req.body.clientId) {
      targetClientId = req.body.clientId;
    }

    // 4. Enregistrer dans la base de données avec le nouveau schéma
    const loan = await Loan.create({
      client: targetClientId,
      personalInfo,
      contactInfo,
      employmentInfo,
      financialInfo,
      montant,
      dureeMois,
      tauxInteret: tauxApplique,
      objet,
      preferredMonthlyPayment,
      insuranceSelected,
      documents,
      status: "pending",
    });

    try {
      // Trouver tous les agents et admins
      const staffMembers = await User.find({
        role: { $in: ["admin", "agent"] },
      });

      // Récupérer le nom du client qui a fait la demande (utile pour le message)
      const clientRequesting =
        await User.findById(targetClientId).select("nom prenom");
      const clientName = clientRequesting
        ? `${clientRequesting.nom} ${clientRequesting.prenom}`
        : "Un client";

      for (const staff of staffMembers) {
        // Ne pas notifier l'agent si c'est lui-même qui crée la demande pour le client
        if (req.user._id.toString() === staff._id.toString()) continue;

        await createNotification(
          staff._id,
          `Nouvelle demande de crédit soumise par ${clientName} pour un montant de ${montant} TND.`,
          "new_loan",
          `/admin/loans`, // Remplacez par le lien de votre liste de crédits côté admin/agent
        );
      }
    } catch (notifErr) {
      console.error(
        "Erreur lors de l'envoi des notifications au staff:",
        notifErr,
      );
    }

    const mensualite = calculerMensualite(
      loan.montant,
      loan.tauxInteret,
      loan.dureeMois,
    );
    const coutTotal = calculerCoutTotal(mensualite, loan.dureeMois);

    res.status(201).json({
      ...loan.toObject(),
      mensualite,
      coutTotal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all loans for the logged-in client
// @route   GET /api/loans/user
// @access  Private (client)
export const getMyLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ client: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(loans);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific loan (owner or admin)
// @route   GET /api/loans/:id
// @access  Private
export const getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate(
      "client",
      "nom prenom email telephone cin avatar documents documentsVerifies",
    );

    if (!loan) {
      res.status(404);
      throw new Error("Demande de crédit non trouvée");
    }

    if (
      loan.client._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "agent"
    ) {
      res.status(403);
      throw new Error("Non autorisé à voir cette demande");
    }

    const loanObj = loan.toObject();
    const now = new Date();

    loanObj.remboursements = loanObj.remboursements.map((r) => {
      const dueDate = new Date(r.dateEcheance);
      if (r.status === "unpaid" && dueDate < now) {
        return {
          ...r,
          penalite: calculerPenalite(r.montant, r.dateEcheance, now),
        };
      }
      return r;
    });

    res.json(loanObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats for the logged-in client
// @route   GET /api/loans/stats
// @access  Private (client)
export const getClientStats = async (req, res, next) => {
  try {
    const loans = await Loan.find({ client: req.user._id });

    const totalLoans = loans.length;
    const activeLoans = loans.filter((l) => l.status === "active").length;
    const pendingLoans = loans.filter((l) => l.status === "pending").length;
    const totalBorrowed = loans
      .filter((l) => l.status === "active" || l.status === "closed")
      .reduce((sum, l) => sum + l.montant, 0);

    res.json({
      totalLoans,
      activeLoans,
      pendingLoans,
      totalBorrowed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all loans (admin) with optional filters
// @route   GET /api/loans
// @access  Private/Admin
export const getAllLoans = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { nom: { $regex: search, $options: "i" } },
          { prenom: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);
      filter.client = { $in: userIds };
    }

    // FIXED: Added 'avatar' inside fields to populate
    const loans = await Loan.find(filter)
      .populate("client", "nom prenom email telephone cin avatar")
      .populate("reviewedBy", "nom prenom")
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (error) {
    next(error);
  }
};

// @desc    Review a loan (approve/reject)
// @route   PUT /api/loans/:id/review
// @access  Private/Admin/Agent
export const reviewLoan = async (req, res, next) => {
  try {
    const { status, commentaire } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      res.status(400);
      throw new Error(
        "Statut invalide. Valeurs acceptées : approved, rejected",
      );
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404);
      throw new Error("Demande de crédit non trouvée");
    }

    if (loan.status !== "pending") {
      res.status(400);
      throw new Error("Cette demande a déjà été traitée");
    }

    loan.status = status;
    if (commentaire) loan.commentaireAdmin = commentaire;

    loan.reviewedBy = req.user._id;

    if (status === "approved") {
      const { montant, dureeMois, tauxInteret } = loan;
      const mensualite = calculerMensualite(montant, tauxInteret, dureeMois);
      const remboursements = [];
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 30);

      for (let i = 0; i < dureeMois; i++) {
        remboursements.push({
          dateEcheance: new Date(currentDate),
          montant: mensualite,
          status: "unpaid",
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      loan.remboursements = remboursements;
    }

    await loan.save();

    const statusText = status === "approved" ? "approuvée" : "rejetée";

    // 1. Notifier le client
    await createNotification(
      loan.client,
      `Votre demande de crédit de ${loan.montant} TND a été ${statusText}.`,
      status === "approved" ? "loan_approved" : "loan_rejected",
      `/client/loans/${loan._id}`,
    );

    // ==========================================
    // NOUVEAU : NOTIFIER L'ADMIN SI L'AGENT APPROUVE
    // ==========================================
    if (req.user.role === "agent" && status === "approved") {
      try {
        // Trouver tous les administrateurs
        const admins = await User.find({ role: "admin" });

        // Récupérer le nom de l'agent (depuis le token décodé / req.user)
        const agentName =
          `${req.user.nom || ""} ${req.user.prenom || ""}`.trim() || "Un agent";

        // Créer le message avec la référence du crédit et le nom de l'agent
        const messageAdmin = `Le crédit (Réf: ${loan._id}) a été approuvé par l'agent ${agentName}.`;

        // Envoyer la notification à chaque admin
        for (const admin of admins) {
          await createNotification(
            admin._id,
            messageAdmin,
            "other", // Utilise 'other' ou ajoute 'agent_approval' dans ton modèle Notification.js
            `/admin/loans`, // Lien vers le tableau de bord des crédits de l'admin
          );
        }
      } catch (notifErr) {
        console.error("Erreur lors de la notification des admins:", notifErr);
      }
    }
    // ==========================================

    // ==========================================
    // ENVOI AUTOMATIQUE D'EMAIL SMTP
    // ==========================================
    // Extract targets from current loan information
    const clientEmail = loan.contactInfo?.email;
    const clientName = loan.personalInfo?.fullName || "Cher Client";
    const loanAmount = loan.montant;
    const adminComment = loan.commentaireAdmin || "";

    if (clientEmail) {
      const emailSubject =
        status === "approved"
          ? `Félicitations ! Votre demande de crédit de ${loanAmount} TND a été acceptée`
          : `Mise à jour importante concernant votre demande de crédit`;

      const emailHtmlContent = getLoanStatusEmailTemplate(
        clientName,
        loanAmount,
        status,
        adminComment,
        loan._id.toString(),
      );

      // We call the email sending service safely.
      sendEmail({
        to: clientEmail,
        subject: emailSubject,
        html: emailHtmlContent,
      }).catch((err) =>
        console.error("Erreur asynchrone d'envoi d'email:", err),
      );
    } else {
      console.warn(
        `[Warning] Impossible d'envoyer l'email: aucune adresse trouvée pour le crédit ${loan._id}`,
      );
    }
    // ==========================================

    res.json(loan);
  } catch (error) {
    next(error);
  }
};

// @desc    Disburse a loan
// @route   PUT /api/loans/:id/disburse
// @access  Private/Admin
export const disburseLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404);
      throw new Error("Demande de crédit non trouvée");
    }
    if (loan.status !== "approved") {
      res.status(400);
      throw new Error("Seules les demandes approuvées peuvent être décaissées");
    }

    loan.status = "active";
    loan.dateDeboursement = new Date();
    await loan.save();

    await createNotification(
      loan.client,
      `Votre crédit de ${loan.montant} TND a été décaissé et est maintenant en cours.`,
      "loan_disbursed",
      `/client/loans/${loan._id}`,
    );

    res.json(loan);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a specific repayment as paid (admin)
// @route   PUT /api/loans/:id/repayments/:repaymentId/pay
// @access  Private/Admin
export const markRepaymentPaid = async (req, res, next) => {
  try {
    const { id, repaymentId } = req.params;
    const loan = await Loan.findById(id);

    if (!loan) {
      res.status(404);
      throw new Error("Crédit non trouvé");
    }
    if (loan.status !== "active") {
      res.status(400);
      throw new Error("Ce crédit n’est pas en cours");
    }

    const repayment = loan.remboursements.id(repaymentId);
    if (!repayment) {
      res.status(404);
      throw new Error("Échéance non trouvée");
    }
    if (repayment.status === "paid") {
      res.status(400);
      throw new Error("Cette échéance est déjà payée");
    }

    repayment.status = "paid";
    repayment.payeLe = new Date();

    const allPaid = loan.remboursements.every((r) => r.status === "paid");
    if (allPaid) {
      loan.status = "closed";
    }

    await loan.save();

    const dateFormatee = new Date(repayment.dateEcheance).toLocaleDateString(
      "fr-TN",
    );

    await createNotification(
      loan.client,
      `Paiement de ${repayment.montant} TND enregistré pour l'échéance du ${dateFormatee}.`,
      "payment_marked",
      `/client/loans/${loan._id}`,
    );

    // =========================================================
    // NOUVEAU : ENVOI D'EMAIL DE CONFIRMATION DE TRANCHE PAYÉE
    // =========================================================
    const clientEmail = loan.contactInfo?.email;
    const clientName = loan.personalInfo?.fullName || "Cher Client";

    // Calculate how many tranches are left unpaid after this operation
    const remainingTranchesCount = loan.remboursements.filter(
      (r) => r.status === "unpaid",
    ).length;

    if (clientEmail) {
      const emailSubject =
        remainingTranchesCount === 0
          ? `🎉 Confirmation de solde : Votre crédit E-Crédit est entièrement remboursé !`
          : `Reçu de paiement : Échéance enregistrée pour votre crédit (${repayment.montant} TND)`;

      const emailHtmlContent = getRepaymentEmailTemplate(
        clientName,
        repayment.montant,
        dateFormatee,
        remainingTranchesCount,
        loan._id.toString(),
      );

      // Dispatched safely in the background
      sendEmail({
        to: clientEmail,
        subject: emailSubject,
        html: emailHtmlContent,
      }).catch((err) =>
        console.error("Erreur d'envoi d'email de paiement:", err),
      );
    } else {
      console.warn(
        `[Warning] Aucun email trouvé pour envoyer la confirmation de paiement pour le crédit ${loan._id}`,
      );
    }
    // =========================================================

    res.json(loan);
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const pendingLoans = await Loan.countDocuments({ status: "pending" });
    const activeLoans = await Loan.countDocuments({ status: "active" });
    const totalAmountLent = await Loan.aggregate([
      { $match: { status: { $in: ["active", "closed"] } } },
      { $group: { _id: null, total: { $sum: "$montant" } } },
    ]);
    const totalClients = await User.countDocuments({ role: "client" });

    res.json({
      totalLoans,
      pendingLoans,
      activeLoans,
      totalAmountLent:
        totalAmountLent.length > 0 ? totalAmountLent[0].total : 0,
      totalClients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a loan application
// @route   DELETE /api/loans/:id
// @access  Private/Admin/Agent
export const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      res.status(404);
      throw new Error("Demande de crédit non trouvée");
    }

    // Optionnel : Si vous souhaitez également supprimer les fichiers physiques (images/PDF) du serveur,
    // vous pouvez ajouter la logique fs.unlink() ici en utilisant l'objet `loan.documents`.

    await loan.deleteOne();

    res.json({ message: "Demande de crédit supprimée avec succès" });
  } catch (error) {
    next(error);
  }
};
