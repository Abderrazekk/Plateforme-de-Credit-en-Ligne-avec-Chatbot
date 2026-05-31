import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all duration-200";

const selectCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all duration-200 cursor-pointer appearance-none";

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
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
  );
}

const ROLE_META = {
  admin: {
    label: "Administrateur",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    dot: "bg-red-400",
  },
  client: {
    label: "Client",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal and Form States (Creation)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    cin: "",
    password: "",
    role: "client",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // NEW: Custom Modals States (Ban & Delete)
  const [actionLoading, setActionLoading] = useState(false);
  const [banModal, setBanModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    isBanned: false,
    role: "",
  });
  const [banReasonInput, setBanReasonInput] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  const fetchUsers = () => {
    setLoading(true);
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Erreur de chargement"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await api.post("/users", formData);
      setUsers([...users, res.data]);
      setIsModalOpen(false);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        cin: "",
        password: "",
        role: "client",
      });
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // --- MODAL HANDLERS FOR BAN / UNBAN ---
  const openBanModal = (userId, isBanned, role, name) => {
    if (role === "admin") {
      alert("Vous ne pouvez pas suspendre un administrateur.");
      return;
    }
    setBanReasonInput("");
    setBanModal({ isOpen: true, userId, userName: name, isBanned, role });
  };

  const confirmToggleBan = async () => {
    const { userId, isBanned } = banModal;

    if (!isBanned && !banReasonInput.trim()) {
      alert("La raison de suspension est obligatoire pour bloquer un compte.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/users/${userId}/toggle-ban`, {
        banReason: banReasonInput,
      });

      // Update local state
      setUsers(
        users.map((u) =>
          u._id === userId
            ? {
                ...u,
                isBanned: res.data.isBanned,
                banReason: res.data.banReason,
              }
            : u,
        ),
      );
      setBanModal({
        isOpen: false,
        userId: null,
        userName: "",
        isBanned: false,
        role: "",
      });
    } catch (err) {
      alert(
        err.response?.data?.message || "Erreur lors du changement de statut",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --- MODAL HANDLERS FOR DELETE ---
  const openDeleteModal = (userId, name) => {
    setDeleteModal({ isOpen: true, userId, userName: name });
  };

  const confirmDeleteUser = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/users/${deleteModal.userId}`);
      setUsers(users.filter((u) => u._id !== deleteModal.userId));
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const isAgent = currentUser?.role === "agent";
  // eslint-disable-next-line no-unused-vars
  const isAdmin = currentUser?.role === "admin";

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
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {isAgent ? "Gestion des Clients" : "Gestion des Utilisateurs"}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                {isAgent
                  ? "Consultez et créez les fiches clients."
                  : "Gérez les comptes, attribuez des rôles et modérez les statuts."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
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
                {isAgent ? "Créer un client" : "Créer un utilisateur"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Error state ── */}
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

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 w-full bg-slate-100" />
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl shrink-0" />
                  <div className="h-4 bg-slate-100 rounded-full flex-1" />
                  <div className="h-4 bg-slate-100 rounded-full w-32" />
                  <div className="h-4 bg-slate-100 rounded-full w-24" />
                  <div className="h-6 bg-slate-100 rounded-full w-20" />
                  <div className="h-6 bg-slate-100 rounded-full w-16" />
                  <div className="h-4 bg-slate-100 rounded-full w-24" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Total",
                  value: users.length,
                  icon: (
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                  ),
                  iconBg: "bg-blue-50",
                },
                {
                  label: "Clients",
                  value: users.filter((u) => u.role === "client").length,
                  icon: (
                    <svg
                      className="w-4 h-4 text-slate-600"
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
                  ),
                  iconBg: "bg-slate-100",
                },
                {
                  label: "Agents",
                  value: users.filter((u) => u.role === "agent").length,
                  icon: (
                    <svg
                      className="w-4 h-4 text-purple-600"
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
                  ),
                  iconBg: "bg-purple-50",
                },
                {
                  label: "Suspendus",
                  value: users.filter((u) => u.isBanned).length,
                  icon: (
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
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  ),
                  iconBg: "bg-red-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                  <div className="p-4 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Users table card ── */}
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                    {isAgent ? "Fiches Clients" : "Comptes Utilisateurs"}
                  </h2>
                  <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {users.length} compte{users.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-900 to-blue-900">
                        {[
                          isAgent ? "Client" : "Utilisateur",
                          "Email",
                          "Téléphone",
                          "CIN",
                          ...(!isAgent ? ["Rôle"] : []),
                          "Crédits",
                          "Statut",
                          "Raison suspension",
                          ...(!isAgent ? ["Actions"] : []),
                        ].map((h, i) => (
                          <th
                            key={h + i}
                            className={`px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-300
                              first:rounded-tl-xl
                              ${!isAgent && h === "Actions" ? "text-right rounded-tr-xl" : ""}
                              ${isAgent && h === "Raison suspension" ? "rounded-tr-xl" : ""}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((u, idx) => {
                        const roleMeta = ROLE_META[u.role] || ROLE_META.client;
                        return (
                          <tr
                            key={u._id}
                            className={`transition-colors duration-100 hover:bg-blue-50/50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                          >
                            {/* Identity */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-[10px] shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                  {u.avatar ? (
                                    <img
                                      src={`/${u.avatar.replace(/\\/g, "/")}`}
                                      alt={`${u.prenom} ${u.nom}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    (u.prenom?.[0]?.toUpperCase() ?? "U")
                                  )}
                                </div>
                                <span className="font-semibold text-slate-800 text-sm">
                                  {u.nom} {u.prenom}
                                </span>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-4 py-3 text-slate-500 font-medium text-xs break-all max-w-[180px]">
                              {u.email}
                            </td>

                            {/* Telephone */}
                            <td className="px-4 py-3 text-slate-500 font-medium text-xs whitespace-nowrap">
                              {u.telephone || (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* CIN */}
                            <td className="px-4 py-3 font-mono text-slate-500 text-xs whitespace-nowrap">
                              {u.cin || (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Role */}
                            {!isAgent && (
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleMeta.bg} ${roleMeta.text} ${roleMeta.border}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot}`}
                                  />
                                  {roleMeta.label}
                                </span>
                              </td>
                            )}

                            {/* Credits */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {u.role === "client" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                  {u.loanCount || 0}{" "}
                                  {(u.loanCount || 0) > 1
                                    ? "demandes"
                                    : "demande"}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border
                                ${
                                  u.isBanned
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : "bg-teal-50 text-teal-700 border-teal-100"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${u.isBanned ? "bg-red-400" : "bg-teal-400"}`}
                                />
                                {u.isBanned ? "Suspendu" : "Actif"}
                              </span>
                            </td>

                            {/* Ban Reason */}
                            <td className="px-4 py-3 text-xs max-w-[220px]">
                              {u.isBanned && u.banReason ? (
                                <span className="italic text-red-500 font-medium leading-relaxed">
                                  {u.banReason}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            {!isAgent && (
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {u.role !== "admin" ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          openBanModal(
                                            u._id,
                                            u.isBanned,
                                            u.role,
                                            `${u.prenom} ${u.nom}`,
                                          )
                                        }
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                                          ${
                                            u.isBanned
                                              ? "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100"
                                              : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                                          }`}
                                      >
                                        {u.isBanned ? (
                                          <>
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
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                              />
                                            </svg>
                                            Réactiver
                                          </>
                                        ) : (
                                          <>
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
                                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                              />
                                            </svg>
                                            Suspendre
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          openDeleteModal(
                                            u._id,
                                            `${u.prenom} ${u.nom}`,
                                          )
                                        }
                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-150"
                                        title="Supprimer l'utilisateur"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={1.8}
                                          stroke="currentColor"
                                          className="w-3.5 h-3.5"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                          />
                                        </svg>
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                                      Protégé
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal accent strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-t-2xl" />
            <div className="p-6">
              {/* Modal header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                    {isAgent
                      ? "Ajouter un nouveau client"
                      : "Ajouter un nouvel utilisateur"}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Remplissez les informations obligatoires.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150"
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
              </div>

              {/* Form error */}
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-500 shrink-0"
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
                  <p className="text-xs font-medium text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Prénom</FieldLabel>
                    <input
                      type="text"
                      name="prenom"
                      required
                      value={formData.prenom}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Ex: Mohamed"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Nom</FieldLabel>
                    <input
                      type="text"
                      name="nom"
                      required
                      value={formData.nom}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Ex: Ben Ali"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Email</FieldLabel>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputCls}
                    placeholder="Ex: exemple@email.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Téléphone</FieldLabel>
                    <input
                      type="text"
                      name="telephone"
                      required
                      placeholder="Ex: 98123456"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <FieldLabel required>CIN</FieldLabel>
                    <input
                      type="text"
                      name="cin"
                      required
                      maxLength="8"
                      placeholder="8 chiffres"
                      value={formData.cin}
                      onChange={handleInputChange}
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Mot de passe</FieldLabel>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>
                {!isAgent && (
                  <div>
                    <FieldLabel>Rôle de l'utilisateur</FieldLabel>
                    <SelectWrapper>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={selectCls}
                      >
                        <option value="client">Client</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </SelectWrapper>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                               bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                               shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35
                               hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:scale-100"
                  >
                    {formLoading ? (
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
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Création...
                      </>
                    ) : isAgent ? (
                      "Créer le client"
                    ) : (
                      "Créer l'utilisateur"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOM BAN/UNBAN CONFIRMATION MODAL */}
      {banModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100">
            <div
              className={`h-1.5 w-full rounded-t-2xl ${!banModal.isBanned ? "bg-amber-400" : "bg-teal-400"}`}
            />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!banModal.isBanned ? "bg-amber-50" : "bg-teal-50"}`}
                >
                  {!banModal.isBanned ? (
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-teal-600"
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
                  )}
                </div>
                <h2
                  className={`text-sm font-extrabold tracking-tight uppercase ${!banModal.isBanned ? "text-amber-700" : "text-teal-700"}`}
                >
                  {!banModal.isBanned
                    ? "Suspendre l'utilisateur"
                    : "Réactiver l'utilisateur"}
                </h2>
              </div>

              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {!banModal.isBanned ? (
                  <>
                    Vous êtes sur le point de suspendre l'accès pour{" "}
                    <strong className="text-slate-800">
                      "{banModal.userName}"
                    </strong>
                    . Veuillez fournir une raison.
                  </>
                ) : (
                  <>
                    Voulez-vous vraiment réactiver le compte de{" "}
                    <strong className="text-slate-800">
                      "{banModal.userName}"
                    </strong>{" "}
                    ? Un email lui sera automatiquement envoyé.
                  </>
                )}
              </p>

              {!banModal.isBanned && (
                <div className="mb-5">
                  <FieldLabel required>Raison de la suspension</FieldLabel>
                  <textarea
                    required
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 focus:bg-white transition-all duration-200 resize-none"
                    placeholder="Ex: Faux documents fournis..."
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setBanModal({
                      isOpen: false,
                      userId: null,
                      userName: "",
                      isBanned: false,
                      role: "",
                    })
                  }
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmToggleBan}
                  disabled={
                    actionLoading ||
                    (!banModal.isBanned && !banReasonInput.trim())
                  }
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                    shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100
                    ${
                      !banModal.isBanned
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/35"
                        : "bg-gradient-to-r from-teal-500 to-emerald-600 shadow-teal-500/25 hover:shadow-teal-500/35"
                    }`}
                >
                  {actionLoading ? (
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
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Traitement...
                    </>
                  ) : !banModal.isBanned ? (
                    "Confirmer la suspension"
                  ) : (
                    "Confirmer la réactivation"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-red-100">
            <div className="h-1.5 w-full bg-red-400 rounded-t-2xl" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-red-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-red-700 uppercase">
                  Supprimer l'utilisateur
                </h2>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement{" "}
                <strong className="text-slate-800">
                  {deleteModal.userName}
                </strong>{" "}
                ? Cette action est{" "}
                <strong className="text-red-600">
                  totalement irréversible
                </strong>{" "}
                et détruira son compte et toutes ses données.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      userId: null,
                      userName: "",
                    })
                  }
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                             bg-gradient-to-r from-red-500 to-red-600
                             shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35
                             hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:scale-100"
                >
                  {actionLoading ? (
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
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    "Oui, supprimer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
