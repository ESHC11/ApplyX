
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NotificacionesPanel from "./NotificacionesPanel";
import ProfileModal from "./ProfileModal";
import { getNotificaciones } from "../services/api";
import "../styles/global.css";

interface Notificacion { id: number; leida: boolean; }

export default function Header() {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Badge counter de no leídas
  const { data } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: async () => {
      const res = await getNotificaciones();
      return (res.data ?? []) as Notificacion[];
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // refresca cada 2 min
  });
  const unread = (data ?? []).filter(n => !n.leida).length;

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="logo-circle">AX</div>
          <span className="header-brand">ApplyX</span>
        </div>

        <div className="header-right">
          {/* Icono notificaciones */}
          <button
            className="header-icon-btn"
            aria-label="Notificaciones"
            onClick={() => setShowNotif(v => !v)}
            style={{ position: "relative" }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 8, height: 8, borderRadius: "50%",
                background: "#2563eb", border: "2px solid white",
              }} />
            )}
          </button>

          {/* Avatar */}
          <div className="header-avatar" onClick={handleProfileClick} title="Mi Perfil">
            U
          </div>
        </div>
      </header>

      {/* Panel de notificaciones */}
      {showNotif && <NotificacionesPanel onClose={() => setShowNotif(false)} />}

      {/* Modal de perfil */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
