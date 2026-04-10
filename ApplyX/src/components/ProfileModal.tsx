import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchUsuario, updateUsuarioPerfil } from "../services/api";
import { jwtDecode } from "jwt-decode";
import "../styles/global.css";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const userId = token ? jwtDecode<{ id: number }>(token).id : null;

  const { data: usuario, isLoading } = useQuery({
    queryKey: ["usuario", userId],
    queryFn: () => fetchUsuario(userId!),
    enabled: !!userId,
  });

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setCorreo(usuario.correo || "");
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      await updateUsuarioPerfil(userId, nombre, correo);
      queryClient.invalidateQueries({ queryKey: ["usuario", userId] });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al actualizar el perfil");
      } else {
        setError("Error desconocido");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .prof-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,23,42,0.4);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: profFade 0.2s ease;
        }
        @keyframes profFade { from { opacity: 0 } to { opacity: 1 } }

        .prof-modal {
          background: #fff; width: 90%; max-width: 400px;
          border-radius: 20px; padding: 24px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: profSlide 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes profSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .prof-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
        }
        .prof-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; }
        .prof-close { background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
        .prof-close:hover { color: #dc2626; }

        .prof-info { text-align: center; margin-bottom: 20px; }
        .prof-avatar-large {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white; font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }

        .prof-form { display: flex; flex-direction: column; gap: 14px; }
        .prof-label { font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 4px; display: block; }
        .prof-input {
          width: 100%; padding: 10px 14px;
          border: 1.5px solid #e2e8f4; border-radius: 12px;
          font-family: 'Inter', sans-serif; color: #0f172a;
          outline: none; transition: all 0.2s;
        }
        .prof-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .prof-error { color: #ef4444; font-size: 0.8rem; text-align: center; }

        .prof-actions { display: flex; gap: 10px; margin-top: 10px; }
        .prof-btn {
          flex: 1; padding: 12px; border-radius: 12px;
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .prof-btn-cancel { background: #f1f5f9; color: #475569; border: none; }
        .prof-btn-cancel:hover { background: #e2e8f4; color: #0f172a; }
        .prof-btn-save { background: #2563eb; color: #fff; border: none; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
        .prof-btn-save:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .prof-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="prof-backdrop" onClick={onClose}>
        <div className="prof-modal" onClick={e => e.stopPropagation()}>
          <div className="prof-header">
            <h2 className="prof-title">Mi Perfil</h2>
            <button className="prof-close" onClick={onClose}>×</button>
          </div>

          {isLoading ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Cargando perfil...</p>
          ) : (
            <>
              <div className="prof-info">
                <div className="prof-avatar-large">
                  {nombre.charAt(0).toUpperCase() || "U"}
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                  Miembro desde {usuario?.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString("es-MX") : "hoy"}
                </p>
              </div>

              <form className="prof-form" onSubmit={handleSubmit}>
                <div>
                  <label className="prof-label">Nombre completo</label>
                  <input
                    type="text"
                    className="prof-input"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="prof-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="prof-input"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="prof-error">{error}</p>}

                <div className="prof-actions">
                  <button type="button" className="prof-btn prof-btn-cancel" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="prof-btn prof-btn-save" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", margin: "10px 0" }} />
                <button 
                  type="button" 
                  onClick={handleLogout}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "12px",
                    background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                    fontFamily: "'Inter', sans-serif", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
