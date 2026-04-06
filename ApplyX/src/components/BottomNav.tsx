interface BottomNavProps {
  onAddClick: () => void;
  activeNav?: 'home' | 'calendar';
}

// Ícono Grid (vacantes)
const GridIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

// Ícono Calendario
const CalendarIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

// Ícono Plus
const PlusIcon = () => (
  <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
  </svg>
);

import { useNavigate } from 'react-router-dom';

const BottomNav = ({ onAddClick, activeNav = 'home' }: BottomNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="bottom-nav">

      <button
        className={`bottom-nav-btn ${activeNav === 'home' ? 'active' : ''}`}
        onClick={() => navigate('/home')}
      >
        <GridIcon />
      </button>

      <button
        className="bottom-nav-add"
        onClick={onAddClick}
        aria-label="Agregar vacante"
      >
        <PlusIcon />
      </button>

      <button
        className={`bottom-nav-btn ${activeNav === 'calendar' ? 'active' : ''}`}
        onClick={() => navigate('/calendar')}
      >
        <CalendarIcon />
      </button>

    </div>
  );
};

export default BottomNav;
