import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DocumentUploader from "../../components/ui/DocumentUploader";

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all duration-200";

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
      <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
        {children}
      </h2>
    </div>
  );
}

export default function Profile() {
  const { setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    cin: "",
    avatar: "",
    role: "client",
    documents: {
      cinRecto: "",
      cinVerso: "",
      justificatifRevenu: "",
      contratTravail: "",
      releveBancaire: "",
    },
    documentsVerifies: false,
  });

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setProfile((prev) => ({
          ...prev,
          ...res.data,
          documents: res.data.documents || prev.documents,
        }));
      })
      .catch(() => setError("Impossible de charger les données du profil."))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const allowCIN = ["client", "agent"].includes(profile.role);

    try {
      const res = await api.put("/users/profile", {
        nom: profile.nom,
        prenom: profile.prenom,
        email: profile.email,
        telephone: profile.telephone,
        cin: allowCIN ? profile.cin : undefined,
      });

      setProfile((prev) => ({ ...prev, ...res.data }));
      if (setUser) {
        setUser((prev) => ({ ...prev, ...res.data }));
      }
      setMessage("Profil mis à jour avec succès !");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setError("");

    if (password.newPassword !== password.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put("/users/password", {
        oldPassword: password.oldPassword,
        newPassword: password.newPassword,
      });
      setPasswordMsg("Mot de passe mis à jour avec succès !");
      setPassword({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur mot de passe");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
      if (setUser) {
        setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
      }
      setMessage("Photo de profil mise à jour avec succès !");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du téléchargement de l'image",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateDocument = (field) => (path) => {
    setProfile((prev) => ({
      ...prev,
      documents: { ...prev.documents, [field]: path },
    }));
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full max-w-sm mx-4">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center animate-pulse">
              <svg
                className="w-5 h-5 text-blue-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Chargement du profil...
            </p>
          </div>
        </div>
      </div>
    );

  const isClient = profile.role === "client";
  const isAgent = profile.role === "agent";
  const showCINField = isClient || isAgent;

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
                Mon Profil
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                Gérez vos informations personnelles, sécurité et documents.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/client/dashboard"
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
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14 space-y-6">
        {/* ── Success messages ── */}
        {(message || passwordMsg) && (
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-teal-400" />
            <div className="p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-teal-500"
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
              </div>
              <p className="text-sm font-medium text-teal-700">
                {message || passwordMsg}
              </p>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Avatar sidebar card ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden self-start">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
            <div className="p-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className="relative w-24 h-24 mx-auto mb-5 group cursor-pointer"
                onClick={handleAvatarClick}
              >
                {profile.avatar ? (
                  <img
                    src={
                      profile.avatar.startsWith("http")
                        ? profile.avatar
                        : `http://localhost:5000/${profile.avatar}`
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-2xl shadow-md border-4 border-white group-hover:opacity-75 transition-opacity duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl shadow-md border-4 border-white group-hover:opacity-80 transition-opacity duration-200 text-2xl font-extrabold text-white tracking-tight">
                    {profile.prenom?.charAt(0)}
                    {profile.nom?.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex flex-col items-center gap-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-white text-[10px] font-semibold">
                      Modifier
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                {profile.prenom} {profile.nom}
              </h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                Compte {profile.role}
              </p>

              {/* Role badge */}
              <div className="mt-4 w-full">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border w-full justify-center
                  ${
                    profile.role === "client"
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : profile.role === "agent"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full
                    ${
                      profile.role === "client"
                        ? "bg-blue-400"
                        : profile.role === "agent"
                          ? "bg-amber-400"
                          : "bg-slate-400"
                    }`}
                  />
                  {profile.role === "client"
                    ? "Client"
                    : profile.role === "agent"
                      ? "Agent"
                      : "Administrateur"}
                </span>
              </div>

              {/* Documents verification badge (sidebar) */}
              {isClient && (
                <div className="mt-3 w-full">
                  {profile.documentsVerifies ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-teal-50 text-teal-700 border-teal-100 w-full justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      Profil Certifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100 w-full justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      En attente
                    </span>
                  )}
                </div>
              )}

              {/* Quick info rows */}
              <div className="mt-5 w-full space-y-2 text-left">
                {profile.email && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs text-slate-500 font-medium truncate">
                      {profile.email}
                    </span>
                  </div>
                )}
                {profile.telephone && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-xs text-slate-500 font-medium">
                      {profile.telephone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal info card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="p-6 sm:p-8">
                <SectionTitle>Informations Personnelles</SectionTitle>
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Prénom</FieldLabel>
                      <input
                        type="text"
                        name="prenom"
                        value={profile.prenom}
                        onChange={handleProfileChange}
                        required
                        className={inputCls}
                        placeholder="Ex: Mohamed"
                      />
                    </div>
                    <div>
                      <FieldLabel>Nom</FieldLabel>
                      <input
                        type="text"
                        name="nom"
                        value={profile.nom}
                        onChange={handleProfileChange}
                        required
                        className={inputCls}
                        placeholder="Ex: Ben Ali"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Adresse Email</FieldLabel>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        required
                        className={`${inputCls} font-mono`}
                        placeholder="Ex: exemple@email.com"
                      />
                    </div>
                    <div>
                      <FieldLabel>Téléphone</FieldLabel>
                      <input
                        type="tel"
                        name="telephone"
                        value={profile.telephone}
                        onChange={handleProfileChange}
                        required
                        className={`${inputCls} font-mono`}
                        placeholder="Ex: 98765432"
                      />
                    </div>
                  </div>

                  {showCINField && (
                    <div>
                      <FieldLabel>Numéro CIN</FieldLabel>
                      <input
                        type="text"
                        name="cin"
                        value={profile.cin || ""}
                        onChange={handleProfileChange}
                        className={`${inputCls} font-mono`}
                        placeholder="8 chiffres"
                      />
                    </div>
                  )}

                  <div className="pt-5 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                                 bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                                 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35
                                 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:scale-100"
                    >
                      {saving ? (
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
                          Enregistrement...
                        </>
                      ) : (
                        <>
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
                          Enregistrer les modifications
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Password card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-slate-700 to-slate-900" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-5 w-1 rounded-full bg-gradient-to-b from-slate-600 to-slate-900" />
                  <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                    Sécurité du Compte
                  </h2>
                  <div className="ml-auto w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <form onSubmit={updatePasswordSubmit} className="space-y-4">
                  <div>
                    <FieldLabel>Mot de passe actuel</FieldLabel>
                    <input
                      type="password"
                      name="oldPassword"
                      value={password.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      className={inputCls}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Nouveau mot de passe</FieldLabel>
                      <input
                        type="password"
                        name="newPassword"
                        value={password.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                        className={inputCls}
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <FieldLabel>Confirmer le mot de passe</FieldLabel>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={password.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                        className={inputCls}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="pt-5 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                                 border border-slate-200 text-slate-700 bg-slate-50
                                 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-900 hover:text-white hover:border-transparent
                                 transition-all duration-200 disabled:opacity-50"
                    >
                      {passwordSaving ? (
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
                          Modification...
                        </>
                      ) : (
                        <>
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Mettre à jour le mot de passe
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Documents card */}
            {isClient && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
                      <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
                        Documents Justificatifs
                      </h2>
                    </div>
                    {profile.documentsVerifies ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-teal-50 text-teal-700 border-teal-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        Profil Certifié &amp; Documents Validés
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        En attente de vérification
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { field: "cinRecto", label: "CIN Recto" },
                      { field: "cinVerso", label: "CIN Verso" },
                      {
                        field: "justificatifRevenu",
                        label: "Justificatif de revenu",
                      },
                      { field: "contratTravail", label: "Contrat de travail" },
                      { field: "releveBancaire", label: "Relevé bancaire" },
                    ].map(({ field, label }) => (
                      <div
                        key={field}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200
                          ${
                            profile.documents?.[field]
                              ? "bg-teal-50 border-teal-100 hover:border-teal-200"
                              : "bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0
                            ${profile.documents?.[field] ? "bg-teal-100" : "bg-white border border-slate-200"}`}
                          >
                            {profile.documents?.[field] ? (
                              <svg
                                className="w-3 h-3 text-teal-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-3 h-3 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-xs font-semibold truncate
                            ${profile.documents?.[field] ? "text-teal-700" : "text-slate-600"}`}
                          >
                            {label}
                          </span>
                        </div>

                        {profile.documentsVerifies ? (
                          <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider shrink-0">
                            Validé
                          </span>
                        ) : (
                          <DocumentUploader
                            label={label}
                            currentPath={profile.documents?.[field]}
                            onUpload={updateDocument(field)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom CTA banner ── */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/40 shadow-sm">
          <div>
            <p className="text-white font-extrabold tracking-tight text-lg">
              Besoin de déposer une nouvelle demande ?
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Vos informations de profil seront pré-remplies automatiquement.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="/client/loans"
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
              Mes demandes
            </a>
            <a
              href="/client/apply-loan"
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
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
