import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatTND } from "../../utils/formatCurrency";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/loans/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const kpiCards = stats
    ? [
        {
          label: "Total demandes",
          value: stats.totalLoans,
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          ),
          accent: false,
          color: "text-blue-600",
        },
        {
          label: "En attente",
          value: stats.pendingLoans,
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          accent: false,
          color: "text-amber-500",
        },
        {
          label: "Crédits en cours",
          value: stats.activeLoans,
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          accent: true,
          color: "text-white",
        },
        {
          label: "Total emprunté",
          value: formatTND(stats.totalBorrowed),
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
          accent: false,
          color: "text-slate-800",
        },
      ]
    : [];

  const quickLinks = [
    {
      to: "/client/apply-loan",
      label: "Nouvelle demande",
      description: "Déposer un nouveau dossier",
      primary: true,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      ),
    },
    {
      to: "/client/loans",
      label: "Mes demandes",
      description: "Suivre l'état de vos dossiers",
      primary: false,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      ),
    },
    {
      to: "/client/payments",
      label: "Historique paiements",
      description: "Consulter vos remboursements",
      primary: false,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      ),
    },
    {
      to: "/client/profile",
      label: "Mon profil",
      description: "Gérer vos informations",
      primary: false,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Logo / brand */}
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

          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Bonjour, {user?.prenom} 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Voici un aperçu de vos crédits et de votre activité.
              </p>
            </div>
            {/* Quick action pill */}
            <Link
              to="/client/apply-loan"
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
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
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── KPI cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-1.5 w-full bg-slate-100" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-24 bg-slate-100 rounded-full" />
                  <div className="h-7 w-16 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-2xl border shadow-sm overflow-hidden ${
                  kpi.accent
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-transparent shadow-blue-500/20"
                    : "bg-white border-slate-100"
                }`}
              >
                <div
                  className={`h-1.5 w-full ${kpi.accent ? "bg-white/20" : "bg-gradient-to-r from-cyan-500 to-blue-600"}`}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        kpi.accent ? "bg-white/15" : "bg-blue-50"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 ${kpi.accent ? "text-white/80" : "text-blue-500"}`}
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
                      kpi.accent ? "text-white" : kpi.color
                    }`}
                  >
                    {kpi.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-red-400" />
            <div className="p-6 flex items-center gap-3">
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
              <p className="text-sm font-medium text-red-600">
                Impossible de charger les statistiques. Veuillez réessayer.
              </p>
            </div>
          </div>
        )}

        {/* ── Quick access ── */}
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                Accès rapide
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex flex-col gap-3 rounded-xl p-4 border transition-all duration-200
                    ${
                      link.primary
                        ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-transparent text-white shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 hover:scale-[1.02]"
                        : "bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 hover:scale-[1.02]"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      link.primary
                        ? "bg-white/15"
                        : "bg-white border border-slate-100"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${link.primary ? "text-white" : "text-blue-500"}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      viewBox="0 0 24 24"
                    >
                      {link.icon}
                    </svg>
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        link.primary ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {link.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        link.primary ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
          <div>
            <p className="text-white font-extrabold tracking-tight text-lg">
              Besoin d'estimer votre crédit ?
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Utilisez notre simulateur gratuit avant de déposer une demande.
            </p>
          </div>
          <Link
            to="/simulate"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Lancer la simulation
          </Link>
        </div>
      </div>
    </div>
  );
}
