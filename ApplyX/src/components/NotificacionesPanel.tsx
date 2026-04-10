import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotificaciones, marcarNotificacionLeida } from "../services/api";

interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

interface NotificacionesPanelProps {
  onClose: () => void;
}

export default function NotificacionesPanel({ onClose }: NotificacionesPanelProps) {
  const queryClient = useQueryClient();
  const [marking, setMarking] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: async () => {
      const res = await getNotificaciones();
      return (res.data ?? []) as Notificacion[];
    },
    staleTime: 60 * 1000,
  });

  const notifs = data ?? [];
  const unread = notifs.filter(n => !n.leida).length;

  const handleMarcar = async (id: number) => {
    setMarking(id);
    try {
      await marcarNotificacionLeida(id);
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
    } finally {
      setMarking(null);
    }
  };

  const handleMarcarTodas = async () => {
    const unreadIds = notifs.filter(n => !n.leida).map(n => n.id);
    for (const id of unreadIds) {
      await marcarNotificacionLeida(id);
    }
    queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-MX", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });

  return (
    <>
      <style>{`
        .notif-backdrop {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(15,23,42,0.3);
          animation: notifFade 0.15s ease;
        }
        @keyframes notifFade { from { opacity: 0 } to { opacity: 1 } }

        .notif-panel {
          position: fixed; top: 60px; right: 16px;
          width: min(340px, calc(100vw - 32px));
          background: white; border-radius: 20px;
          border: 1px solid #e2e8f4;
          box-shadow: 0 16px 48px rgba(15,23,42,0.14);
          z-index: 501; overflow: hidden;
          animation: notifSlide 0.2s cubic-bezier(0.34,1.4,0.64,1);
          font-family: 'Inter', sans-serif;
        }
        @keyframes notifSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }

        .notif-header {
          padding: 16px 18px 12px;
          display: flex; align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
        }
        .notif-header-left { display: flex; align-items: center; gap: 8px; }
        .notif-title {
          font-size: 0.9rem; font-weight: 700; color: #0f172a;
          font-family: 'Syne', sans-serif;
        }
        .notif-badge {
          background: #2563eb; color: white;
          font-size: 0.65rem; font-weight: 700;
          padding: 1px 6px; border-radius: 99px; min-width: 18px;
          text-align: center;
        }
        .notif-mark-all {
          font-size: 0.72rem; color: #2563eb; cursor: pointer;
          background: none; border: none; font-family: 'Inter', sans-serif;
          padding: 4px 8px; border-radius: 8px; transition: background 0.15s;
        }
        .notif-mark-all:hover { background: #eff6ff; }

        .notif-list {
          max-height: 340px; overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: #e2e8f4 transparent;
        }

        .notif-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid #f8faff;
          transition: background 0.14s; cursor: default;
        }
        .notif-item:hover { background: #f8faff; }
        .notif-item.unread { background: #eff6ff; }
        .notif-item.unread:hover { background: #dbeafe; }

        .notif-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #2563eb; flex-shrink: 0; margin-top: 5px;
          transition: opacity 0.2s;
        }
        .notif-dot.read { background: transparent; border: 1.5px solid #cbd5e1; }

        .notif-body { flex: 1; min-width: 0; }
        .notif-msg {
          font-size: 0.82rem; color: #1e293b; line-height: 1.5;
          margin: 0 0 3px;
        }
        .notif-date { font-size: 0.7rem; color: #94a3b8; }

        .notif-mark-btn {
          background: none; border: none; padding: 4px;
          color: #94a3b8; cursor: pointer; border-radius: 6px;
          font-size: 0.7rem; transition: all 0.15s; flex-shrink: 0;
        }
        .notif-mark-btn:hover { color: #2563eb; background: #eff6ff; }

        .notif-empty {
          padding: 40px 16px; text-align: center; color: #94a3b8;
        }
        .notif-empty-icon { font-size: 2rem; margin-bottom: 10px; }
        .notif-empty p { font-size: 0.82rem; }

        .notif-footer {
          padding: 10px 16px;
          border-top: 1px solid #f1f5f9;
          display: flex; justify-content: center;
        }
        .notif-footer-btn {
          font-size: 0.78rem; color: #64748b;
          background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; padding: 4px 8px;
          border-radius: 8px; transition: background 0.15s;
        }
        .notif-footer-btn:hover { background: #f1f5f9; color: #0f172a; }
      `}</style>

      {/* Backdrop */}
      <div className="notif-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="notif-panel">
        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-left">
            <span className="notif-title">Notificaciones</span>
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </div>
          {unread > 0 && (
            <button className="notif-mark-all" onClick={handleMarcarTodas}>
              Marcar todo
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="notif-list">
          {isLoading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "0.82rem" }}>
              Cargando…
            </div>
          ) : notifs.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">🔔</div>
              <p>Sin notificaciones por ahora</p>
            </div>
          ) : (
            notifs.map(n => (
              <div key={n.id} className={`notif-item ${n.leida ? "" : "unread"}`}>
                <div className={`notif-dot ${n.leida ? "read" : ""}`} />
                <div className="notif-body">
                  <p className="notif-msg">{n.mensaje}</p>
                  <span className="notif-date">{formatFecha(n.fecha_creacion)}</span>
                </div>
                {!n.leida && (
                  <button
                    className="notif-mark-btn"
                    disabled={marking === n.id}
                    onClick={() => handleMarcar(n.id)}
                    title="Marcar como leída"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {notifs.length > 0 && (
          <div className="notif-footer">
            <button className="notif-footer-btn" onClick={onClose}>Cerrar</button>
          </div>
        )}
      </div>
    </>
  );
}
