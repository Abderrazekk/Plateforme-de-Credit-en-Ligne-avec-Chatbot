import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../ui/NotificationBell";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMobileOpen(false), [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const clientLinks = [
    { to: "/client/dashboard", label: "Tableau de bord" },
    { to: "/client/loans", label: "Mes crédits" },
    { to: "/client/apply-loan", label: "Nouvelle demande" },
    { to: "/client/profile", label: "Profil" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Tableau de bord" },
    { to: "/admin/loans", label: "Demandes" },
    { to: "/admin/create-loan", label: "Créer un prêt" },
    { to: "/admin/users", label: "Utilisateurs" },
    { to: "/admin/reports", label: "Rapports" },
    { to: "/admin/profile", label: "Mon Profil" },
  ];

  // Dynamic router assignment engine
  const navLinks =
    user?.role === "admin"
      ? adminLinks
        : user?.role === "client"
          ? clientLinks
          : [];

  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          transparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo Frame */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-4 h-4 text-white"
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
            <span
              className={`font-extrabold text-lg tracking-tight transition-colors duration-300 ${transparent ? "text-white" : "text-slate-900"}`}
            >
              Crédit<span className="text-blue-500">Tunisie</span>
            </span>
          </Link>

          {/* Desktop Navigation Engine */}
          {user && navLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : transparent
                          ? "text-white/80 hover:text-white hover:bg-white/10"
                          : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Public links */}
          {!user && (
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Accueil", to: "/" },
                { label: "Simulation", to: "/simulate" },
                { label: "Nos crédits", to: "/credits" },
                { label: "Comment ça marche", to: "/how" },
                { label: "Contact", to: "/contact" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    transparent
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Frame Element Bar */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div
                  className={
                    transparent
                      ? "text-white [&_*]:text-white [&_svg]:text-white"
                      : ""
                  }
                >
                  <NotificationBell user={user} />
                </div>

                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${transparent ? "bg-white/10 border border-white/20 text-white" : "bg-slate-100 border border-slate-200 text-slate-700"}`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden border border-slate-200/50">
                    {user.avatar ? (
                      <img
                        src={`/${user.avatar.replace(/\\/g, "/")}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user.prenom?.[0]?.toUpperCase() ?? "U")
                    )}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">
                    {user.prenom} {user.nom}
                  </span>

                  {/* Dynamic Role Badges */}
                  {user.role === "admin" && (
                    <span className="bg-amber-500/20 text-amber-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-amber-500/30">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  title="Déconnexion"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${transparent ? "text-white/70 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-red-600 hover:bg-red-50"}`}
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${transparent ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
                >
                  S'inscrire
                </Link>
              </>
            )}

            {/* Mobile burger toggle frame */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${transparent ? "text-white hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg
                  className="w-5 h-5"
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
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu viewport */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-100 ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden border border-slate-200">
                    {user.avatar ? (
                      <img
                        src={`/${user.avatar.replace(/\\/g, "/")}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user.prenom?.[0]?.toUpperCase() ?? "U")
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {user.prenom} {user.nom}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                {navLinks.map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                {[
                  { label: "Accueil", to: "/" },
                  { label: "Simulation", to: "/simulate" },
                  { label: "Nos crédits", to: "/credits" },
                  { label: "Comment ça marche", to: "/how" },
                  { label: "Contact", to: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition-all duration-200"
                  >
                    S'inscrire
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {!isHome && <div className="h-16" />}
    </>
  );
}
