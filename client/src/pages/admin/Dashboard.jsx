import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // eslint-disable-next-line no-unused-vars
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes] = await Promise.all([
          api.get("/dashboard/admin"),
          api.get("/dashboard/monthly-revenue"),
        ]);
        setStats(statsRes.data);
        setMonthlyRevenue(revenueRes.data);
      } catch (err) {
        console.error("Erreur chargement dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
                  <div key={i} className="h-24 bg-slate-100 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-64 bg-slate-100 rounded-xl" />
                <div className="h-64 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  /* ── Error state ── */
  if (!stats)
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
              <p className="text-slate-400 text-sm font-medium">
                Impossible de récupérer les données du tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  const pieData = [
    { name: "Approuvés", value: stats.totalApproved },
    { name: "Rejetés", value: stats.totalRejected },
    {
      name: "En attente",
      value: stats.totalLoans - stats.totalApproved - stats.totalRejected,
    },
  ];

  /* ── KPI group config ── */
  const kpiGroupA = [
    {
      title: "Crédits accordés",
      value: stats.totalApproved,
      accent: false,
      variant: "teal",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Crédits refusés",
      value: stats.totalRejected,
      accent: false,
      variant: "red",
      iconPath:
        "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Taux d'acceptation",
      value: `${stats.acceptanceRate}%`,
      accent: true,
      variant: "blue",
      iconPath:
        "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      title: "Montant total accordé",
      value: formatTND(stats.totalAmount),
      accent: false,
      variant: "amber",
      iconPath:
        "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const kpiGroupB = [
    {
      title: "Revenus ce mois",
      value: formatTND(stats.revenusMensuels),
      variant: "blue",
      iconPath:
        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      title: "Revenus cette année",
      value: formatTND(stats.revenusAnnuels),
      variant: "blue",
      iconPath:
        "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      title: "Intérêts générés",
      value: formatTND(stats.interetsGeneres),
      variant: "teal",
      iconPath: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    },
    {
      title: "Clients actifs",
      value: stats.activeClients,
      variant: "teal",
      iconPath:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  const kpiGroupC = [
    {
      title: "Paiements en retard",
      value: stats.retardsCount,
      variant: "red",
      warn: true,
      iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Montants impayés",
      value: formatTND(stats.retardsAmount),
      variant: "red",
      warn: true,
      iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Clients en retard",
      value: stats.clientsEnRetard,
      variant: "red",
      warn: true,
      iconPath:
        "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
  ];

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
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Tableau de bord
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Vue d'ensemble des performances et indicateurs clés.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimer le rapport
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── KPI Group A: loan decisions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiGroupA.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* ── KPI Group B: revenue ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiGroupB.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* ── KPI Group C: late payments ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpiGroupC.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line chart */}
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                  Revenus mensuels
                </h2>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  12 derniers mois
                </span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="mois"
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [formatTND(val), "Revenu"]}
                    contentStyle={{
                      background: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                    itemStyle={{ color: "#67e8f9" }}
                    cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenu"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#06b6d4", strokeWidth: 0 }}
                    name="Revenu"
                  />
                </LineChart>
              </ResponsiveContainer>
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
                  Répartition des demandes
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => val}
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
            </div>
          </div>
        </div>

        {/* ── Quick links ── */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
          <div>
            <p className="text-white font-extrabold tracking-tight text-lg">
              Accès rapide
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Gérez les demandes, clients et consultez les rapports détaillés.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/admin/loans"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
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
              Gérer les demandes
            </Link>
            <Link
              to="/admin/users"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Gérer les clients
            </Link>
            <Link
              to="/admin/reports"
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Rapports détaillés
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── KPI card component ── */
const VARIANT_MAP = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    bar: "bg-gradient-to-r from-cyan-500 to-blue-600",
    value: "text-slate-900",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600",
    bar: "bg-teal-400",
    value: "text-slate-900",
  },
  amber: {
    icon: "bg-amber-50 text-amber-500",
    bar: "bg-amber-400",
    value: "text-slate-900",
  },
  red: {
    icon: "bg-red-50 text-red-500",
    bar: "bg-red-400",
    value: "text-red-600",
  },
};

function KpiCard({
  title,
  value,
  iconPath,
  variant = "blue",
  accent = false,
  warn = false,
}) {
  const v = VARIANT_MAP[variant] || VARIANT_MAP.blue;

  if (accent) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-blue-500/20">
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
                  d={iconPath}
                />
              </svg>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              {title}
            </p>
          </div>
          <p className="text-2xl font-extrabold tracking-tight text-white">
            {value}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className={`h-1.5 w-full ${warn ? "bg-red-400" : v.bar}`} />
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
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
            </svg>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
        </div>
        <p
          className={`text-2xl font-extrabold tracking-tight ${warn ? "text-red-600" : "text-slate-900"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
