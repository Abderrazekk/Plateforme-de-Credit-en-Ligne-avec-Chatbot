/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
const DUREE_OPTIONS = [
  { label: "Toutes durées", value: "all" },
  { label: "≤ 12 mois", value: "0-12" },
  { label: "13 – 36 mois", value: "13-36" },
  { label: "37 – 60 mois", value: "37-60" },
  { label: "> 60 mois", value: "61-999" },
];
const DATE_OPTIONS = [
  { label: "Toutes dates", value: "all" },
  { label: "Aujourd'hui", value: "today" },
  { label: "7 derniers jours", value: "7d" },
  { label: "30 derniers jours", value: "30d" },
  { label: "Cette année", value: "year" },
];

/* ─────────────────────────────────────────────
   Dropdown menu for a single row
───────────────────────────────────────────── */
function ActionMenu({ loan, onApprove, onReject, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const isPending = loan.status === "pending";

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* trigger — 3-dot button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: open ? "#eff6ff" : "transparent",
          border: open ? "1px solid #bfdbfe" : "1px solid transparent",
          cursor: "pointer",
          transition: "all 0.15s",
          color: "#64748b",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
        title="Actions"
      >
        {/* vertical 3-dots icon */}
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {/* dropdown panel — renders in a portal-like fixed position to escape any overflow:hidden parent */}
      {open && (
        <DropdownPanel
          anchorRef={ref}
          onClose={() => setOpen(false)}
          loan={loan}
          isPending={isPending}
          navigate={navigate}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

/* Renders the menu attached to the anchor using fixed positioning — escapes ALL overflow:hidden ancestors */
function DropdownPanel({
  anchorRef,
  onClose,
  loan,
  isPending,
  // eslint-disable-next-line no-unused-vars
  navigate,
  onApprove,
  onReject,
  onDelete,
}) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const panelWidth = 180;
    const spaceRight = window.innerWidth - rect.right;
    const left =
      spaceRight >= panelWidth
        ? rect.right - panelWidth /* align right edge to button right */
        : rect.left - panelWidth + rect.width; /* flip left if near edge */

    setPos({ top: rect.bottom + 6, left: Math.max(8, left) });
  }, [anchorRef]);

  /* item style helpers */
  const itemBase = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 600,
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: "6px",
    transition: "background 0.12s",
    textDecoration: "none",
    color: "#334155",
  };

  const hoverItem = (e, bg = "#f1f5f9") => {
    e.currentTarget.style.background = bg;
  };
  const leaveItem = (e) => {
    e.currentTarget.style.background = "none";
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: "180px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow:
          "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.06)",
        zIndex: 9999,
        padding: "4px",
        animation: "fadeInDown 0.12s ease",
      }}
    >
      <style>{`@keyframes fadeInDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Détails */}
      <Link
        to={`/admin/loans/${loan._id}`}
        style={{ ...itemBase }}
        onMouseEnter={(e) => hoverItem(e, "#eff6ff")}
        onMouseLeave={leaveItem}
        onClick={onClose}
      >
        <span style={{ color: "#3b82f6", flexShrink: 0 }}>
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </span>
        Voir les détails
      </Link>

      {isPending && (
        <>
          {/* separator */}
          <div
            style={{ height: "1px", background: "#f1f5f9", margin: "2px 8px" }}
          />

          {/* Approuver */}
          <button
            style={{ ...itemBase, color: "#0f766e" }}
            onMouseEnter={(e) => hoverItem(e, "#f0fdfa")}
            onMouseLeave={leaveItem}
            onClick={() => {
              onClose();
              onApprove(loan._id);
            }}
          >
            <span style={{ color: "#14b8a6", flexShrink: 0 }}>
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            Approuver
          </button>

          {/* Rejeter */}
          <button
            style={{ ...itemBase, color: "#b91c1c" }}
            onMouseEnter={(e) => hoverItem(e, "#fef2f2")}
            onMouseLeave={leaveItem}
            onClick={() => {
              onClose();
              onReject(loan._id);
            }}
          >
            <span style={{ color: "#ef4444", flexShrink: 0 }}>
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
            Rejeter
          </button>

          {/* separator */}
          <div
            style={{ height: "1px", background: "#f1f5f9", margin: "2px 8px" }}
          />

          {/* Supprimer */}
          <button
            style={{ ...itemBase, color: "#dc2626" }}
            onMouseEnter={(e) => hoverItem(e, "#fef2f2")}
            onMouseLeave={leaveItem}
            onClick={() => {
              onClose();
              onDelete(loan._id);
            }}
          >
            <span style={{ color: "#ef4444", flexShrink: 0 }}>
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </span>
            Supprimer
          </button>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function LoanApplications() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dureeFilter, setDureeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  const fetchLoans = () => {
    setLoading(true);
    let query = `/loans?status=${statusFilter}`;
    if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;
    api
      .get(query)
      .then((res) => setLoans(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Erreur lors du chargement"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLoans();
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Voulez-vous approuver cette demande ?")) return;
    try {
      await api.patch(`/loans/${id}/status`, { status: "approved" });
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de traitement");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Voulez-vous rejeter cette demande ?")) return;
    try {
      await api.patch(`/loans/${id}/status`, { status: "rejected" });
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de traitement");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette demande de crédit ? Cette action est irréversible.",
      )
    )
      return;
    try {
      await api.delete(`/loans/${id}`);
      setLoans((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la suppression de la demande.");
    }
  };

  const filtered = useMemo(() => {
    let list = [...loans];
    if (dureeFilter !== "all") {
      const [min, max] = dureeFilter.split("-").map(Number);
      list = list.filter((l) => l.dureeMois >= min && l.dureeMois <= max);
    }
    if (dateFilter !== "all") {
      const now = new Date();
      list = list.filter((l) => {
        const c = new Date(l.createdAt);
        if (dateFilter === "today")
          return c.toDateString() === now.toDateString();
        if (dateFilter === "7d") return now - c <= 7 * 86400000;
        if (dateFilter === "30d") return now - c <= 30 * 86400000;
        if (dateFilter === "year") return c.getFullYear() === now.getFullYear();
        return true;
      });
    }
    list.sort((a, b) => {
      if (sortBy === "date_desc")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "date_asc")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount_desc") return b.montant - a.montant;
      if (sortBy === "amount_asc") return a.montant - b.montant;
      if (sortBy === "duree_desc") return b.dureeMois - a.dureeMois;
      if (sortBy === "duree_asc") return a.dureeMois - b.dureeMois;
      return 0;
    });
    return list;
  }, [loans, dureeFilter, dateFilter, sortBy]);

  const counts = useMemo(() => {
    const c = { all: loans.length };
    ALL_STATUSES.slice(1).forEach((s) => {
      c[s] = loans.filter((l) => l.status === s).length;
    });
    return c;
  }, [loans]);

  const resetFilters = () => {
    setDureeFilter("all");
    setDateFilter("all");
    setSortBy("date_desc");
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    dureeFilter !== "all" ||
    dateFilter !== "all" ||
    sortBy !== "date_desc" ||
    searchTerm;

  const selectCls = `appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5
    text-sm text-slate-700 font-medium outline-none cursor-pointer
    focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all duration-200`;

  const ChevronDown = () => (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );

  if (error)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 pb-14">
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
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 pt-8 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
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
                Demandes de crédit
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Gérez et traitez l'ensemble des dossiers clients.
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Filters card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1 flex gap-2"
              >
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
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5
                      text-sm text-slate-700 font-medium placeholder:text-slate-400
                      outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all duration-200"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
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
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                    bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                    shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30
                    hover:scale-[1.02] active:scale-95 transition-all duration-200"
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
                      d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
                    />
                  </svg>
                  Filtrer
                </button>
              </form>
              <div className="relative shrink-0">
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
                  className={selectCls}
                >
                  <option value="date_desc">Date — plus récent</option>
                  <option value="date_asc">Date — plus ancien</option>
                  <option value="amount_desc">Montant — décroissant</option>
                  <option value="amount_asc">Montant — croissant</option>
                  <option value="duree_desc">Durée — décroissante</option>
                  <option value="duree_asc">Durée — croissante</option>
                </select>
                <ChevronDown />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={selectCls}
                >
                  {DATE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <select
                  value={dureeFilter}
                  onChange={(e) => setDureeFilter(e.target.value)}
                  className={selectCls}
                >
                  {DUREE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>{" "}
                <ChevronDown />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold
                    border border-slate-200 bg-slate-50 text-slate-500
                    hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Réinitialiser
                </button>
              )}
            </div>

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
                      className={`ml-0.5 font-bold ${isActive && s !== "all" ? meta.text : "text-slate-400"}`}
                    >
                      {counts[s]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 w-full bg-slate-100" />
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-9 h-9 bg-slate-100 rounded-full shrink-0" />
                  <div className="h-4 bg-slate-100 rounded-full flex-1" />
                  <div className="h-4 bg-slate-100 rounded-full w-20" />
                  <div className="h-4 bg-slate-100 rounded-full w-16" />
                  <div className="h-6 bg-slate-100 rounded-full w-20" />
                  <div className="h-4 bg-slate-100 rounded-full w-20" />
                  <div className="h-8 bg-slate-100 rounded-lg w-8" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
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
                Aucun dossier trouvé
              </p>
              <p className="text-slate-400 text-sm">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && filtered.length > 0 && (
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

              {/*
                The table wrapper scrolls horizontally.
                overflow-visible on the tbody/tr cells is handled by the fixed-position dropdown
                which escapes the scroll container entirely via position:fixed.
              */}
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table
                  className="w-full text-left border-collapse"
                  style={{ minWidth: "860px" }}
                >
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 to-blue-900">
                      {[
                        "Client",
                        "Montant",
                        "Type / Durée",
                        "Statut",
                        "Date",
                        "Traité par",
                        "",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-300 whitespace-nowrap"
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
                          {/* Client */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 overflow-hidden border border-slate-200 shadow-sm">
                                {loan.client?.avatar ? (
                                  <img
                                    src={`/${loan.client.avatar.replace(/\\/g, "/")}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (loan.client?.prenom?.[0]?.toUpperCase() ??
                                  "C")
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">
                                  {loan.client?.nom} {loan.client?.prenom}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium">
                                  {loan.client?.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Montant */}
                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                            {formatTND(loan.montant)}
                          </td>

                          {/* Type / Durée */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="block font-semibold text-slate-700 capitalize text-sm">
                              {loan.type}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {loan.dureeMois} mois
                            </span>
                          </td>

                          {/* Statut */}
                          <td className="px-4 py-3 whitespace-nowrap">
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
                          <td className="px-4 py-3 text-slate-400 font-medium text-xs whitespace-nowrap">
                            {new Date(loan.createdAt).toLocaleDateString(
                              "fr-TN",
                            )}
                          </td>

                          {/* Traité par */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {loan.reviewedBy ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                <svg
                                  className="w-3.5 h-3.5 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {loan.reviewedBy.nom} {loan.reviewedBy.prenom}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-slate-400">
                                —
                              </span>
                            )}
                          </td>

                          {/* ── 3-dot action menu ── */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <ActionMenu
                              loan={loan}
                              onApprove={handleApprove}
                              onReject={handleReject}
                              onDelete={handleDelete}
                            />
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
                Vue d'ensemble des performances
              </p>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                Consultez les indicateurs clés et les rapports détaillés.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/admin/reports"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  border border-white/20 text-slate-300 hover:text-white hover:border-white/40 transition-all duration-200"
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
                Rapports
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
        )}
      </div>
    </div>
  );
}
