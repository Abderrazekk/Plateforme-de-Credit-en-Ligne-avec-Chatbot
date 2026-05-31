/* eslint-disable react-hooks/static-components */
import { useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { Link, useNavigate } from "react-router-dom";
import { formatTND } from "../utils/formatCurrency";
import { getTauxInteret } from "../utils/loanCalculator"; // <-- NOUVEL IMPORT ICI
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  // eslint-disable-next-line no-unused-vars
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981"];

export default function Simulation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    montant: 5000,
    duree: 12, // <-- taux supprimé de l'état car calculé automatiquement
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const { mensualite, coutTotal, amortization } = useMemo(() => {
    const montant = form.montant || 0;
    const duree = Math.max(1, form.duree || 1);
    const taux = getTauxInteret(duree); // <-- TAUX CALCULÉ DYNAMIQUEMENT
    const tauxMensuel = taux / 100 / 12;
    let mensualite = 0;
    if (tauxMensuel === 0) {
      mensualite = montant / duree;
    } else if (montant > 0) {
      mensualite =
        (montant * tauxMensuel * Math.pow(1 + tauxMensuel, duree)) /
        (Math.pow(1 + tauxMensuel, duree) - 1);
    }
    mensualite = Math.round(mensualite * 1000) / 1000;
    const coutTotal = mensualite * duree;

    const schedule = [];
    let balance = montant;
    for (let i = 1; i <= duree; i++) {
      const interest = balance * tauxMensuel;
      const principal = mensualite - interest;
      balance -= principal;
      if (balance < 0) balance = 0;
      schedule.push({
        mois: i,
        mensualite: mensualite,
        interet: Math.round(interest * 1000) / 1000,
        principal: Math.round(principal * 1000) / 1000,
        balance: Math.round(balance * 1000) / 1000,
      });
    }

    return { mensualite, coutTotal, amortization: schedule };
  }, [form]);

  const pieData = useMemo(() => {
    const totalInterest = amortization.reduce((sum, m) => sum + m.interet, 0);
    const totalPrincipal = form.montant || 0;
    return [
      { name: "Principal", value: totalPrincipal },
      { name: "Intérêts", value: totalInterest },
    ];
  }, [amortization, form.montant]);

  const goToApply = () => {
    navigate(`/client/apply-loan?montant=${form.montant}&duree=${form.duree}`);
  };

  const totalInterets = amortization.reduce((s, m) => s + m.interet, 0);
  const tauxEffectif =
    form.montant > 0
      ? ((totalInterets / form.montant) * 100).toFixed(2)
      : "0.00";

  /* ── Custom tooltip for recharts ── */
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-slate-500">{p.name} :</span>
            <span className="font-extrabold text-slate-900">
              {formatTND(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Simulation de crédit
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium max-w-lg">
            Calculez vos mensualités avant de faire votre demande officielle.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ══ Row 1: Params + Summary ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Parameters card ── */}
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                  Paramètres
                </h2>
              </div>

              <div className="space-y-4">
                {/* Montant */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                    Montant (TND)
                  </label>
                  <input
                    type="number"
                    name="montant"
                    value={form.montant}
                    onChange={handleChange}
                    min="500"
                    max="100000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5
                               text-sm text-slate-700 font-medium
                               outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white
                               transition-all duration-200"
                  />
                  {/* Quick presets */}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[2000, 5000, 10000, 20000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setForm((p) => ({ ...p, montant: v }))}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all duration-150
                          ${
                            form.montant === v
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                          }`}
                      >
                        {(v / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taux (NOUVEAU : Lecture Seule) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                    Taux d'intérêt annuel (%)
                  </label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 font-bold">
                    {getTauxInteret(form.duree)} %
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Le taux est défini automatiquement selon la durée.
                  </p>
                </div>

                {/* Durée (NOUVEAU : Boutons stricts) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                    Durée (mois)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[3, 6, 12, 18, 24, 36, 48, 60].map((m) => (
                      <button
                        key={m}
                        onClick={() => setForm((p) => ({ ...p, duree: m }))}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all duration-150
                          ${
                            form.duree === m
                              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-transparent shadow-sm shadow-blue-500/20"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                          }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                  {/* Hidden select for form value (keeps handleChange working) */}
                  <select
                    name="duree"
                    value={form.duree}
                    onChange={handleChange}
                    className="sr-only"
                    aria-hidden="true"
                  >
                    {[3, 6, 12, 18, 24, 36, 48, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} mois
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Summary card ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                  Résultat de la simulation
                </h2>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  {
                    label: "Mensualité",
                    value: formatTND(mensualite),
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    ),
                    accent: true,
                  },
                  {
                    label: "Coût total",
                    value: formatTND(coutTotal),
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    ),
                    accent: false,
                  },
                  {
                    label: "Coût des intérêts",
                    value: `${tauxEffectif}%`,
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    ),
                    accent: false,
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className={`rounded-xl p-4 border ${
                      kpi.accent
                        ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-transparent text-white shadow-sm shadow-blue-500/20"
                        : "bg-slate-50 border-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className={`w-3.5 h-3.5 ${kpi.accent ? "text-white/70" : "text-blue-500"}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        viewBox="0 0 24 24"
                      >
                        {kpi.icon}
                      </svg>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${kpi.accent ? "text-white/70" : "text-slate-400"}`}
                      >
                        {kpi.label}
                      </span>
                    </div>
                    <p
                      className={`text-lg font-extrabold tracking-tight ${kpi.accent ? "text-white" : "text-slate-900"}`}
                    >
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pie chart + legend */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-1/2 h-52">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={76}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {pieData.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: COLORS[i] }}
                        />
                        <span className="text-xs font-semibold text-slate-600">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">
                        {formatTND(item.value)}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-100">
                    Répartition entre le capital emprunté et les intérêts sur la
                    durée choisie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Amortization table ══ */}
        {amortization.length > 0 && (
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
                  Échéancier prévisionnel
                </h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 to-blue-900">
                      {[
                        "Mois",
                        "Mensualité",
                        "Principal",
                        "Intérêt",
                        "Solde restant",
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
                    {amortization.map((row, idx) => (
                      <tr
                        key={row.mois}
                        className={`transition-colors duration-100 hover:bg-blue-50/50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                      >
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs font-extrabold">
                            {row.mois}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          {formatTND(row.mensualite)}
                        </td>
                        <td className="px-4 py-2.5 text-blue-600 font-medium">
                          {formatTND(row.principal)}
                        </td>
                        <td className="px-4 py-2.5 text-cyan-600 font-medium">
                          {formatTND(row.interet)}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                                style={{
                                  width: `${form.montant > 0 ? (row.balance / form.montant) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-slate-600 font-medium text-xs">
                              {formatTND(row.balance)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ Balance line chart ══ */}
        {amortization.length > 0 && (
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
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                  Évolution du solde restant
                </h2>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={amortization}
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="balanceGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="mois"
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Mois",
                      position: "insideBottomRight",
                      offset: -5,
                      fontSize: 11,
                      fill: "#94a3b8",
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  // eslint-disable-next-line react-hooks/static-components,
                  react-hooks/static-components
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="url(#balanceGrad)"
                    name="Solde restant"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#3b82f6",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ CTA ══ */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
          <div>
            <p className="text-white font-extrabold tracking-tight text-lg">
              Prêt à faire votre demande ?
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Vous serez redirigé avec ces paramètres pré-remplis.
            </p>
          </div>
          <button
            onClick={goToApply}
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold
                       bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                       shadow-md shadow-blue-500/25
                       hover:shadow-lg hover:shadow-blue-500/35 hover:scale-105
                       active:scale-95
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
            Passer à la demande officielle
          </button>
        </div>
      </div>
    </div>
  );
}
