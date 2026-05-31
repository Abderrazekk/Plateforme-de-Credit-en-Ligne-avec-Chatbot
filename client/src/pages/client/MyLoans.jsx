import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatTND } from "../../utils/formatCurrency";

const STATUS_META = {
  pending: {
    label: "En attente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approuvé",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-100",
    dot: "bg-teal-400",
  },
  rejected: {
    label: "Rejeté",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    dot: "bg-red-400",
  },
  active: {
    label: "En cours",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    dot: "bg-blue-400",
  },
  closed: {
    label: "Clôturé",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

const ALL_STATUSES = [
  "all",
  "pending",
  "approved",
  "active",
  "rejected",
  "closed",
];

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  useEffect(() => {
    api
      .get("/loans/user")
      .then((res) => setLoans(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Erreur de chargement"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...loans];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.objet?.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      list = list.filter((l) => l.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "date_desc")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "date_asc")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount_desc") return b.montant - a.montant;
      if (sortBy === "amount_asc") return a.montant - b.montant;
      return 0;
    });

    return list;
  }, [loans, search, statusFilter, sortBy]);

  const counts = useMemo(() => {
    const c = { all: loans.length };
    ALL_STATUSES.slice(1).forEach((s) => {
      c[s] = loans.filter((l) => l.status === s).length;
    });
    return c;
  }, [loans]);

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
                Mes demandes de crédit
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Suivez l'état de tous vos dossiers en un seul endroit.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/client/dashboard"
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
              </Link>
              <span className="text-slate-700">·</span>
              <Link
                to="/client/apply-loan"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nouvelle demande
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Error state ── */}
        {error && (
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
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 w-full bg-slate-100" />
            <div className="p-6 space-y-4">
              <div className="flex gap-3 mb-6">
                <div className="h-9 flex-1 bg-slate-100 rounded-xl" />
                <div className="h-9 w-32 bg-slate-100 rounded-xl" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-4 bg-slate-100 rounded-full flex-1" />
                  <div className="h-4 bg-slate-100 rounded-full w-20" />
                  <div className="h-4 bg-slate-100 rounded-full w-16" />
                  <div className="h-6 bg-slate-100 rounded-full w-20" />
                  <div className="h-4 bg-slate-100 rounded-full w-20" />
                  <div className="h-4 bg-slate-100 rounded-full w-12" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Filters & search card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="p-5 space-y-4">
                {/* Search + sort row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
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
                      placeholder="Rechercher par objet..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5
                                 text-sm text-slate-700 font-medium placeholder:text-slate-400
                                 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white
                                 transition-all duration-200"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Effacer la recherche"
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

                  {/* Sort */}
                  <div className="relative">
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
                          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                        />
                      </svg>
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5
                                 text-sm text-slate-700 font-medium
                                 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white
                                 transition-all duration-200 cursor-pointer"
                    >
                      <option value="date_desc">Date — plus récent</option>
                      <option value="date_asc">Date — plus ancien</option>
                      <option value="amount_desc">Montant — décroissant</option>
                      <option value="amount_asc">Montant — croissant</option>
                    </select>
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
                </div>

                {/* Status filter pills */}
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((s) => {
                    const meta = s === "all" ? null : STATUS_META[s];
                    const isActive = statusFilter === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                          ${
                            isActive
                              ? s === "all"
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-sm shadow-blue-500/20"
                                : `${meta.bg} ${meta.text} ${meta.border} shadow-sm`
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                          }`}
                      >
                        {meta && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? meta.dot : "bg-slate-300"}`}
                          />
                        )}
                        {s === "all" ? "Tous" : meta.label}
                        <span
                          className={`ml-0.5 ${isActive && s !== "all" ? meta.text : "text-slate-400"} font-bold`}
                        >
                          {counts[s]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Empty state (no loans at all) ── */}
            {loans.length === 0 && (
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-800 font-extrabold tracking-tight text-lg">
                      Aucune demande pour l'instant
                    </p>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                      Déposez votre premier dossier de crédit en quelques
                      minutes.
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

            {/* ── No results from filter/search ── */}
            {loans.length > 0 && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="p-10 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-slate-400"
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
                  <p className="text-slate-700 font-semibold">
                    Aucun résultat trouvé
                  </p>
                  <p className="text-slate-400 text-sm">
                    Essayez de modifier votre recherche ou le filtre de statut.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            )}

            {/* ── Loans table ── */}
            {filtered.length > 0 && (
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                      Dossiers de crédit
                    </h2>
                    <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-900 to-blue-900">
                          {[
                            "Objet",
                            "Montant",
                            "Durée",
                            "Statut",
                            "Date",
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
                        {filtered.map((loan, idx) => {
                          const meta =
                            STATUS_META[loan.status] || STATUS_META.closed;
                          return (
                            <tr
                              key={loan._id}
                              className={`transition-colors duration-100 hover:bg-blue-50/50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                            >
                              {/* Objet */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-extrabold shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="font-semibold text-slate-800 capitalize">
                                    {loan.objet}
                                  </span>
                                </div>
                              </td>

                              {/* Montant */}
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {formatTND(loan.montant)}
                              </td>

                              {/* Durée */}
                              <td className="px-4 py-3 text-slate-500 font-medium">
                                {loan.dureeMois} mois
                              </td>

                              {/* Statut */}
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                                  />
                                  {meta.label}
                                </span>
                              </td>

                              {/* Date */}
                              <td className="px-4 py-3 text-slate-400 font-medium text-xs">
                                {new Date(loan.createdAt).toLocaleDateString(
                                  "fr-TN",
                                )}
                              </td>

                              {/* Action */}
                              <td className="px-4 py-3 text-right">
                                <Link
                                  to={`/client/loans/${loan._id}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-150 group"
                                >
                                  Détails
                                  <svg
                                    className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
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
                                </Link>
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
          </>
        )}

        {/* ── CTA banner ── */}
        {!loading && (
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
        )}
      </div>
    </div>
  );
}
 