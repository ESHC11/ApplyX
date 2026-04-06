import { useEffect, useRef, useState } from "react";

type JobStatus = 'guardada' | 'aplicada' | 'pendiente' | 'rechazada';

interface Job {
  id: number | string;
  title: string;
  company: string;
  description: string;
  link: string;
  status: JobStatus;
  date: string;
  iconType?: 'blue' | 'pink' | 'green';
}

interface JobCardProps {
  job: Job;
  onDelete: (id: number | string) => void;
}

const statusLabel: Record<JobStatus, string> = {
  guardada: 'Guardada',
  aplicada: 'Aplicada',
  pendiente: 'Pendiente',
  rechazada: 'Rechazada',
};

const BriefcaseIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
    <rect x="2" y="7" width="20" height="14" rx="3" />
    <path strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);

const JobCard = ({ job, onDelete }: JobCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const iconColors = { blue: '#3b82f6', pink: '#e85d26', green: '#10b981' };
  const iconColor = iconColors[job.iconType ?? 'blue'];

   return (
    <div className={ `job-card ${menuOpen ? 'menu-open' : ''}` } ref={menuRef}>
      {/* Cabecera de la card */}
      <div className="job-card-header">
        {/* Ícono */}
        <div className={`job-icon ${job.iconType ?? 'blue'}`}>
          <BriefcaseIcon color={iconColor} />
        </div>
        {/* Título y empresa */}
        <div style={{ flex: 1 }}>
          <p className="job-title">{job.title}</p>
          <p className="job-company">{job.company}</p>
        </div>
        {/* Botón menú ··· */}
        <button
          className="job-menu-btn"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          ···
        </button>
      </div>
      {/* Descripción */}
      <p className="job-description">{job.description}</p>
      {/* Pie: fecha + link + badge */}
      <div className="job-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
          {job.date && <span className="job-date">📅 {job.date}</span>}
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link">
            {job.link}
          </a>
        </div>
        <span className={`job-badge ${job.status}`}>
          {statusLabel[job.status]}
        </span>
      </div>
      {/* Menú contextual */}
      {menuOpen && (
        <div className="context-menu">
          <button className="context-menu-item" onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            Cambiar estatus
          </button>
          <button className="context-menu-item" onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Guardar como favorito
          </button>
          <button className="context-menu-item" onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button className="context-menu-item danger" onClick={() => { onDelete(job.id); setMenuOpen(false); }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};
export default JobCard;