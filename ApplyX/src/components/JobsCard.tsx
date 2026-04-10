import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteManualJob, updateManualJobStatus } from "../services/api";
import "../styles/global.css";

type JobStatus = "Guardada" | "Aplicada" | "Pendiente" | "Rechazada";

interface Job {
  id: string | number;
  title: string;
  company: string;
  location?: string;
  url?: string;
  link?: string;
  source?: string;
  tags?: string[];
  status?: JobStatus;
  description?: string;
  isManual?: boolean;
}

interface JobsCardProps {
  job: Job;
}

const SOURCE_COLORS: Record<string, string> = {
  jobicy:    "#2563eb",
  remotive:  "#0891b2",
  arbeitnow: "#0d9488",
  "the muse":"#7c3aed",
};

function sourceColor(src = "") {
  return SOURCE_COLORS[src.toLowerCase()] ?? "#2563eb";
}

export default function JobsCard({ job }: JobsCardProps) {
  const queryClient = useQueryClient();
  const menuRef     = useRef<HTMLDivElement>(null);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const handleDelete = async () => {
    if (!job.isManual) return;
    setDeleting(true);
    try {
      await deleteManualJob(job.id);
      queryClient.invalidateQueries({ queryKey: ["manualJobs"] });
    } catch { /* silencioso */ }
    finally { setDeleting(false); setMenuOpen(false); }
  };

  const handleStatusChange = async (status: JobStatus) => {
    if (!job.isManual) return;
    setUpdatingStatus(true);
    try {
      await updateManualJobStatus(job.id, status);
      queryClient.invalidateQueries({ queryKey: ["manualJobs"] });
    } catch { /* silencioso */ }
    finally { setUpdatingStatus(false); setMenuOpen(false); }
  };

  const jobLink  = job.url ?? job.link ?? "";
  const statusLc = job.status?.toLowerCase() ?? "";

  return (
    <div className={`job-card ${menuOpen ? "menu-open" : ""}`} ref={menuRef}>
      <div className="job-card-header">
        {/* Ícono */}
        <div className="job-icon blue">
          {job.isManual ? (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
              stroke="#2563eb" strokeWidth={2}>
              <rect x="2" y="7" width="20" height="14" rx="3" />
              <path strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
              stroke={sourceColor(job.source)} strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4l3 3" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="job-title"
            style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {job.title}
          </p>
          <p className="job-company">
            {job.company}{job.location ? ` · ${job.location}` : ""}
          </p>
        </div>

        {/* Menú */}
        {(job.isManual || jobLink) && (
          <button className="job-menu-btn" onClick={() => setMenuOpen(v => !v)}
            aria-label="Opciones">
            •••
          </button>
        )}
      </div>

      {/* Descripción */}
      {job.description && <p className="job-description">{job.description}</p>}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
          {job.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: "0.68rem", padding: "2px 8px",
              background: "#eff6ff", border: "1px solid #dbeafe",
              borderRadius: "99px", color: "#1d4ed8"
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="job-footer">
        <div style={{ display: "flex", gap: "8px", alignItems: "center", minWidth: 0 }}>
          {job.source && (
            <span style={{
              fontSize: "0.7rem", padding: "2px 9px", borderRadius: "99px",
              background: "#eff6ff", border: "1px solid #dbeafe",
              color: sourceColor(job.source), fontWeight: 600
            }}>
              {job.source}
            </span>
          )}
          {jobLink && (
            <a href={jobLink} target="_blank" rel="noopener noreferrer"
              className="job-link">
              ↗ Ver vacante
            </a>
          )}
        </div>

        {job.status && (
          <span className={`job-badge ${statusLc}`}>{job.status}</span>
        )}
      </div>

      {/* Menú contextual */}
      {menuOpen && (
        <div className="context-menu">
          {jobLink && (
            <a href={jobLink} target="_blank" rel="noopener noreferrer"
              className="context-menu-item" onClick={() => setMenuOpen(false)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver vacante
            </a>
          )}

          {/* Opciones de estatus — solo para empleos manuales */}
          {job.isManual && (
            <>
              <div style={{
                padding: "6px 16px 2px",
                fontSize: "0.68rem", fontWeight: 600,
                color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em"
              }}>
                Cambiar estatus
              </div>
              {(["Guardada", "Aplicada", "Pendiente", "Rechazada"] as JobStatus[]).map(s => (
                <button key={s}
                  className="context-menu-item"
                  style={job.status === s ? { color: "#2563eb", fontWeight: 600 } : {}}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || job.status === s}>
                  {job.status === s ? "✓ " : ""}{s}
                </button>
              ))}

              <div style={{ borderTop: "1px solid #e2e8f4", margin: "4px 0" }} />
              <button className="context-menu-item danger"
                onClick={handleDelete} disabled={deleting}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16" />
                </svg>
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}