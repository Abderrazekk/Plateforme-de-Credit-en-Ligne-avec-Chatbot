import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";
import {
  calculerMensualite,
  calculerCoutTotal,
  getTauxInteret, // <-- NOUVEL IMPORT ICI
} from "../../utils/loanCalculator";

const GOVERNORATES = [
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
];

const ALLOWED_DURATIONS = [3, 6, 12, 18, 24, 36, 48, 60]; // <-- DURÉES AUTORISÉES

const STEPS_META = [
  {
    label: "Profil & Contact",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    label: "Finances",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Crédit",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Documents",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

// Shared input class
const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all duration-200";

const selectCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all duration-200 cursor-pointer appearance-none";

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
      <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
        {children}
      </h2>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    </div>
  );
}

export default function ApplyLoan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Formulaire consolidé conforme à la réglementation Tunisienne
  const [formData, setFormData] = useState({
    // Étape 1 : Personnel & Contact
    fullName: "",
    cin: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "M",
    maritalStatus: "Célibataire",
    dependentsCount: 0,
    phone: "",
    email: "",
    address: "",
    governorate: "Tunis",
    postalCode: "",
    // Étape 2 : Professionnel & Financier
    employmentStatus: "Salarié",
    companyName: "",
    jobTitle: "",
    sector: "",
    seniorityYears: 0,
    contractType: "CDI",
    monthlyIncome: "",
    monthlyExpenses: "",
    existingLoansCommitments: 0,
    rib: "",
    bankName: "",
    savingsAssets: 0,
    // Étape 3 : Paramètres du Crédit
    montant: searchParams.get("montant") || "",
    dureeMois: searchParams.get("duree") || "",
    objet: "Dépenses Personnelles",
    preferredMonthlyPayment: "",
    insuranceSelected: false,
  });

  // Fichiers d'upload correspondants
  const [fileObjects, setFileObjects] = useState({
    cinRecto: null,
    cinVerso: null,
    salarySlips: null,
    bankStatement: null,
    workCertificate: null,
    taxDeclaration: null,
    proofOfAddress: null,
    businessRegistration: null,
  });

  // Remplissage automatique initial basé sur la session d'authentification
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setFormData((prev) => ({
          ...prev,
          fullName: `${res.data.prenom} ${res.data.nom}`,
          email: res.data.email || "",
          phone: res.data.telephone || "",
          cin: res.data.cin || "",
        }));
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFileObjects((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // Calculateur instantané en temps réel (NOUVEAU : TAUX DYNAMIQUE)
  const currentMontant = parseFloat(formData.montant) || 0;
  const currentDuree = parseInt(formData.dureeMois) || 12; // Défaut à 12 pour éviter NaN
  const tauxApplique = getTauxInteret(currentDuree);
  const mensualiteCalculee = calculerMensualite(
    currentMontant,
    tauxApplique,
    currentDuree,
  );
  const totalFraisEtInterets =
    calculerCoutTotal(mensualiteCalculee, currentDuree) - currentMontant;

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (
        !formData.fullName ||
        !formData.cin ||
        !formData.phone ||
        !formData.address ||
        !formData.postalCode
      ) {
        setError("Veuillez remplir tous les champs obligatoires de l'étape 1.");
        return false;
      }
      if (!/^\d{8}$/.test(formData.cin)) {
        setError(
          "Le numéro de la carte d'identité (CIN) doit comporter 8 chiffres.",
        );
        return false;
      }
      if (!/^[2-459]\d{7}$/.test(formData.phone)) {
        setError(
          "Le numéro de téléphone tunisien doit comporter 8 chiffres (débutant par 2, 4, 5 ou 9).",
        );
        return false;
      }
    } else if (step === 2) {
      if (!formData.monthlyIncome || !formData.rib || !formData.bankName) {
        setError(
          "Les informations de revenus et coordonnées bancaires sont obligatoires.",
        );
        return false;
      }
      if (!/^\d{20}$/.test(formData.rib)) {
        setError("Le RIB doit comporter exactement 20 chiffres numériques.");
        return false;
      }
    } else if (step === 3) {
      if (currentMontant < 500 || currentMontant > 100000) {
        setError(
          "Le montant demandé doit être compris entre 500 et 100 000 TND.",
        );
        return false;
      }
      // NOUVEAU : VALIDATION DES DURÉES AUTORISÉES
      if (!ALLOWED_DURATIONS.includes(currentDuree)) {
        setError("Veuillez sélectionner une durée de remboursement valide.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError("");

    // Validation finale des fichiers requis
    if (
      !fileObjects.cinRecto ||
      !fileObjects.cinVerso ||
      !fileObjects.bankStatement ||
      !fileObjects.proofOfAddress
    ) {
      setError(
        "Veuillez joindre l'ensemble des documents obligatoires demandés (marqués d'un astérisque *).",
      );
      return;
    }

    setLoading(true);
    const serverPayload = new FormData();

    // Groupement des objets JSON complexes pour l'analyse serveur
    serverPayload.append(
      "personalInfo",
      JSON.stringify({
        fullName: formData.fullName,
        cin: formData.cin,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        dependentsCount: parseInt(formData.dependentsCount) || 0,
      }),
    );

    serverPayload.append(
      "contactInfo",
      JSON.stringify({
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        governorate: formData.governorate,
        postalCode: formData.postalCode,
      }),
    );

    serverPayload.append(
      "employmentInfo",
      JSON.stringify({
        status: formData.employmentStatus,
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        sector: formData.sector,
        seniorityYears: parseInt(formData.seniorityYears) || 0,
        contractType: formData.contractType,
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
      }),
    );

    serverPayload.append(
      "financialInfo",
      JSON.stringify({
        monthlyExpenses: parseFloat(formData.monthlyExpenses) || 0,
        existingLoansCommitments:
          parseFloat(formData.existingLoansCommitments) || 0,
        rib: formData.rib,
        bankName: formData.bankName,
        savingsAssets: parseFloat(formData.savingsAssets) || 0,
      }),
    );

    // Paramètres directs du crédit
    serverPayload.append("montant", currentMontant);
    serverPayload.append("dureeMois", currentDuree); // CORRIGÉ : suppression du ":" et de l'espace
    serverPayload.append("objet", formData.objet);
    serverPayload.append(
      "preferredMonthlyPayment",
      parseFloat(formData.preferredMonthlyPayment) || mensualiteCalculee,
    );
    serverPayload.append("insuranceSelected", formData.insuranceSelected);

    // Injection physique des fichiers binaires capturés
    Object.keys(fileObjects).forEach((key) => {
      if (fileObjects[key]) {
        serverPayload.append(key, fileObjects[key]);
      }
    });

    try {
      await api.post("/loans", serverPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/client/dashboard?success=loan_submitted");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement de votre demande.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shrink-0">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400 tracking-widest">
              Crédit<span className="text-blue-400">Tunisie</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Demande de Financement
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Complétez les 4 étapes pour soumettre votre dossier de crédit.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/client/loans"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors duration-150"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Mes demandes
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Stepper card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
          <div className="p-5">
            <div className="flex items-center gap-0">
              {STEPS_META.map((s, i) => {
                const num = i + 1;
                const isCompleted = step > num;
                const isActive = step === num;
                return (
                  <div
                    key={num}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs transition-all duration-300 border
                          ${
                            isCompleted
                              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-transparent shadow-md shadow-blue-500/20"
                              : isActive
                                ? "bg-gradient-to-br from-slate-900 to-blue-900 text-white border-transparent shadow-md"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          num
                        )}
                      </div>
                      <span
                        className={`hidden sm:block text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200
                        ${isActive ? "text-blue-600" : isCompleted ? "text-cyan-600" : "text-slate-400"}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {num < 4 && (
                      <div
                        className={`h-0.5 flex-1 mx-3 rounded-full transition-all duration-500
                        ${step > num ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "bg-slate-100"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-red-400" />
            <div className="p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* ── Main form card ── */}
        <form
          onSubmit={step === 4 ? handleSubmitForm : (e) => e.preventDefault()}
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
            <div className="p-6 sm:p-8">
              {/* STEP 1 : INFORMATIONS PERSONNELLES & CONTACT */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <SectionTitle>Informations Personnelles</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel required>Nom complet (français)</FieldLabel>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="Ex: Mohamed Ben Ali"
                        />
                      </div>
                      <div>
                        <FieldLabel required>Numéro de CIN</FieldLabel>
                        <input
                          type="text"
                          name="cin"
                          value={formData.cin}
                          onChange={handleInputChange}
                          maxLength="8"
                          className={inputCls}
                          placeholder="Ex: 08999999"
                        />
                      </div>
                      <div>
                        <FieldLabel required>Date de Naissance</FieldLabel>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <FieldLabel required>Lieu de Naissance</FieldLabel>
                        <input
                          type="text"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="Ex: Tunis"
                        />
                      </div>
                      <div>
                        <FieldLabel required>Genre</FieldLabel>
                        <SelectWrapper>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={selectCls}
                          >
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel required>État Civil</FieldLabel>
                        <SelectWrapper>
                          <select
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleInputChange}
                            className={selectCls}
                          >
                            <option value="Célibataire">Célibataire</option>
                            <option value="Marié(e)">Marié(e)</option>
                            <option value="Divorcé(e)">Divorcé(e)</option>
                            <option value="Veuf(ve)">Veuf(ve)</option>
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel>Nombre d'enfants à charge</FieldLabel>
                        <input
                          type="number"
                          name="dependentsCount"
                          value={formData.dependentsCount}
                          onChange={handleInputChange}
                          min="0"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Coordonnées</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel required>Téléphone Mobile</FieldLabel>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="Ex: 98765432"
                        />
                      </div>
                      <div>
                        <FieldLabel required>Adresse Email</FieldLabel>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="Ex: exemple@email.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FieldLabel required>
                          Adresse Résidentielle complète
                        </FieldLabel>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="Numéro, rue, appartement..."
                        />
                      </div>
                      <div>
                        <FieldLabel required>Gouvernorat</FieldLabel>
                        <SelectWrapper>
                          <select
                            name="governorate"
                            value={formData.governorate}
                            onChange={handleInputChange}
                            className={selectCls}
                          >
                            {GOVERNORATES.map((gov) => (
                              <option key={gov} value={gov}>
                                {gov}
                              </option>
                            ))}
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel required>Code Postal</FieldLabel>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          maxLength="4"
                          className={inputCls}
                          placeholder="Ex: 1000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 : INFORMATIONS PROFESSIONNELLES & FINANCIÈRES */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <SectionTitle>Situation Professionnelle</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel required>Statut Professionnel</FieldLabel>
                        <SelectWrapper>
                          <select
                            name="employmentStatus"
                            value={formData.employmentStatus}
                            onChange={handleInputChange}
                            className={selectCls}
                          >
                            <option value="Salarié">Salarié(e)</option>
                            <option value="Indépendant">
                              Profession Libérale / Indépendant
                            </option>
                            <option value="Chef d'entreprise">
                              Chef d'entreprise
                            </option>
                            <option value="Retraité">Retraité(e)</option>
                            <option value="Étudiant">Étudiant(e)</option>
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel required>
                          Revenu mensuel net (TND)
                        </FieldLabel>
                        <input
                          type="number"
                          name="monthlyIncome"
                          value={formData.monthlyIncome}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="Ex: 1500"
                        />
                      </div>
                      {formData.employmentStatus !== "Retraité" &&
                        formData.employmentStatus !== "Étudiant" && (
                          <>
                            <div>
                              <FieldLabel>
                                Nom de l'employeur / Entreprise
                              </FieldLabel>
                              <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                className={inputCls}
                                placeholder="Ex: Société XYZ"
                              />
                            </div>
                            <div>
                              <FieldLabel>Intitulé du Poste</FieldLabel>
                              <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                className={inputCls}
                                placeholder="Ex: Ingénieur"
                              />
                            </div>
                            <div>
                              <FieldLabel>Type de Contrat</FieldLabel>
                              <SelectWrapper>
                                <select
                                  name="contractType"
                                  value={formData.contractType}
                                  onChange={handleInputChange}
                                  className={selectCls}
                                >
                                  <option value="CDI">CDI</option>
                                  <option value="CDD">CDD</option>
                                  <option value="SIVP">SIVP</option>
                                  <option value="Freelance">Freelance</option>
                                  <option value="Patente">Patente</option>
                                </select>
                              </SelectWrapper>
                            </div>
                            <div>
                              <FieldLabel>Ancienneté (années)</FieldLabel>
                              <input
                                type="number"
                                name="seniorityYears"
                                value={formData.seniorityYears}
                                onChange={handleInputChange}
                                min="0"
                                className={inputCls}
                              />
                            </div>
                          </>
                        )}
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Dossier Bancaire & Charges</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel required>Nom de votre Banque</FieldLabel>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="Ex: BIAT, BH, Attijari..."
                        />
                      </div>
                      <div>
                        <FieldLabel required>
                          Identifiant RIB (20 chiffres)
                        </FieldLabel>
                        <input
                          type="text"
                          name="rib"
                          value={formData.rib}
                          onChange={handleInputChange}
                          maxLength="20"
                          className={`${inputCls} font-mono tracking-wide`}
                          placeholder="Ex: 03100000000000000000"
                        />
                      </div>
                      <div>
                        <FieldLabel>
                          Charges / Dépenses fixes mensuelles (TND)
                        </FieldLabel>
                        <input
                          type="number"
                          name="monthlyExpenses"
                          value={formData.monthlyExpenses}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <FieldLabel>
                          Mensualités crédits en cours (TND)
                        </FieldLabel>
                        <input
                          type="number"
                          name="existingLoansCommitments"
                          value={formData.existingLoansCommitments}
                          onChange={handleInputChange}
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 : PARAMÈTRES ET CARACTÉRISTIQUES DU CRÉDIT */}
              {step === 3 && (
                <div className="space-y-6">
                  <SectionTitle>Objet et Volume du Financement</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <FieldLabel required>Objet du crédit</FieldLabel>
                        <SelectWrapper>
                          <select
                            name="objet"
                            value={formData.objet}
                            onChange={handleInputChange}
                            className={selectCls}
                          >
                            <option value="Dépenses Personnelles">
                              Dépenses Personnelles (Santé, Études,
                              Consommation)
                            </option>
                            <option value="Voiture">Achat Véhicule</option>
                            <option value="Immobilier">
                              Aménagement / Immobilier
                            </option>
                            <option value="Affaires / Projet">
                              Création / Financement de Projet
                            </option>
                            <option value="Équipement">
                              Équipements et Matériels
                            </option>
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel required>Montant souhaité (TND)</FieldLabel>
                        <input
                          type="number"
                          name="montant"
                          value={formData.montant}
                          onChange={handleInputChange}
                          className={`${inputCls} font-bold text-lg text-blue-700`}
                          placeholder="Ex: 10000"
                        />
                      </div>
                      <div>
                        <FieldLabel required>Durée souhaitée (Mois)</FieldLabel>
                        <SelectWrapper>
                          <select
                            name="dureeMois"
                            value={formData.dureeMois}
                            onChange={handleInputChange}
                            className={selectCls}
                          >
                            <option value="" disabled>
                              Sélectionnez une durée
                            </option>
                            {ALLOWED_DURATIONS.map((m) => (
                              <option key={m} value={m}>
                                {m} mois
                              </option>
                            ))}
                          </select>
                        </SelectWrapper>
                      </div>
                      {/* Insurance checkbox */}
                      <div
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200
                          ${
                            formData.insuranceSelected
                              ? "bg-blue-50 border-blue-200"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            insuranceSelected: !prev.insuranceSelected,
                          }))
                        }
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200
                          ${
                            formData.insuranceSelected
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-slate-300"
                          }`}
                        >
                          {formData.insuranceSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Assurance emprunteur
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Souscrire à l'assurance emprunteur obligatoire
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="ins"
                          name="insuranceSelected"
                          checked={formData.insuranceSelected}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    {/* ── Financial summary panel ── */}
                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 rounded-2xl border border-blue-900/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <svg
                              className="w-3.5 h-3.5 text-cyan-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xs font-extrabold tracking-widest text-slate-300 uppercase">
                            Indicateurs Prévisionnels
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                              Mensualité Estimée
                            </p>
                            <p className="text-2xl font-extrabold text-white tracking-tight">
                              {formatTND(mensualiteCalculee)}
                              <span className="text-sm font-medium text-slate-400 ml-1">
                                / mois
                              </span>
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                Taux
                              </p>
                              <p className="text-sm font-bold text-cyan-400">
                                {tauxApplique} %
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Variable / durée
                              </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                Coût total
                              </p>
                              <p className="text-sm font-bold text-amber-400">
                                {formatTND(totalFraisEtInterets)}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Intérêts
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 italic mt-5 leading-relaxed">
                        * Calculs indicatifs selon la méthode d'amortissement
                        constant.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 : UPLOAD DE PIÈCES JUSTIFICATIVES */}
              {step === 4 && (
                <div className="space-y-8">
                  <div>
                    <SectionTitle>
                      Pièces Justificatives Obligatoires
                    </SectionTitle>
                    <p className="text-xs text-slate-400 font-medium mb-5">
                      Formats acceptés : PDF, JPG, PNG — Taille max conseillée :
                      5 Mo par fichier.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          name: "cinRecto",
                          label: "Carte d'Identité Nationale (Recto)",
                          required: true,
                        },
                        {
                          name: "cinVerso",
                          label: "Carte d'Identité Nationale (Verso)",
                          required: true,
                        },
                        {
                          name: "bankStatement",
                          label: "Relevé Bancaire Complet",
                          required: true,
                        },
                        {
                          name: "proofOfAddress",
                          label:
                            "Justificatif de Domicile (Facture STEG/SONEDE)",
                          required: true,
                        },
                      ].map(({ name, label, required }) => (
                        <div
                          key={name}
                          className={`rounded-xl border p-4 transition-all duration-200
                            ${
                              fileObjects[name]
                                ? "bg-teal-50 border-teal-200"
                                : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                            }`}
                        >
                          <div className="flex items-start gap-2 mb-3">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                              ${fileObjects[name] ? "bg-teal-100" : "bg-white border border-slate-200"}`}
                            >
                              {fileObjects[name] ? (
                                <svg
                                  className="w-3.5 h-3.5 text-teal-600"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-3.5 h-3.5 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                              )}
                            </div>
                            <label className="text-xs font-semibold text-slate-700 leading-snug">
                              {label}
                              {required && (
                                <span className="text-red-400 ml-0.5">*</span>
                              )}
                            </label>
                          </div>
                          <input
                            type="file"
                            name={name}
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-500
                              file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                              file:text-xs file:font-semibold
                              file:bg-gradient-to-r file:from-cyan-500 file:to-blue-600 file:text-white
                              hover:file:shadow-md file:transition-all file:duration-200 file:cursor-pointer"
                          />
                          {fileObjects[name] && (
                            <p className="text-[10px] font-semibold text-teal-600 mt-2 truncate">
                              ✓ {fileObjects[name].name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Pièces Complémentaires</SectionTitle>
                    <p className="text-xs text-slate-400 font-medium mb-5">
                      Ces documents sont optionnels mais peuvent accélérer le
                      traitement de votre dossier.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          name: "salarySlips",
                          label: "Bulletins de Salaire (3 derniers mois)",
                        },
                        {
                          name: "workCertificate",
                          label: "Attestation de Travail / Contrat",
                        },
                        {
                          name: "taxDeclaration",
                          label: "Déclaration Unique des Revenus (Impôts)",
                        },
                        {
                          name: "businessRegistration",
                          label:
                            "Registre de Commerce / Patente (Indépendants)",
                        },
                      ].map(({ name, label }) => (
                        <div
                          key={name}
                          className={`rounded-xl border p-4 transition-all duration-200
                            ${
                              fileObjects[name]
                                ? "bg-teal-50 border-teal-200"
                                : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            }`}
                        >
                          <div className="flex items-start gap-2 mb-3">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                              ${fileObjects[name] ? "bg-teal-100" : "bg-white border border-slate-200"}`}
                            >
                              {fileObjects[name] ? (
                                <svg
                                  className="w-3.5 h-3.5 text-teal-600"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-3.5 h-3.5 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                              )}
                            </div>
                            <label className="text-xs font-semibold text-slate-600 leading-snug">
                              {label}
                            </label>
                          </div>
                          <input
                            type="file"
                            name={name}
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-500
                              file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                              file:text-xs file:font-semibold
                              file:bg-slate-100 file:text-slate-600
                              hover:file:bg-slate-200 file:transition-all file:duration-200 file:cursor-pointer"
                          />
                          {fileObjects[name] && (
                            <p className="text-[10px] font-semibold text-teal-600 mt-2 truncate">
                              ✓ {fileObjects[name].name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigation footer ── */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                               border border-slate-200 text-slate-600 bg-slate-50
                               hover:border-slate-300 hover:text-slate-800
                               transition-all duration-200 disabled:opacity-50"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Précédent
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                               bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                               shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35
                               hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    Suivant
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold
                               bg-gradient-to-r from-teal-500 to-emerald-600 text-white
                               shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/35
                               hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:scale-100"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Valider la demande
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* ── Step progress hint ── */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-6 flex items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-extrabold tracking-tight text-sm">
                Étape {step} sur 4
              </p>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">
                {step === 1 &&
                  "Renseignez vos informations personnelles et de contact."}
                {step === 2 &&
                  "Indiquez votre situation professionnelle et bancaire."}
                {step === 3 && "Définissez les paramètres de votre crédit."}
                {step === 4 &&
                  "Joignez les pièces justificatives pour finaliser votre dossier."}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300
                  ${i === step ? "w-6 bg-cyan-400" : i < step ? "w-4 bg-blue-500" : "w-4 bg-white/10"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
