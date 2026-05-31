import PDFDocument from "pdfkit";

// Format TND (Dinars Tunisiens)
const formatTND = (amount) => {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
  }).format(amount);
};

// ---------- LOAN CONTRACT (CONTRAT) ----------
export const generateContractPDF = (loan, client) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  const endPromise = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(buffers))),
  );

  // En-tête plateforme
  doc
    .fillColor("#2563eb")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("E-CRÉDIT", { align: "center" });
  doc
    .fillColor("#6b7280")
    .fontSize(10)
    .font("Helvetica")
    .text("Le partenaire de votre financement digital", { align: "center" });
  doc.moveDown(2);

  doc
    .fillColor("#111827")
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("CONTRAT DE CRÉDIT", { align: "center", underline: true });
  doc.moveDown();
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Date : ${new Date().toLocaleDateString("fr-TN")}`, {
      align: "right",
    });
  doc.moveDown();

  // Parties
  doc.fontSize(14).font("Helvetica-Bold").text("Entre les soussignés :");
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(
      `La plateforme E-CRÉDIT (CréditTunisie), ci-après dénommé "le prêteur"`,
    );

  const clientName =
    loan.personalInfo?.fullName || `${client.nom} ${client.prenom}`;
  const clientCIN = loan.personalInfo?.cin || client.cin || "N/A";
  doc.text(
    `Et M./Mme ${clientName}, titulaire de la CIN n° ${clientCIN}, ci-après dénommé "l'emprunteur"`,
  );
  doc.moveDown();

  // Détails du prêt
  doc.fontSize(14).font("Helvetica-Bold").text("Objet du contrat");
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Type de crédit : ${loan.objet || "Non spécifié"}`);
  doc.text(`Montant emprunté : ${formatTND(loan.montant)}`);
  doc.text(`Durée : ${loan.dureeMois} mois`);
  doc.text(`Taux d'intérêt annuel : ${loan.tauxInteret} %`);
  doc.moveDown();

  // Termes et Conditions
  doc.fontSize(14).font("Helvetica-Bold").text("Conditions générales");
  doc
    .fontSize(11)
    .font("Helvetica")
    .text(
      "1. L'emprunteur s'engage à rembourser le montant emprunté selon l'échéancier généré par la plateforme E-Crédit.",
    )
    .moveDown(0.5)
    .text(
      "2. En cas de retard de paiement, des pénalités pourront être appliquées conformément à la législation en vigueur.",
    )
    .moveDown(0.5)
    .text(
      "3. Le prêteur se réserve le droit de vérifier l'authenticité de tous les documents fournis dans le dossier.",
    );
  doc.moveDown(3);

  // Signatures
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Signatures (à précéder de la mention 'Lu et approuvé') :");
  doc.moveDown(2);
  doc.text("Le prêteur :", 50, doc.y);
  doc.text("L'emprunteur :", 400, doc.y);

  doc.end();
  return endPromise;
};

