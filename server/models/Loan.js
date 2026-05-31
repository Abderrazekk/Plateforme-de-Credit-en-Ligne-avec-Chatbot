import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 1. Informations Personnelles
    personalInfo: {
      fullName: { type: String, required: true },
      cin: {
        type: String,
        required: true,
        match: [/^\d{8}$/, "La CIN doit comporter exactement 8 chiffres"],
      },
      dateOfBirth: { type: Date, required: true },
      placeOfBirth: { type: String, required: true },
      nationality: { type: String, default: "Tunisienne" },
      gender: { type: String, enum: ["M", "F"], required: true },
      maritalStatus: {
        type: String,
        enum: ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"],
        required: true,
      },
      dependentsCount: { type: Number, default: 0, min: 0 },
    },
    // 2. Coordonnées de Contact
    contactInfo: {
      phone: {
        type: String,
        required: true,
        match: [/^[2-459]\d{7}$/, "Numéro de téléphone tunisien invalide"],
      },
      email: { type: String, required: true },
      address: { type: String, required: true },
      governorate: {
        type: String,
        required: true,
        enum: [
          "Ariana",
          "Béja",
          "Ben Arous",
          "Bizerte",
          "Gabès",
          "Gafsa",
          "Jendouba",
          "Kairouan",
          "Kasserine",
          "Kébili",
          "Le Kef",
          "Mahdia",
          "La Manouba",
          "Médenine",
          "Monastir",
          "Nabeul",
          "Sfax",
          "Sidi Bouzid",
          "Siliana",
          "Sousse",
          "Tataouine",
          "Tozeur",
          "Tunis",
          "Zaghouan",
        ],
      },
      postalCode: {
        type: String,
        required: true,
        match: [/^\d{4}$/, "Code postal invalide (4 chiffres)"],
      },
    },
    // 3. Situation Professionnelle
    employmentInfo: {
      status: {
        type: String,
        enum: [
          "Salarié",
          "Indépendant",
          "Chef d'entreprise",
          "Retraité",
          "Étudiant",
        ],
        required: true,
      },
      companyName: { type: String },
      jobTitle: { type: String },
      sector: { type: String },
      seniorityYears: { type: Number, min: 0 },
      contractType: {
        type: String,
        enum: ["CDI", "CDD", "SIVP", "Freelance", "Patente", "Aucun"],
      },
      monthlyIncome: { type: Number, required: true, min: 0 }, // net en TND
    },
    // 4. Situation Financière
    financialInfo: {
      monthlyExpenses: { type: Number, required: true, default: 0 },
      existingLoansCommitments: { type: Number, default: 0 },
      rib: {
        type: String,
        required: true,
        match: [
          /^\d{20}$/,
          "Le RIB tunisien doit comporter exactement 20 chiffres",
        ],
      },
      bankName: { type: String, required: true },
      savingsAssets: { type: Number, default: 0 },
    },
    // 5. Détails du Crédit Demandé
    montant: {
      type: Number,
      required: true,
      min: [500, "Le montant minimum est de 500 TND"],
      max: [100000, "Le montant maximum est de 100 000 TND"],
    },
    // NOUVEAU : Restriction des mois via enum
    dureeMois: {
      type: Number,
      required: true,
      enum: [3, 6, 12, 18, 24, 36, 48, 60],
    },
    tauxInteret: {
      type: Number,
      required: true,
    },
    objet: {
      type: String,
      required: true,
      enum: [
        "Voiture",
        "Immobilier",
        "Dépenses Personnelles",
        "Affaires / Projet",
        "Équipement",
      ],
    },
    preferredMonthlyPayment: { type: Number },
    insuranceSelected: { type: Boolean, default: false },
    // 6. Documents Justificatifs Téléversés (Chemins des fichiers sur le serveur)
    documents: {
      cinRecto: { type: String, required: true },
      cinVerso: { type: String, required: true },
      salarySlips: { type: String }, // Requis pour Salarié
      bankStatement: { type: String, required: true },
      workCertificate: { type: String },
      taxDeclaration: { type: String }, // Requis pour Indépendant / Chef d'entreprise
      proofOfAddress: { type: String, required: true },
      businessRegistration: { type: String },
    },
    // Statuts & Données Opérationnelles
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "closed"],
      default: "pending",
    },
    commentaireAdmin: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dateDeboursement: Date,
    remboursements: [
      {
        dateEcheance: Date,
        montant: Number,
        payeLe: Date,
        preuvePaiement: String,
        status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
      },
    ],
  },
  { timestamps: true },
);

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
