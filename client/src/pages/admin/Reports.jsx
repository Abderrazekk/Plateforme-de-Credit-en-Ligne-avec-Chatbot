import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  pending: "#facc15",
  approved: "#4ade80",
  rejected: "#f87171",
  active: "#60a5fa",
  closed: "#9ca3af",
};

const STATUS_LABELS = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  active: "En cours",
  closed: "Clôturé",
};

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [statusDist, setStatusDist] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/reports/summary"),
      api.get("/reports/monthly"),
      api.get("/reports/status"),
    ])
      .then(([summaryRes, monthlyRes, statusRes]) => {
        setSummary(summaryRes.data);
        const formatted = monthlyRes.data.map((item) => ({
          mois: `${item._id.month}/${item._id.year}`,
          demandes: item.count,
          montant: item.totalAmount,
        }));
        setMonthly(formatted);
        const statusData = statusRes.data.map((item) => ({
          name: item._id,
          value: item.count,
        }));
        setStatusDist(statusData);
      })
      .catch(console.error);
  }, []);

  const kpis = summary
    ? [
        {
          label: "Total demandes",
          value: summary.totalLoans,
          variant: "blue",
          accent: true,
          iconPath:
            "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        },
        {
          label: "Crédits en cours",
          value: summary.activeLoans,
          variant: "teal",
          accent: false,
          iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
        },
        {
          label: "Crédits clôturés",
          value: summary.closedLoans,
          variant: "slate",
          accent: false,
          iconPath:
            "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        },
        {
          label: "Total décaissé",
          value: formatTND(summary.totalAmountDisbursed),
          variant: "amber",
          accent: false,
          iconPath:
            "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
          label: "Taux de remboursement",
          value: `${summary.repaymentRate}%`,
          variant: "blue",
          accent: false,
          iconPath:
            "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        },
      ]
    : [];

  const VARIANT_STYLES = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      bar: "bg-gradient-to-r from-cyan-500 to-blue-600",
    },
    teal: { icon: "bg-teal-50 text-teal-600", bar: "bg-teal-400" },
    slate: { icon: "bg-slate-100 text-slate-500", bar: "bg-slate-300" },
    amber: { icon: "bg-amber-50 text-amber-500", bar: "bg-amber-400" },
  };

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
              <span className="ml-2 text-slate-600">· Admin</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Rapports
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Analyse détaillée des activités et indicateurs de performance.
              </p>
            </div>
            <Link
              to="/admin/dashboard"
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
              Tableau de bord
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── KPI cards ── */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((kpi) => {
              const v = VARIANT_STYLES[kpi.variant] || VARIANT_STYLES.blue;
              if (kpi.accent) {
                return (
                  <div
                    key={kpi.label}
                    className="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-cyan-500 to-blue-600 shadow-blue-500/20"
                  >
                    <div className="h-1.5 w-full bg-white/20" />
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                          <svg
                            className="w-3.5 h-3.5 text-white/80"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={kpi.iconPath}
                            />
                          </svg>
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                          {kpi.label}
                        </p>
                      </div>
                      <p className="text-2xl font-extrabold tracking-tight text-white">
                        {kpi.value}
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={kpi.label}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className={`h-1.5 w-full ${v.bar}`} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${v.icon}`}
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
                            d={kpi.iconPath}
                          />
                        </svg>
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {kpi.label}
                      </p>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                      {kpi.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Loading skeleton (when summary not yet loaded) ── */}
        {!summary && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 w-full bg-slate-100" />
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-72 bg-slate-100 rounded-xl" />
                <div className="h-72 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                  Demandes par mois
                </h2>
              </div>
              {monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthly} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="mois"
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("fr-TN").format(value)
                      }
                      contentStyle={{
                        background: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                      itemStyle={{ color: "#67e8f9" }}
                      cursor={{ fill: "#f1f5f9", opacity: 0.5 }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#94a3b8",
                        paddingTop: "12px",
                      }}
                    />
                    <Bar
                      dataKey="demandes"
                      fill="#3b82f6"
                      name="Nombre de demandes"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="montant"
                      fill="#f59e0b"
                      name="Montant total"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center gap-3">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                    Aucune donnée mensuelle.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pie chart */}
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
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                  Répartition par statut
                </h2>
              </div>
              {statusDist.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusDist}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${STATUS_LABELS[name] || name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                      >
                        {statusDist.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[entry.name] || "#ccc"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => value}
                        contentStyle={{
                          background: "#0f172a",
                          border: "none",
                          borderRadius: "12px",
                          color: "#f1f5f9",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend pills */}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {statusDist.map((entry) => (
                      <span
                        key={entry.name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: COLORS[entry.name] || "#ccc",
                          }}
                        />
                        {STATUS_LABELS[entry.name] || entry.name}
                        <span className="font-bold text-slate-800 ml-0.5">
                          {entry.value}
                        </span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center gap-3">
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
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                    Aucune donnée.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
          <div>
            <p className="text-white font-extrabold tracking-tight text-lg">
              Gérer les demandes de crédit
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Accédez aux dossiers clients et au tableau de bord administrateur.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/admin/loans"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Demandes
            </Link>
            <Link
              to="/admin/dashboard"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
