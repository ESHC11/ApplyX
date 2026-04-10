import { useNavigate } from "react-router-dom";
import "../styles/global.css";

interface BottomNavProps {
  onAddClick: () => void;
  activeNav?: "home" | "calendar";
}

export default function BottomNav({ onAddClick, activeNav = "home" }: BottomNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {/* Vacantes */}
      <button
        className={`bottom-nav-btn ${activeNav === "home" ? "active" : ""}`}
        onClick={() => navigate("/home")}
        aria-label="Vacantes"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </button>

      {/* Agregar */}
      <button className="bottom-nav-add" onClick={onAddClick} aria-label="Agregar vacante">
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Calendario */}
      <button
        className={`bottom-nav-btn ${activeNav === "calendar" ? "active" : ""}`}
        onClick={() => navigate("/calendar")}
        aria-label="Calendario"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>
    </nav>
  );
}
