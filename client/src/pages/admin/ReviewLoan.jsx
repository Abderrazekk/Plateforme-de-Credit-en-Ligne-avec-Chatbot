import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";
import DocumentViewer from "../../components/ui/DocumentViewer";
import * as XLSX from "xlsx";

const STATUS_META = {
  pending: {
    label: "En attente d'analyse",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-400",
    pulse: true,
  },
  approved: {
    label: "Approuvé (À décaisser)",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    dot: "bg-blue-400",
    pulse: false,
  },
  rejected: {
    label: "Rejeté",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    dot: "bg-red-400",
    pulse: false,
  },
  active: {
    label: "En cours / Actif",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-100",
    dot: "bg-teal-400",
    pulse: false,
  },
  closed: {
    label: "Clôturé",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
    pulse: false,
  },
};

export default function ReviewLoan() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isVerifyingDocs, setIsVerifyingDocs] = useState(false);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/loans/${id}`);
      setLoan(res.data);
      setAdminComment(res.data.commentaireAdmin || "");
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement du crédit",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLoanDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerifyDocuments = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir certifier les documents de ce client ? Un email lui sera envoyé.",
      )
    )
      return;
    try {
      setIsVerifyingDocs(true);
      const clientId = loan.client?._id || loan.client;
      const res = await api.put(`/users/${clientId}/verify-documents`);
      alert(res.data.message || "Documents vérifiés avec succès !");
      fetchLoanDetails();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Erreur lors de la vérification des documents",
      );
    } finally {
      setIsVerifyingDocs(false);
    }
  };

  const handleReview = async (status) => {
    if (status === "rejected" && !adminComment.trim()) {
      alert(
        "Veuillez saisir un commentaire pour justifier le rejet réglementaire.",
      );
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.put(`/loans/${id}/review`, {
        status,
        commentaire: adminComment,
      });
      setLoan(res.data);
      alert(
        `La demande a été ${status === "approved" ? "approuvée" : "rejetée"} avec succès.`,
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Erreur lors de la modification de la demande",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async () => {
    try {
      setActionLoading(true);
      const res = await api.put(`/loans/${id}/disburse`);
      setLoan(res.data);
      alert(
        "Les fonds ont été décaissés avec succès. Le crédit est désormais actif.",
      );
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du décaissement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (repaymentId) => {
    if (
      !window.confirm(
        "Confirmez-vous la réception du paiement pour cette échéance ?",
      )
    )
      return;
    try {
      setActionLoading(true);
      const res = await api.put(`/loans/${id}/repayments/${repaymentId}/pay`);
      setLoan(res.data);
      alert("Le paiement a été enregistré avec succès.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du paiement",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadSchedulePDF = async () => {
    try {
      setActionLoading(true);
      const res = await api.get(`/pdf/schedule/${id}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Echeancier_${loan.personalInfo?.fullName || "Client"}_${loan._id.slice(-6)}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur complète du téléchargement PDF :", err);
      if (err.response && err.response.data instanceof Blob) {
        const errorText = await err.response.data.text();
        console.error(
          "Détails de l'erreur envoyée par le backend :",
          errorText,
        );
        try {
          const errorJson = JSON.parse(errorText);
          alert(
            `Erreur : ${errorJson.message || "Problème lors de la génération du PDF"}`,
          );
          return;
          // eslint-disable-next-line no-unused-vars, no-empty
        } catch (e) {}
      }
      alert(
        "Erreur lors du téléchargement du document PDF. Ouvrez la console (F12) pour voir les détails.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!loan || !loan.remboursements) return;
    const dataToExport = loan.remboursements.map((r, index) => ({
      "N° Échéance": index + 1,
      "Date d'échéance": new Date(r.dateEcheance).toLocaleDateString("fr-TN"),
      "Montant (TND)": r.montant,
      "Pénalité Retard (TND)": r.penalite || 0,
      Statut: r.status === "paid" ? "Payé" : "Impayé",
      "Payé le": r.payeLe
        ? new Date(r.payeLe).toLocaleDateString("fr-TN")
        : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Échéancier");
    XLSX.writeFile(
      workbook,
      `Echeancier_Credit_${loan.personalInfo?.fullName || "Client"}_${loan._id.slice(-6)}.xlsx`,
    );
  };

  /* ── Loading state ── */
  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 w-full bg-slate-100" />
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-48 bg-slate-100 rounded-xl" />
                <div className="h-48 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  /* ── Error state ── */
  if (error)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 pb-14">
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-red-400" />
            <div className="p-10 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
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
              <p className="text-slate-800 font-extrabold tracking-tight text-lg">
                Erreur de chargement
              </p>
              <p className="text-slate-400 text-sm font-medium">{error}</p>
              <Link
                to="/admin/loans"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                           shadow-md shadow-blue-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                Retour aux demandes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );

  if (!loan)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Aucun crédit trouvé.</p>
      </div>
    );

  const meta = STATUS_META[loan.status] || STATUS_META.closed;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
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
              <span className="ml-2 text-slate-600">· Admin</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white capitalize">
                {loan.personalInfo?.fullName || "Dossier client"}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium flex items-center gap-2">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Demande soumise le{" "}
                {new Date(loan.createdAt).toLocaleDateString("fr-TN")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/loans"
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
                Retour aux demandes
              </Link>
              <span className="text-slate-700">·</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${meta.pulse ? "animate-pulse" : ""}`}
                />
                {meta.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Reference + KPI banner ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Ref */}
            <div className="col-span-2 md:col-span-1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Référence
                </p>
                <p className="font-mono font-bold text-slate-800 text-sm">
                  #{loan._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            {/* Montant */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Montant sollicité
              </p>
              <p className="text-xl font-extrabold tracking-tight text-blue-600">
                {formatTND(loan.montant)}
              </p>
            </div>
            {/* Durée + Taux */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Durée & Taux
              </p>
              <p className="text-xl font-extrabold tracking-tight text-slate-800">
                {loan.dureeMois} mois
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Taux fixe : {loan.tauxInteret}%
              </p>
            </div>
            {/* Objet */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Objet du financement
              </p>
              <p className="text-sm font-bold text-slate-800 capitalize">
                {loan.objet}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Assurance : {loan.insuranceSelected ? "Oui" : "Non"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left col ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity card */}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                    Identité & Coordonnées
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {[
                    {
                      label: "Nom Complet",
                      value: loan.personalInfo?.fullName || "Non renseigné",
                      mono: false,
                      bold: true,
                    },
                    {
                      label: "Numéro CIN",
                      value: loan.personalInfo?.cin || "N/A",
                      mono: true,
                      bold: true,
                    },
                    {
                      label: "Naissance",
                      value: `${loan.personalInfo?.dateOfBirth ? new Date(loan.personalInfo.dateOfBirth).toLocaleDateString("fr-TN") : "N/A"} à ${loan.personalInfo?.placeOfBirth || "N/A"}`,
                      mono: false,
                      bold: false,
                    },
                    {
                      label: "Situation Familiale",
                      value: `${loan.personalInfo?.maritalStatus || "N/A"} (${loan.personalInfo?.dependentsCount || 0} enfant(s))`,
                      mono: false,
                      bold: false,
                    },
                  ].map(({ label, value, mono, bold }) => (
                    <div key={label}>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        {label}
                      </p>
                      <p
                        className={`text-sm text-slate-800 ${bold ? "font-bold" : "font-medium"} ${mono ? "font-mono" : ""}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}

                  <div className="col-span-1 sm:col-span-2 border-t border-slate-100 pt-1" />

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      Téléphone & Email
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {loan.contactInfo?.phone}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {loan.contactInfo?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      Adresse Résidentielle
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {loan.contactInfo?.address}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {loan.contactInfo?.postalCode}{" "}
                      {loan.contactInfo?.governorate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment card */}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                    Revenus & Emploi
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      Employeur / Statut
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {loan.employmentInfo?.companyName || "N/A"}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {loan.employmentInfo?.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      Revenu Mensuel Net
                    </p>
                    <p className="text-xl font-extrabold tracking-tight text-teal-600">
                      {formatTND(loan.employmentInfo?.monthlyIncome || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-blue-600"
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
                    </div>
                    <h3 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                      Documents Justificatifs
                    </h3>
                  </div>
                  {loan.client?.documentsVerifies ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-teal-50 text-teal-700 border-teal-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      Documents Certifiés
                    </span>
                  ) : (
                    <button
                      onClick={handleVerifyDocuments}
                      disabled={isVerifyingDocs || actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                                 bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                                 shadow-sm shadow-blue-500/20 hover:shadow-md hover:scale-[1.02]
                                 active:scale-95 disabled:opacity-50 transition-all duration-200"
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {isVerifyingDocs
                        ? "Vérification..."
                        : "Certifier les documents"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "cinRecto", label: "CIN Recto" },
                    { key: "cinVerso", label: "CIN Verso" },
                    { key: "proofOfAddress", label: "Justif. Domicile" },
                    { key: "bankStatement", label: "Relevé Bancaire" },
                    { key: "salarySlips", label: "Fiches de Paie" },
                    { key: "workCertificate", label: "Attestation Travail" },
                  ].map(({ key, label }) =>
                    loan.documents?.[key] ? (
                      <div
                        key={key}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2 text-center hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-150"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600">
                          {label}
                        </p>
                        <DocumentViewer
                          filename={loan.documents[key]}
                          label="Visualiser"
                        />
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right col ── */}
          <div className="space-y-6">
            {/* Decision panel — pending */}
            {loan.status === "pending" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-6">
                <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                      Décision & Analyse
                    </h3>
                  </div>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Ex: Dossier complet, ratios financiers corrects. Validation recommandée."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 font-medium
                               placeholder:text-slate-400 outline-none
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white
                               transition-all duration-200 mb-4 h-32 resize-none"
                  />
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleReview("approved")}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                 bg-teal-600 hover:bg-teal-700 text-white
                                 shadow-sm shadow-teal-500/20 disabled:opacity-50 transition-all duration-200"
                    >
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
                      Approuver la demande
                    </button>
                    <button
                      onClick={() => handleReview("rejected")}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                 bg-red-600 hover:bg-red-700 text-white
                                 shadow-sm shadow-red-500/20 disabled:opacity-50 transition-all duration-200"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Rejeter la demande
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Disburse panel — approved */}
            {loan.status === "approved" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-6">
                <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-7 h-7 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-800 font-extrabold tracking-tight text-base mb-1">
                    Prêt à Décaisser
                  </p>
                  <p className="text-slate-400 text-sm font-medium mb-5 leading-snug">
                    Le dossier est approuvé. Cliquez ci-dessous pour libérer les
                    fonds et générer le tableau d'amortissement.
                  </p>
                  <button
                    onClick={handleDisburse}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                               bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                               shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35
                               hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all duration-200"
                  >
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Décaisser les Fonds
                  </button>
                </div>
              </div>
            )}

            {/* Admin comment */}
            {loan.commentaireAdmin && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="p-5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Commentaire Administrateur
                    </p>
                    <p className="text-sm text-slate-700 italic leading-relaxed">
                      "{loan.commentaireAdmin}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Repayments table ── */}
        {(loan.status === "active" || loan.status === "closed") &&
          loan.remboursements?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-blue-600"
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
                    </div>
                    <h3 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                      Suivi des Remboursements
                    </h3>
                    <span className="ml-1 text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {loan.remboursements.length} échéance
                      {loan.remboursements.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* PDF button */}
                    <button
                      onClick={handleDownloadSchedulePDF}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                                 border border-slate-200 bg-slate-50 text-slate-700
                                 hover:bg-red-50 hover:border-red-200 hover:text-red-700
                                 disabled:opacity-50 transition-all duration-150"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.25 1.042v13.5l-3.3-3.3L6.5 12.688 12 18.188l5.5-5.5-1.45-1.446-3.3 3.3V1.042h-1.5zM2.5 20.25v2.25h19v-2.25h-19z" />
                      </svg>
                      Échéancier PDF
                    </button>

                    {/* Excel button */}
                    <button
                      onClick={exportToExcel}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                                 border border-slate-200 bg-slate-50 text-slate-700
                                 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700
                                 transition-all duration-150"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm min-w-[750px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-900 to-blue-900">
                        {[
                          "Échéance",
                          "Date Limite",
                          "Mensualité",
                          "Pénalité",
                          "Statut",
                          "Date Règlement",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-300 first:rounded-tl-xl last:rounded-tr-xl"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loan.remboursements.map((echeance, index) => (
                        <tr
                          key={echeance._id || index}
                          className={`transition-colors duration-100 hover:bg-blue-50/50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                        >
                          {/* Échéance # */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-extrabold shrink-0">
                                {index + 1}
                              </span>
                            </div>
                          </td>

                          {/* Date Limite */}
                          <td className="px-4 py-3 text-slate-500 font-medium text-xs">
                            {new Date(echeance.dateEcheance).toLocaleDateString(
                              "fr-TN",
                            )}
                          </td>

                          {/* Mensualité */}
                          <td className="px-4 py-3 font-semibold text-slate-800 font-mono">
                            {formatTND(echeance.montant)}
                          </td>

                          {/* Pénalité */}
                          <td className="px-4 py-3 font-mono">
                            {echeance.penalite > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                                +{formatTND(echeance.penalite)}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-medium">
                                —
                              </span>
                            )}
                          </td>

                          {/* Statut */}
                          <td className="px-4 py-3">
                            {echeance.status === "paid" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-teal-50 text-teal-700 border-teal-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                Payé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-red-50 text-red-700 border-red-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Impayé
                              </span>
                            )}
                          </td>

                          {/* Date Règlement */}
                          <td className="px-4 py-3 text-slate-400 font-medium text-xs">
                            {echeance.payeLe ? (
                              new Date(echeance.payeLe).toLocaleDateString(
                                "fr-TN",
                              )
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-right">
                            {echeance.status === "paid" && (
                              <button
                                onClick={handleDownloadSchedulePDF}
                                title="Télécharger l'échéancier PDF"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg
                                           bg-slate-50 border border-slate-200 text-slate-500
                                           hover:bg-red-50 hover:border-red-200 hover:text-red-600
                                           transition-all duration-150"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M11.25 1.042v13.5l-3.3-3.3L6.5 12.688 12 18.188l5.5-5.5-1.45-1.446-3.3 3.3V1.042h-1.5zM2.5 20.25v2.25h19v-2.25h-19z" />
                                </svg>
                              </button>
                            )}
                            {loan.status === "active" &&
                              echeance.status === "unpaid" && (
                                <button
                                  onClick={() => handleMarkPaid(echeance._id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700
                                           bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200
                                           px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-all duration-150"
                                >
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
                                  Valider le paiement
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* ── CTA banner ── */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
          <div>
            <p className="text-white font-extrabold tracking-tight text-lg">
              Retour à la gestion des demandes
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Consultez tous les dossiers ou accédez au tableau de bord.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         border border-white/20 text-slate-300 hover:text-white hover:border-white/40
                         transition-all duration-200"
            >
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Tableau de bord
            </Link>
            <Link
              to="/admin/loans"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                         bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                         shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35
                         hover:scale-105 active:scale-95 transition-all duration-200"
            >
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Toutes les demandes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
