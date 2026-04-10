import { useState } from "react";
import { createManualJob } from "../services/api";
import "../styles/global.css";

type JobStatus = "Guardada" | "Aplicada" | "Pendiente" | "Rechazada";

interface AddJobModalProps {
  userId: number;
  onClose: () => void;
  onJobAdded: () => void;
}

export default function AddJobModal({ onClose, onJobAdded }: AddJobModalProps) {
  const [form, setForm] = useState({
    title: "", company: "", link: "",
    status: "Guardada" as JobStatus,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) return;
    setLoading(true); setError(null);
    try {
      await createManualJob({
        title:       form.title.trim(),
        company:     form.company.trim(),
        link:        form.link.trim(),
        status:      form.status,
        description: form.description.trim(),
      });
      onJobAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el empleo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "#2563eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
              stroke="#fff" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div>
            <p className="modal-title" style={{ textAlign: "left", margin: 0 }}>
              Nueva vacante
            </p>
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>
              Registra un empleo manualmente
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Empresa */}
          <label className="form-label">Empresa *</label>
          <input name="company" value={form.company} onChange={handleChange}
            placeholder="Ej. Google México" className="form-input"
            required disabled={loading} />

          {/* Puesto */}
          <label className="form-label">Puesto *</label>
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="Ej. Desarrollador Frontend" className="form-input"
            required disabled={loading} />

          {/* Link + status */}
          <div className="form-row">
            <div>
              <label className="form-label">Link</label>
              <input name="link" value={form.link} onChange={handleChange}
                placeholder="https://..." className="form-input"
                type="url" disabled={loading} />
            </div>
            <div>
              <label className="form-label">Estatus</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="form-input form-select" disabled={loading}>
                <option value="Guardada">💾 Guardada</option>
                <option value="Aplicada">🚀 Aplicada</option>
                <option value="Pendiente">⏳ Pendiente</option>
                <option value="Rechazada">❌ Rechazada</option>
              </select>
            </div>
          </div>

          {/* Notas */}
          <label className="form-label">Notas</label>
          <textarea name="description" value={form.description}
            onChange={handleChange}
            placeholder="¿Por qué te interesa esta vacante?"
            className="form-input form-textarea" disabled={loading} />

          {error && (
            <p style={{
              fontSize: "0.78rem", color: "#dc2626",
              background: "#fff1f2", border: "1px solid #fecaca",
              borderRadius: "10px", padding: "10px 14px", marginBottom: "14px"
            }}>⚠️ {error}</p>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel"
              onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-add"
              disabled={loading || !form.title || !form.company}>
              {loading ? "Guardando…" : "Agregar →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
