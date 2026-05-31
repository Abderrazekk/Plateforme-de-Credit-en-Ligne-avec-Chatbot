import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";

export default function NotificationBell({ user }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(user);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  // Fermer le menu lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("fr-TN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bouton de la Cloche ── */}
      <button
        onClick={toggle}
        aria-label="Notifications"
        className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
          ${
            open
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
              : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
          }`}
      >
        {/* Icône SVG de la Cloche */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge des notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-extrabold rounded-full border-2 border-white shadow-sm px-0.5 leading-none animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Panneau Déroulant des Notifications ── */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-[340px] sm:w-[440px] bg-white border border-slate-100 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100"
          style={{
            animation:
              "nbSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* En-tête du panneau */}
          <div className="px-4 py-3 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2.5">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.974 8.974 0 013.333-4.8c.097-.053.202-.1.307-.146m1.415-1.428a15.573 15.573 0 015.159-1.004M9.143 17.082c.089.139.181.277.277.412A4.12 4.12 0 0013.5 19.5a4.12 4.12 0 003.536-1.892c.1-.143.194-.294.282-.45M9.143 17.082a24.254 24.254 0 013.844.148m0 0a24.254 24.254 0 003.844-.148m0 0a23.856 23.856 0 005.455-1.31 8.974 8.974 0 00-3.333-4.8c-.097-.053-.202-.1-.307-.146m-1.415-1.428a15.573 15.573 0 00-5.159-1.004m0 0a15.573 15.573 0 015.159 1.004M13.5 11c.148 0 .295-.004.442-.011m0 0a15.564 15.564 0 014.282 1.341m-4.282-1.341a15.564 15.564 0 00-4.282 1.341"
                    />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Aucune notification pour le moment
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && markAsRead(notif._id)}
                  className={`relative p-4 transition-all duration-150 cursor-pointer border-l-4
                    ${
                      !notif.read
                        ? "bg-blue-50/40 border-l-blue-500 hover:bg-blue-50/60"
                        : "border-l-transparent hover:bg-slate-50/80"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Contenu textuel sans aucune limite ou troncature */}
                    <div className="flex-1 min-w-0">
                      {notif.url ? (
                        <Link
                          to={notif.url}
                          onClick={close}
                          className={`text-xs block leading-relaxed whitespace-normal break-words font-medium transition-colors duration-150 hover:text-blue-600 pr-2
                            ${!notif.read ? "text-slate-900 font-semibold" : "text-slate-600"}`}
                        >
                          {notif.message}
                        </Link>
                      ) : (
                        <p
                          className={`text-xs block leading-relaxed whitespace-normal break-words font-medium pr-2
                            ${!notif.read ? "text-slate-900 font-semibold" : "text-slate-600"}`}
                        >
                          {notif.message}
                        </p>
                      )}

                      {/* Horodatage */}
                      <p className="text-[11px] text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                        <svg
                          className="w-3 h-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6l4 2"
                          />
                        </svg>
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>

                    {/* Pastille visuelle pour le statut non lu */}
                    {!notif.read && (
                      <span className="mt-1 w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0 shadow-sm shadow-blue-500/50" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de page du panneau */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50/50 flex items-center justify-center">
              <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                Crédit<span className="text-blue-500">Tunisie</span> · Centre de
                suivi
              </span>
            </div>
          )}
        </div>
      )}

      {/* Styles CSS personnalisés insérés proprement */}
      <style>{`
        @keyframes nbSlideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
