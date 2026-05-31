import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";
import { calculerMensualite } from "../../utils/loanCalculator";
import DocumentViewer from "../../components/ui/DocumentViewer";

const STATUS_META = {
  pending: {
    label: "En cours d'analyse",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-400",
    pulse: true,
  },
  approved: {
    label: "Demande Approuvée",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-100",
    dot: "bg-teal-400",
    pulse: false,
  },
  rejected: {
    label: "Demande Refusée",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    dot: "bg-red-400",
    pulse: false,
  },
  active: {
    label: "Crédit Décaissé / Actif",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    dot: "bg-blue-400",
    pulse: false,
  },
  closed: {
    label: "Crédit Clôturé",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
    pulse: false,
  },
};

export default function LoanDetails() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/loans/${id}`);
      setLoan(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des détails du crédit.",
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

  const downloadContract = async () => {
    try {
      setIsDownloading(true);
      const response = await api.get(`/pdf/contract/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Contrat_Credit_${id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Erreur lors du téléchargement du contrat.");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSchedule = async () => {
    try {
      setIsDownloading(true);

      const res = await api.get(`/pdf/schedule/${id}`, {
        responseType: "blob",
      });

      if (
        res.data.type === "application/json" ||
        res.data.type === "text/html"
      ) {
        const errorText = await res.data.text();
        console.error("Le serveur n'a pas renvoyé un PDF :", errorText);
        alert("Erreur du serveur lors de la génération du PDF.");
        return;
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Echeancier_Credit_${id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur complète du téléchargement PDF :", err);

      if (err.response && err.response.data instanceof Blob) {
        const errorText = await err.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          alert(
            `Erreur : ${errorJson.message || "Problème lors de la génération du PDF"}`,
          );
          return;
          // eslint-disable-next-line no-unused-vars
        } catch (e) {
          // Ignorer si ce n'est pas du JSON
        }
      }
      alert("Erreur lors du téléchargement du document PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  /* ── Loading state ── */
  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 w-full bg-slate-100" />
            <div className="p-6 space-y-6">
              <div className="h-8 bg-slate-100 rounded-xl w-1/3" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl" />
                ))}
              </div>
              <div className="h-32 bg-slate-100 rounded-xl" />
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14">
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
              <div>
                <p className="text-slate-800 font-extrabold tracking-tight text-lg">
                  Impossible de charger le crédit
                </p>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  {error}
                </p>
              </div>
              <Link
                to="/client/loans"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                           shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30
                           hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                Retour à mes crédits
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

  const mensualiteEstimee = calculerMensualite(
    loan.montant,
    loan.tauxInteret,
    loan.dureeMois,
  );

  const meta = STATUS_META[loan.status] || STATUS_META.closed;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white capitalize">
                {loan.objet}
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
                to="/client/loans"
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
                Mes crédits
              </Link>
              <span className="text-slate-700">·</span>
              {/* Status badge in hero */}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Reference bar ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
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
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Référence du dossier
              </span>
            </div>
            <span className="font-mono font-bold text-slate-800 text-sm">
              #{loan._id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ── Left: main info ── */}
          <div className="md:col-span-2 space-y-6">
            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="p-6 sm:p-8">
                {/* Section header */}
                <div className="flex items-center gap-2 mb-6">
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                    Détails du crédit
                  </h2>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Montant",
                      value: formatTND(loan.montant),
                      color: "text-slate-800",
                    },
                    {
                      label: "Durée",
                      value: `${loan.dureeMois} mois`,
                      color: "text-slate-800",
                    },
                    {
                      label: "Taux Fixe",
                      value: `${loan.tauxInteret}%`,
                      color: "text-slate-800",
                    },
                    {
                      label: "Mensualité",
                      value:
                        loan.status === "pending" || loan.status === "rejected"
                          ? formatTND(mensualiteEstimee)
                          : loan.remboursements?.[0]?.montant
                            ? formatTND(loan.remboursements[0].montant)
                            : formatTND(mensualiteEstimee),
                      color: "text-blue-600",
                      note:
                        loan.status === "pending" || loan.status === "rejected"
                          ? "*Estimation avant validation finale"
                          : null,
                    },
                  ].map(({ label, value, color, note }) => (
                    <div
                      key={label}
                      className="bg-slate-50 rounded-xl border border-slate-100 p-4"
                    >
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                        {label}
                      </p>
                      <p
                        className={`text-lg font-extrabold tracking-tight ${color}`}
                      >
                        {value}
                      </p>
                      {note && (
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                          {note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Admin comment */}
                {loan.commentaireAdmin && (
                  <div className="mt-6 bg-blue-50/60 p-5 rounded-xl border border-blue-100 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4.5 h-4.5"
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
                      <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-1.5">
                        Message de votre conseiller
                      </h4>
                      <p className="text-sm text-blue-800 italic leading-relaxed">
                        "{loan.commentaireAdmin}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: documents ── */}
          <div className="space-y-6">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                    Documents Officiels
                  </h3>
                </div>

                <div className="space-y-3">
                  {loan.status === "approved" ||
                  loan.status === "active" ||
                  loan.status === "closed" ? (
                    <>
                      {/* Contract download */}
                      <button
                        onClick={downloadContract}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50
                                   border border-slate-200 hover:border-blue-200 rounded-xl
                                   transition-all duration-150 group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <svg
                              className="w-4.5 h-4.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.25 1.042v13.5l-3.3-3.3L6.5 12.688 12 18.188l5.5-5.5-1.45-1.446-3.3 3.3V1.042h-1.5zM2.5 20.25v2.25h19v-2.25h-19z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">
                              Contrat de Crédit
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              Format PDF
                            </p>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>

                      {/* Schedule download */}
                      <button
                        onClick={downloadSchedule}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50
                                   border border-slate-200 hover:border-blue-200 rounded-xl
                                   transition-all duration-150 group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <svg
                              className="w-4.5 h-4.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.25 1.042v13.5l-3.3-3.3L6.5 12.688 12 18.188l5.5-5.5-1.45-1.446-3.3 3.3V1.042h-1.5zM2.5 20.25v2.25h19v-2.25h-19z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">
                              Échéancier de Paiement
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              Format PDF
                            </p>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    /* Locked state */
                    <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-snug">
                        Les documents officiels seront disponibles une fois le
                        crédit approuvé.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Amortization table ── */}
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
                      Tableau d'amortissement
                    </h3>
                    <span className="ml-1 text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {loan.remboursements.length} échéance
                      {loan.remboursements.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <button
                    onClick={downloadSchedule}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                               border border-slate-200 bg-slate-50 text-slate-700
                               hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700
                               disabled:opacity-50 transition-all duration-150"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.25 1.042v13.5l-3.3-3.3L6.5 12.688 12 18.188l5.5-5.5-1.45-1.446-3.3 3.3V1.042h-1.5zM2.5 20.25v2.25h19v-2.25h-19z" />
                    </svg>
                    Télécharger l'échéancier PDF
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-900 to-blue-900">
                        {[
                          "N° Échéance",
                          "Date Limite",
                          "Mensualité",
                          "Pénalité",
                          "Statut",
                          "Date de Règlement",
                          "",
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
                      {loan.remboursements.map((echeance, index) => {
                        const isPaid = echeance.status === "paid";
                        const isLate = echeance.penalite > 0;

                        return (
                          <tr
                            key={echeance._id || index}
                            className={`transition-colors duration-100 hover:bg-blue-50/50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                          >
                            {/* N° Échéance */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-extrabold shrink-0">
                                  {index + 1}
                                </span>
                                <span className="font-semibold text-slate-700">
                                  Mois {index + 1}
                                </span>
                              </div>
                            </td>

                            {/* Date Limite */}
                            <td className="px-4 py-3 text-slate-500 font-medium text-xs">
                              {new Date(
                                echeance.dateEcheance,
                              ).toLocaleDateString("fr-TN")}
                            </td>

                            {/* Mensualité */}
                            <td className="px-4 py-3 font-semibold text-slate-800 font-mono">
                              {formatTND(echeance.montant)}
                            </td>

                            {/* Pénalité */}
                            <td className="px-4 py-3 font-mono">
                              {isLate ? (
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
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-teal-50 text-teal-700 border-teal-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                  Payé
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  En attente
                                </span>
                              )}
                            </td>

                            {/* Date de Règlement */}
                            <td className="px-4 py-3 text-slate-400 font-medium text-xs">
                              {isPaid && echeance.payeLe ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                  <span>
                                    {new Date(
                                      echeance.payeLe,
                                    ).toLocaleDateString("fr-TN")}
                                  </span>
                                  {echeance.justificatifPaiement && (
                                    <DocumentViewer
                                      filename={echeance.justificatifPaiement
                                        .split("/")
                                        .pop()}
                                      label="(Preuve de virement)"
                                    />
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="px-4 py-3 text-right">
                              {isPaid && (
                                <button
                                  onClick={downloadSchedule}
                                  title="Télécharger l'échéancier PDF"
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg
                                             bg-slate-50 border border-slate-200 text-slate-500
                                             hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600
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
                            </td>
                          </tr>
                        );
                      })}
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
              Besoin d'estimer un nouveau crédit ?
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Utilisez le simulateur gratuit avant de déposer votre dossier.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/simulation"
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Simuler
            </Link>
            <Link
              to="/client/apply-loan"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nouvelle demande
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
