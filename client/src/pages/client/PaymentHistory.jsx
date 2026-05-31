import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/payments/history")
      .then((res) => setPayments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments.reduce((s, p) => s + (p.montant || 0), 0);
  const totalPenalties = payments.reduce((s, p) => s + (p.penalite || 0), 0);
  const lateCount = payments.filter((p) => p.penalite > 0).length;

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
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Historique des paiements
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Retrouvez l'ensemble de vos remboursements effectués.
              </p>
            </div>
            <Link
              to="/client/dashboard"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors duration-150"
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
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── KPI summary cards ── */}
        {!loading && payments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                label: "Total remboursé",
                value: formatTND(totalPaid),
                accent: true,
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                ),
              },
              {
                label: "Nombre de paiements",
                value: payments.length,
                accent: false,
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                ),
              },
              {
                label: "Pénalités totales",
                value: totalPenalties > 0 ? formatTND(totalPenalties) : "—",
                accent: false,
                warn: totalPenalties > 0,
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-2xl border shadow-sm overflow-hidden ${
                  kpi.accent
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-transparent shadow-blue-500/20"
                    : "bg-white border-slate-100"
                }`}
              >
                <div
                  className={`h-1.5 w-full ${
                    kpi.accent
                      ? "bg-white/20"
                      : kpi.warn
                        ? "bg-amber-400"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600"
                  }`}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        kpi.accent
                          ? "bg-white/15"
                          : kpi.warn
                            ? "bg-amber-50"
                            : "bg-blue-50"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 ${
                          kpi.accent
                            ? "text-white/80"
                            : kpi.warn
                              ? "text-amber-500"
                              : "text-blue-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        viewBox="0 0 24 24"
                      >
                        {kpi.icon}
                      </svg>
                    </div>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        kpi.accent ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {kpi.label}
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-extrabold tracking-tight ${
                      kpi.accent
                        ? "text-white"
                        : kpi.warn
                          ? "text-amber-600"
                          : "text-slate-900"
                    }`}
                  >
                    {kpi.value}
                  </p>
                  {kpi.warn && lateCount > 0 && (
                    <p className="text-xs text-amber-500 font-medium mt-1">
                      {lateCount} paiement{lateCount > 1 ? "s" : ""} en retard
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 w-full bg-slate-100" />
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 bg-slate-100 rounded-full flex-1" />
                  <div className="h-4 bg-slate-100 rounded-full w-24" />
                  <div className="h-4 bg-slate-100 rounded-full w-24" />
                  <div className="h-4 bg-slate-100 rounded-full w-24" />
                  <div className="h-4 bg-slate-100 rounded-full w-16" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && payments.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
            <div className="p-12 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-slate-800 font-extrabold tracking-tight text-lg">
                  Aucun paiement effectué
                </p>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  Vos remboursements apparaîtront ici dès qu'un crédit sera
                  actif.
                </p>
              </div>
              <Link
                to="/client/apply-loan"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                           shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30
                           hover:scale-[1.02] active:scale-95 transition-all duration-200"
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
                Faire une demande de crédit
              </Link>
            </div>
          </div>
        )}

        {/* ── Payments table ── */}
        {!loading && payments.length > 0 && (
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
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                  Détail des paiements
                </h2>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  {payments.length} entrée{payments.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 to-blue-900">
                      {[
                        "Crédit",
                        "Montant",
                        "Date échéance",
                        "Date paiement",
                        "Pénalité",
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
                    {payments.map((p, idx) => {
                      const isLate = p.penalite > 0;
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors duration-100 hover:bg-blue-50/50 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <Link
                              to={`/client/loans/${p.loanId}`}
                              className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:text-blue-800 hover:underline capitalize transition-colors duration-150"
                            >
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-50 text-blue-500 text-[10px] font-extrabold shrink-0">
                                {idx + 1}
                              </span>
                              {p.objet}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {formatTND(p.montant)}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-medium">
                            {new Date(p.dateEcheance).toLocaleDateString(
                              "fr-TN",
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-medium">
                            {new Date(p.datePaiement).toLocaleDateString(
                              "fr-TN",
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isLate ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                <svg
                                  className="w-3 h-3 text-amber-500"
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
                                {formatTND(p.penalite)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                <svg
                                  className="w-3 h-3 text-teal-500"
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
                                À temps
                              </span>
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
        {!loading && (
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
            <div>
              <p className="text-white font-extrabold tracking-tight text-lg">
                Besoin de faire une nouvelle demande ?
              </p>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                Simulez d'abord votre crédit puis déposez votre dossier en
                quelques minutes.
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
                           shadow-md shadow-blue-500/25
                           hover:shadow-lg hover:shadow-blue-500/35 hover:scale-105
                           active:scale-95 transition-all duration-200"
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
        )}
      </div>
    </div>
  );
}