// ---------- REPAYMENT SCHEDULE (ÉCHÉANCIER MAGNIFIQUE) ----------
export const generateSchedulePDF = (loan, client) => {
  // bufferPages: true permet de revenir en arrière pour ajouter les numéros de page à la fin
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    layout: "landscape",
    bufferPages: true,
  });
  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  const endPromise = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(buffers))),
  );

  // --- EN-TÊTE DE LA PLATEFORME ---
  doc
    .fillColor("#2563eb")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("E-CRÉDIT", 50, 50);
  doc
    .fillColor("#6b7280")
    .fontSize(10)
    .font("Helvetica")
    .text("Plateforme 100% Digitale de Financement", 50, 75)
    .text("contact@e-credit.tn | +216 71 123 456", 50, 90);

  doc
    .fillColor("#111827")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(
      `Date d'édition : ${new Date().toLocaleDateString("fr-TN")}`,
      500,
      50,
      { align: "right", width: 290 },
    );
  doc
    .fillColor("#64748b")
    .font("Helvetica")
    .text(
      `Réf Dossier : #${loan._id.toString().slice(-8).toUpperCase()}`,
      500,
      65,
      { align: "right", width: 290 },
    );

  doc.moveDown(2);

  // --- BLOC INFORMATIONS (Client & Crédit) ---
  // Dessin des rectangles gris de fond
  doc.rect(50, 120, 360, 85).fillAndStroke("#f8fafc", "#e2e8f0");
  doc.rect(430, 120, 360, 85).fillAndStroke("#f8fafc", "#e2e8f0");

  doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(12);
  doc.text("Informations du Client", 65, 135);
  doc.text("Détails du Crédit", 445, 135);

  doc.font("Helvetica").fontSize(10).fillColor("#475569");

  // Extraction robuste des données client
  const clientName =
    loan.personalInfo?.fullName || `${client.nom} ${client.prenom}`;
  const clientCIN = loan.personalInfo?.cin || client.cin || "N/A";
  const clientPhone = loan.contactInfo?.phone || client.telephone || "N/A";

  doc.text(`Nom Complet : ${clientName}`, 65, 155);
  doc.text(`Numéro CIN : ${clientCIN}`, 65, 170);
  doc.text(`Contact : ${clientPhone}  |  ${client.email}`, 65, 185);

  doc.text(`Objet : ${loan.objet || "Financement"}`, 445, 155);
  doc.text(`Montant accordé : ${formatTND(loan.montant)}`, 445, 170);
  doc.text(
    `Durée : ${loan.dureeMois} mois   |   Taux : ${loan.tauxInteret}% fixe`,
    445,
    185,
  );

  let y = 230;

  // --- TITRE DU TABLEAU ---
  doc
    .fillColor("#111827")
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("TABLEAU D'AMORTISSEMENT DÉTAILLÉ", 50, y, {
      align: "center",
      width: 742,
    });
  y += 30;

  // --- FONCTION POUR DESSINER L'EN-TÊTE DU TABLEAU ---
  const drawTableHeader = (startY) => {
    doc.rect(50, startY, 740, 25).fill("#f1f5f9"); // Fond de l'en-tête
    doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(10);
    // Coordonnées X fixes pour chaque colonne
    doc.text("N°", 60, startY + 7);
    doc.text("Date d'échéance", 120, startY + 7);
    doc.text("Mensualité", 250, startY + 7);
    doc.text("Pénalité de retard", 380, startY + 7);
    doc.text("Statut", 530, startY + 7);
    doc.text("Date de règlement", 640, startY + 7);
    return startY + 25;
  };

  y = drawTableHeader(y);

  // --- BOUCLE SUR LES TRANCHES DE REMBOURSEMENT ---
  if (loan.remboursements && loan.remboursements.length > 0) {
    loan.remboursements.forEach((r, idx) => {
      // Gestion de la création d'une nouvelle page si on arrive en bas (marge inférieure)
      if (y > 500) {
        doc.addPage();
        y = 50;
        y = drawTableHeader(y);
      }

      doc.fillColor("#334155").font("Helvetica").fontSize(10);

      // Colonne 1 : Numéro
      doc.text(`${idx + 1}`, 60, y + 8);

      // Colonne 2 : Date échéance
      doc.text(
        new Date(r.dateEcheance).toLocaleDateString("fr-TN"),
        120,
        y + 8,
      );

      // Colonne 3 : Mensualité (En gras)
      doc
        .font("Helvetica-Bold")
        .text(formatTND(r.montant), 250, y + 8)
        .font("Helvetica");

      // Colonne 4 : Pénalité (En rouge s'il y en a)
      if (r.penalite > 0) {
        doc
          .fillColor("#ef4444")
          .text(formatTND(r.penalite), 380, y + 8)
          .fillColor("#334155");
      } else {
        doc.text("-", 380, y + 8);
      }

      // Colonne 5 : Statut (Vert ou Rouge)
      if (r.status === "paid") {
        doc
          .fillColor("#16a34a")
          .font("Helvetica-Bold")
          .text("✓ Payé", 530, y + 8);
      } else {
        doc
          .fillColor("#ef4444")
          .font("Helvetica-Bold")
          .text("✕ Impayé", 530, y + 8);
      }

      // Colonne 6 : Date règlement
      doc.fillColor("#64748b").font("Helvetica");
      doc.text(
        r.payeLe
          ? new Date(r.payeLe).toLocaleDateString("fr-TN")
          : "En attente",
        640,
        y + 8,
      );

      // Ligne séparatrice grise claire sous chaque rangée
      doc
        .moveTo(50, y + 25)
        .lineTo(790, y + 25)
        .lineWidth(0.5)
        .strokeColor("#cbd5e1")
        .stroke();

      y += 25; // On descend pour la ligne suivante
    });
  } else {
    doc.text(
      "L'échéancier sera généré après validation du crédit.",
      50,
      y + 15,
    );
  }

  // --- PIED DE PAGE AUTOMATIQUE (SUR TOUTES LES PAGES) ---
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fillColor("#94a3b8")
      .fontSize(8)
      .font("Helvetica")
      .text(
        "Ce document est généré informatiquement par la plateforme E-Crédit et tient lieu de justificatif officiel.",
        50,
        550,
        { align: "center", width: 742 },
      );
    doc.text(`Page ${i + 1} sur ${pages.count}`, 50, 565, {
      align: "center",
      width: 742,
    });
  }

  doc.end();
  return endPromise;
};

// ---------- STATISTICAL REPORT (RAPPORT ADMIN) ----------
export const generateReportPDF = async (stats, monthlyRevenue) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  const endPromise = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(buffers))),
  );

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("#2563eb")
    .text("E-CRÉDIT", { align: "center" });
  doc
    .fontSize(16)
    .fillColor("#111827")
    .text("Rapport Statistique Financier", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(10)
    .fillColor("#6b7280")
    .text(`Généré le : ${new Date().toLocaleDateString("fr-TN")}`, {
      align: "right",
    });
  doc.moveDown(2);

  doc
    .fontSize(14)
    .fillColor("#1e293b")
    .text("Indicateurs clés de performance", { underline: true });
  doc.moveDown();
  doc.fontSize(11).fillColor("#334155");

  const rightX = 400;
  let y = doc.y;
  const rowHeight = 22;

  const drawRow = (label, value) => {
    doc.text(label, 50, y);
    doc.font("Helvetica-Bold").text(value, rightX, y).font("Helvetica");
    doc
      .moveTo(50, y + 16)
      .lineTo(500, y + 16)
      .lineWidth(0.5)
      .strokeColor("#e2e8f0")
      .stroke();
    y += rowHeight;
  };

  drawRow("Nombre total de crédits accordés", String(stats.totalApproved));
  drawRow("Nombre de crédits refusés", String(stats.totalRejected));
  drawRow("Taux d'acceptation global", `${stats.acceptanceRate}%`);
  drawRow("Montant total accordé", formatTND(stats.totalAmount));
  drawRow("Revenus de ce mois", formatTND(stats.revenusMensuels));
  drawRow("Revenus de cette année", formatTND(stats.revenusAnnuels));
  drawRow("Total des intérêts générés", formatTND(stats.interetsGeneres));
  drawRow("Échéances en retard", String(stats.retardsCount));
  drawRow("Montants totaux impayés", formatTND(stats.retardsAmount));
  drawRow("Total des clients", String(stats.totalClients));

  doc.end();
  return endPromise;
};
