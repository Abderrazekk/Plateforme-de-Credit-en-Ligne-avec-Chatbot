// client/src/pages/admin/CreateClientLoan.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";
import {
  calculerMensualite,
  calculerCoutTotal,
  getTauxInteret,
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

const ALLOWED_DURATIONS = [3, 6, 12, 18, 24, 36, 48, 60];

const STEPS_META = [
  {
    label: "Client",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    label: "Identité",
    icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2",
  },
  {
    label: "Finances",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Crédit",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    label: "Documents",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

/* ── Reusable field components ── */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function InputField({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5
        text-sm text-slate-700 font-medium placeholder:text-slate-400
        outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white
        transition-all duration-200 ${className}`}
    />
  );
}

function SelectField({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-9
          text-sm text-slate-700 font-medium
          outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white
          transition-all duration-200 cursor-pointer ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
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

function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg
              className="w-3.5 h-3.5 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
          <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function FileUploadField({
  label,
  name,
  required,
  fileObjects,
  handleFileChange,
  accent = false,
}) {
  const file = fileObjects[name];
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        accent
          ? "bg-blue-50/60 border-blue-200"
          : file
            ? "bg-teal-50/50 border-teal-200"
            : "bg-slate-50 border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              file ? "bg-teal-100" : accent ? "bg-blue-100" : "bg-slate-200"
            }`}
          >
            <svg
              className={`w-3 h-3 ${file ? "text-teal-600" : accent ? "text-blue-600" : "text-slate-500"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              {file ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              )}
            </svg>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              file
                ? "text-teal-700"
                : accent
                  ? "text-blue-800"
                  : "text-slate-700"
            }`}
          >
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </span>
        </div>
      </div>
      <input
        type="file"
        name={name}
        onChange={handleFileChange}
        className="block w-full text-xs text-slate-500
          file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
          file:text-xs file:font-semibold
          file:bg-white file:text-blue-700 file:shadow-sm file:border-slate-200
          hover:file:bg-blue-50 file:transition-colors file:cursor-pointer"
      />
      {file && (
        <p className="text-[10px] font-semibold text-teal-600 mt-2 flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {file.name}
        </p>
      )}
    </div>
  );
}

export default function CreateClientLoan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const [formData, setFormData] = useState({
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
    montant: "",
    dureeMois: "12",
    objet: "Dépenses Personnelles",
    preferredMonthlyPayment: "",
    insuranceSelected: false,
  });

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");

        // Filtrer les utilisateurs pour ne garder que ceux qui ont le rôle 'client'
        const clientsOnly = response.data.filter(
          (user) => user.role === "client",
        );

        // Mettre à jour l'état avec la liste filtrée
        setClients(clientsOnly);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        // Optionnel : afficher l'erreur sur l'écran si nécessaire
        // setError("Impossible de charger la liste des clients.");
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      const selectedClient = clients.find((c) => c._id === selectedClientId);
      if (selectedClient) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData((prev) => ({
          ...prev,
          fullName:
            `${selectedClient.prenom || ""} ${selectedClient.nom || ""}`.trim(),
          email: selectedClient.email || "",
          phone: selectedClient.telephone || "",
          cin: selectedClient.cin || "",
        }));
      }
    }
  }, [selectedClientId, clients]);

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

  const currentMontant = parseFloat(formData.montant) || 0;
  const currentDuree = parseInt(formData.dureeMois) || 12;
  const tauxApplique = getTauxInteret(currentDuree);
  const mensualiteCalculee = calculerMensualite(
    currentMontant,
    tauxApplique,
    currentDuree,
  );
  // eslint-disable-next-line no-unused-vars
  const coutTotalCalcule = calculerCoutTotal(
    currentMontant,
    tauxApplique,
    currentDuree,
  );

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.fullName ||
      !formData.cin ||
      !formData.dateOfBirth ||
      !formData.placeOfBirth
    ) {
      setError(
        "Veuillez remplir toutes les informations personnelles obligatoires à l'Étape 1 (y compris le lieu de naissance).",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // eslint-disable-next-line no-useless-escape
    let cleanPhone = formData.phone.replace(/[\s\-\.]/g, "");
    if (cleanPhone.startsWith("+216")) cleanPhone = cleanPhone.substring(4);
    else if (cleanPhone.startsWith("00216"))
      cleanPhone = cleanPhone.substring(5);

    const phoneRegex = /^[2-459]\d{7}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError(
        "Le numéro de téléphone du client est invalide. Il doit contenir exactement 8 chiffres (sans indicatif) et commencer par 2, 3, 4, 5 ou 9.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const isSalarie = formData.employmentStatus === "Salarié";
    const isIndependant = [
      "Chef d'entreprise",
      "Indépendant / Freelance",
    ].includes(formData.employmentStatus);

    if (
      !fileObjects.cinRecto ||
      !fileObjects.cinVerso ||
      !fileObjects.bankStatement ||
      !fileObjects.proofOfAddress
    ) {
      setError(
        "Veuillez joindre l'ensemble des documents obligatoires globaux (CIN Recto, CIN Verso, Relevé Bancaire et Justificatif de domicile).",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (isSalarie && !fileObjects.salarySlips) {
      setError(
        "Le document 'Fiches de paie' est obligatoire pour les salariés.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (isIndependant && !fileObjects.taxDeclaration) {
      setError(
        "La 'Déclaration d'impôts' est obligatoire pour les indépendants et chefs d'entreprise.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    const serverPayload = new FormData();
    serverPayload.append("clientId", selectedClientId);
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
        phone: cleanPhone,
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
    serverPayload.append("montant", currentMontant);
    serverPayload.append("dureeMois", currentDuree);
    serverPayload.append("objet", formData.objet);
    serverPayload.append(
      "preferredMonthlyPayment",
      parseFloat(formData.preferredMonthlyPayment) || mensualiteCalculee,
    );
    serverPayload.append("insuranceSelected", formData.insuranceSelected);
    Object.keys(fileObjects).forEach((key) => {
      if (fileObjects[key]) serverPayload.append(key, fileObjects[key]);
    });

    try {
      await api.post("/loans", serverPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/dashboard?success=loan_created");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de l'envoi au serveur.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedClient = clients.find((c) => c._id === selectedClientId);

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
                Création de dossier
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Renseignez les informations du client bénéficiaire.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
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
              Tableau de bord
            </button>
          </div>

          {/* ── Step progress (steps 1–4) ── */}
          {step > 0 && (
            <div className="mt-8 flex items-center gap-0">
              {STEPS_META.slice(1).map((s, i) => {
                const stepNum = i + 1;
                const isDone = step > stepNum;
                const isActive = step === stepNum;
                return (
                  <div
                    key={stepNum}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2
                        ${
                          isDone
                            ? "bg-teal-400 border-teal-400 text-white shadow-md shadow-teal-400/30"
                            : isActive
                              ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-transparent text-white shadow-md shadow-blue-500/30"
                              : "bg-slate-800 border-slate-700 text-slate-500"
                        }`}
                      >
                        {isDone ? (
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
                          <svg
                            className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-600"}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={s.icon}
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap
                        ${isActive ? "text-white" : isDone ? "text-teal-400" : "text-slate-600"}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {stepNum < 4 && (
                      <div
                        className={`h-0.5 flex-1 mx-3 mb-5 rounded-full transition-all duration-500
                        ${step > stepNum ? "bg-teal-400" : "bg-slate-700"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Error banner ── */}
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

        {/* ════════════════════════════════════════
            ÉTAPE 0 : CHOIX DU CLIENT
        ════════════════════════════════════════ */}
        {step === 0 && (
          <SectionCard
            icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            title="Sélectionner un Client bénéficiaire"
          >
            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Rechercher par Nom, Prénom ou Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5
                  text-sm text-slate-700 font-medium placeholder:text-slate-400
                  outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white
                  transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Client list */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
              {filteredClients.map((client, idx) => {
                const isSelected = selectedClientId === client._id;
                return (
                  <div
                    key={client._id}
                    onClick={() => setSelectedClientId(client._id)}
                    className={`p-4 cursor-pointer flex justify-between items-center transition-colors duration-100
                      ${
                        isSelected
                          ? "bg-blue-50/80 border-l-2 border-blue-500"
                          : idx % 2 === 0
                            ? "bg-white hover:bg-blue-50/50"
                            : "bg-slate-50/40 hover:bg-blue-50/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-extrabold shrink-0
                        ${isSelected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}
                      >
                        {client.prenom?.[0]}
                        {client.nom?.[0]}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">
                          {client.prenom} {client.nom}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {client.email} · {client.telephone}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                        <svg
                          className="w-3 h-3"
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
                        Sélectionné
                      </span>
                    )}
                  </div>
                );
              })}
              {filteredClients.length === 0 && (
                <div className="p-8 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">
                    Aucun client correspondant
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedClientId}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35
                hover:scale-[1.01] active:scale-95 transition-all duration-200
                disabled:opacity-40 disabled:pointer-events-none disabled:scale-100"
            >
              Étape suivante : Remplir les informations du client
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </SectionCard>
        )}

        <form onSubmit={handleSubmitForm} className="space-y-6">
          {/* ════════════════════════════════════════
              ÉTAPE 1 : INFORMATIONS PERSONNELLES
          ════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {/* Selected client badge */}
              {selectedClient && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 to-cyan-500" />
                  <div className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-xs font-extrabold text-teal-600 shrink-0">
                      {selectedClient.prenom?.[0]}
                      {selectedClient.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Client sélectionné
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedClient.prenom} {selectedClient.nom} ·{" "}
                        {selectedClient.email}
                      </p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      <svg
                        className="w-3 h-3"
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
                      Lié
                    </span>
                  </div>
                </div>
              )}

              <SectionCard
                icon="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"
                title="1. Informations Personnelles & Contact"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Nom complet</FieldLabel>
                    <InputField
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Prénom Nom"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Numéro de CIN</FieldLabel>
                    <InputField
                      type="text"
                      name="cin"
                      value={formData.cin}
                      onChange={handleInputChange}
                      required
                      maxLength="8"
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Date de naissance</FieldLabel>
                    <InputField
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Lieu de naissance</FieldLabel>
                    <InputField
                      type="text"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleInputChange}
                      required
                      placeholder="Tunis"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Genre</FieldLabel>
                    <SelectField
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel required>État Civil</FieldLabel>
                    <SelectField
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                    >
                      <option value="Célibataire">Célibataire</option>
                      <option value="Marié(e)">Marié(e)</option>
                      <option value="Divorcé(e)">Divorcé(e)</option>
                      <option value="Veuf(ve)">Veuf(ve)</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel required>Téléphone</FieldLabel>
                    <InputField
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="XX XXX XXX"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Email</FieldLabel>
                    <InputField
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="client@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel required>Adresse Résidentielle</FieldLabel>
                    <InputField
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Numéro, Rue, Cité..."
                    />
                  </div>
                  <div>
                    <FieldLabel required>Gouvernorat</FieldLabel>
                    <SelectField
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleInputChange}
                    >
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel required>Code Postal</FieldLabel>
                    <InputField
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      placeholder="1000"
                    />
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ════════════════════════════════════════
              ÉTAPE 2 : SITUATION PROFESSIONNELLE & FINANCIÈRE
          ════════════════════════════════════════ */}
          {step === 2 && (
            <SectionCard
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              title="2. Situation Professionnelle & Financière"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Statut Professionnel</FieldLabel>
                  <SelectField
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                  >
                    <option value="Salarié">Salarié</option>
                    <option value="Indépendant / Freelance">
                      Indépendant / Freelance
                    </option>
                    <option value="Chef d'entreprise">Chef d'entreprise</option>
                    <option value="Sans emploi / Retraité">
                      Sans emploi / Retraité
                    </option>
                  </SelectField>
                </div>
                <div>
                  <FieldLabel required>Revenu Mensuel Net (TND)</FieldLabel>
                  <InputField
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    required
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <FieldLabel required>
                    Dépenses Mensuelles Estimées (TND)
                  </FieldLabel>
                  <InputField
                    type="number"
                    name="monthlyExpenses"
                    value={formData.monthlyExpenses}
                    onChange={handleInputChange}
                    required
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <FieldLabel>Nom de l'entreprise</FieldLabel>
                  <InputField
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Optionnel"
                  />
                </div>
                <div>
                  <FieldLabel required>Nom de la Banque</FieldLabel>
                  <InputField
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                    placeholder="BNA, STB, Attijari..."
                  />
                </div>
                <div>
                  <FieldLabel required>Code RIB (20 chiffres)</FieldLabel>
                  <InputField
                    type="text"
                    name="rib"
                    value={formData.rib}
                    onChange={handleInputChange}
                    required
                    maxLength="20"
                    placeholder="00 000 0000000000000 00"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ════════════════════════════════════════
              ÉTAPE 3 : PARAMÈTRES DU CRÉDIT
          ════════════════════════════════════════ */}
          {step === 3 && (
            <SectionCard
              icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              title="3. Paramètres de la Demande de Crédit"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Montant Souhaité (TND)</FieldLabel>
                  <InputField
                    type="number"
                    name="montant"
                    value={formData.montant}
                    onChange={handleInputChange}
                    required
                    placeholder="5 000"
                  />
                </div>
                <div>
                  <FieldLabel required>Durée du Remboursement</FieldLabel>
                  <SelectField
                    name="dureeMois"
                    value={formData.dureeMois}
                    onChange={handleInputChange}
                  >
                    {ALLOWED_DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} mois
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div>
                  <FieldLabel required>Objet du Crédit</FieldLabel>
                  <SelectField
                    name="objet"
                    value={formData.objet}
                    onChange={handleInputChange}
                  >
                    <option value="Dépenses Personnelles">
                      Dépenses Personnelles
                    </option>
                    <option value="Voiture">Voiture</option>
                    <option value="Immobilier">Immobilier</option>
                    <option value="Affaires / Projet">Affaires / Projet</option>
                    <option value="Équipement">Équipement</option>
                  </SelectField>
                </div>
                <div
                  className="flex items-center gap-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      insuranceSelected: !p.insuranceSelected,
                    }))
                  }
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${formData.insuranceSelected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}
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
                  <input
                    type="checkbox"
                    name="insuranceSelected"
                    id="insurance"
                    checked={formData.insuranceSelected}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="insurance"
                    className="text-sm font-semibold text-slate-700 cursor-pointer select-none"
                  >
                    Souscrire à l'assurance crédit
                  </label>
                </div>
              </div>

              {/* Dynamic simulation recap */}
              {currentMontant > 0 && (
                <div className="mt-5 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-blue-600"
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
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Simulation de remboursement
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "Taux Appliqué",
                          value: `${tauxApplique}% / an`,
                          accent: false,
                        },
                        {
                          label: "Mensualité estimée",
                          value: formatTND(mensualiteCalculee),
                          accent: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`rounded-xl p-3 text-center border ${item.accent ? "bg-gradient-to-br from-blue-600 to-cyan-500 border-transparent shadow-md shadow-blue-500/20" : "bg-slate-50 border-slate-200"}`}
                        >
                          <div
                            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${item.accent ? "text-blue-100" : "text-slate-500"}`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-base font-extrabold tracking-tight ${item.accent ? "text-white" : "text-slate-800"}`}
                          >
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* ════════════════════════════════════════
              ÉTAPE 4 : DOCUMENTS JUSTIFICATIFS
          ════════════════════════════════════════ */}
          {step === 4 && (
            <SectionCard
              icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              title="4. Documents Justificatifs"
            >
              {/* Mandatory docs info banner */}
              <div className="mb-5 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <svg
                  className="w-4 h-4 text-amber-500 mt-0.5 shrink-0"
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
                <p className="text-xs font-semibold text-amber-700">
                  Les documents marqués <span className="text-red-500">*</span>{" "}
                  sont obligatoires. Les documents spécifiques varient selon le
                  statut professionnel du client.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadField
                  label="CIN Recto"
                  name="cinRecto"
                  required
                  fileObjects={fileObjects}
                  handleFileChange={handleFileChange}
                />
                <FileUploadField
                  label="CIN Verso"
                  name="cinVerso"
                  required
                  fileObjects={fileObjects}
                  handleFileChange={handleFileChange}
                />
                <FileUploadField
                  label="Relevé Bancaire (3 mois)"
                  name="bankStatement"
                  required
                  fileObjects={fileObjects}
                  handleFileChange={handleFileChange}
                />
                <FileUploadField
                  label="Justificatif de Domicile"
                  name="proofOfAddress"
                  required
                  fileObjects={fileObjects}
                  handleFileChange={handleFileChange}
                />

                {formData.employmentStatus === "Salarié" && (
                  <FileUploadField
                    label="Fiches de paie (3 dernières)"
                    name="salarySlips"
                    required
                    accent
                    fileObjects={fileObjects}
                    handleFileChange={handleFileChange}
                  />
                )}

                {["Chef d'entreprise", "Indépendant / Freelance"].includes(
                  formData.employmentStatus,
                ) && (
                  <FileUploadField
                    label="Déclaration d'impôts / RNE"
                    name="taxDeclaration"
                    required
                    accent
                    fileObjects={fileObjects}
                    handleFileChange={handleFileChange}
                  />
                )}
              </div>
            </SectionCard>
          )}

          {/* ── Navigation footer ── */}
          {step > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 to-slate-100" />
              <div className="px-6 py-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold
                    text-slate-600 bg-slate-100 border border-slate-200
                    hover:bg-slate-200 hover:text-slate-800
                    transition-all duration-200 disabled:opacity-40"
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

                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        step === i
                          ? "w-5 h-2 bg-blue-600"
                          : step > i
                            ? "w-2 h-2 bg-teal-400"
                            : "w-2 h-2 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                      bg-gradient-to-r from-teal-500 to-emerald-600 text-white
                      shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/35
                      hover:scale-105 active:scale-95 transition-all duration-200
                      disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Création du dossier...
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Valider le dossier
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
