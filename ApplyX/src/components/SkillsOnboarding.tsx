import { useState } from "react";
import type { ReactNode } from "react";
import { updateUsuarioSkills } from "../services/api";
import "../styles/global.css";

interface SkillsOnboardingProps {
  userId: number;
  onComplete: (skills: string[]) => void;
}

import { Laptop, Stethoscope, BookOpen, TrendingUp, Truck, CircleDollarSign, Building, Palette } from "lucide-react";

interface Category {
  id: string; label: string; icon: ReactNode; color: string; skills: string[];
}

const CATEGORIES: Category[] = [
  { id: "tech",      label: "Tecnología",        icon: <Laptop size={16} />, color: "#0f172a",
    skills: ["JavaScript","TypeScript","React","Node.js","Python","SQL","DevOps","UX/UI","Ciberseguridad","Data Science"] },
  { id: "health",    label: "Salud",              icon: <Stethoscope size={16} />, color: "#334155",
    skills: ["Enfermería","Medicina General","Psicología","Nutrición","Fisioterapia","Farmacia","Radiología","Odontología"] },
  { id: "education", label: "Educación",          icon: <BookOpen size={16} />, color: "#475569",
    skills: ["Docencia","Pedagogía","Tutoría","E-learning","Orientación Educativa","Educación Especial","Idiomas"] },
  { id: "sales",     label: "Ventas & Marketing", icon: <TrendingUp size={16} />, color: "#1e293b",
    skills: ["Ventas B2B","Marketing Digital","SEO/SEM","CRM","Email Marketing","Redes Sociales","Growth Hacking"] },
  { id: "logistics", label: "Logística",          icon: <Truck size={16} />, color: "#0f172a",
    skills: ["Supply Chain","Almacén","Distribución","Importación","Exportación","Compras","Flota Vehicular"] },
  { id: "finance",   label: "Finanzas",           icon: <CircleDollarSign size={16} />, color: "#1e293b",
    skills: ["Contabilidad","Auditoría","Finanzas Corporativas","Nómina","Fiscal","Tesorería","Inversiones"] },
  { id: "admin",     label: "Administración",     icon: <Building size={16} />, color: "#334155",
    skills: ["Recursos Humanos","Gestión de Proyectos","Atención al Cliente","Secretariado","Calidad","Legal"] },
  { id: "creative",  label: "Diseño",             icon: <Palette size={16} />, color: "#475569",
    skills: ["Diseño Gráfico","Ilustración","Fotografía","Video","Animación","Arquitectura","Moda"] },
];

export default function SkillsOnboarding({ userId, onComplete }: SkillsOnboardingProps) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [selectedSkills, setSelectedSkills]  = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory)!;

  const toggleSkill = (skill: string) =>
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill); else next.add(skill);
      return next;
    });

  const handleSubmit = async () => {
    if (selectedSkills.size === 0) return;
    setLoading(true); setError(null);
    try {
      await updateUsuarioSkills(userId, Array.from(selectedSkills));
      onComplete(Array.from(selectedSkills));
    } catch {
      setError("No se pudieron guardar tus habilidades. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .sob-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(6px);
          display: flex; align-items: flex-end; justify-content: center;
          animation: sob-fade 0.2s ease;
        }
        @keyframes sob-fade { from { opacity: 0 } to { opacity: 1 } }

        .sob-sheet {
          width: 100%; max-width: 620px;
          background: #fff; border-radius: 28px 28px 0 0;
          border-top: 1px solid #e2e8f4;
          padding: 22px 20px 40px;
          max-height: 90dvh; display: flex; flex-direction: column; gap: 16px;
          font-family: 'Inter', sans-serif; color: #0f172a;
          overflow: hidden;
          animation: sob-up 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
          box-shadow: 0 -8px 48px rgba(15,23,42,0.12);
        }
        @keyframes sob-up { from { transform: translateY(100%) } to { transform: translateY(0) } }

        .sob-handle {
          width: 36px; height: 4px; background: #e2e8f4;
          border-radius: 99px; margin: 0 auto -4px;
        }

        .sob-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem; font-weight: 800; margin: 0 0 4px;
          color: #0f172a;
        }
        .sob-header p { margin: 0; font-size: 0.82rem; color: #94a3b8; }

        .sob-counter {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.78rem; color: #64748b;
        }
        .sob-counter-badge {
          background: #eff6ff; border: 1px solid #dbeafe;
          border-radius: 99px; padding: 2px 10px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          color: #2563eb; min-width: 28px; text-align: center;
        }

        .sob-cats {
          display: flex; gap: 6px; overflow-x: auto;
          padding-bottom: 4px; scrollbar-width: none;
        }
        .sob-cats::-webkit-scrollbar { display: none; }
        .sob-cat-btn {
          flex-shrink: 0; display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 99px;
          background: #f8faff; border: 1.5px solid #e2e8f4;
          color: #64748b; font-size: 0.78rem; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.18s;
        }
        .sob-cat-btn.active { color: #fff; border-color: transparent; }

        .sob-skills {
          display: flex; flex-wrap: wrap; gap: 7px;
          overflow-y: auto; max-height: 200px;
          scrollbar-width: thin; scrollbar-color: #e2e8f4 transparent;
        }
        .sob-chip {
          padding: 7px 14px; border-radius: 10px;
          border: 1.5px solid #e2e8f4; background: #f8faff;
          color: #64748b; font-size: 0.8rem; cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.16s; user-select: none;
        }
        .sob-chip:hover { border-color: #93c5fd; color: #1d4ed8; }
        .sob-chip.selected { color: #fff; border-color: transparent; }

        .sob-divider { border: none; border-top: 1px solid #e2e8f4; }

        .sob-preview { display: flex; gap: 5px; flex-wrap: wrap; min-height: 22px; }
        .sob-tag {
          display: flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 99px;
          background: #eff6ff; border: 1px solid #dbeafe;
          font-size: 0.72rem; color: #2563eb;
        }
        .sob-tag button {
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 0.9rem; line-height: 1;
          padding: 0; transition: color 0.14s;
        }
        .sob-tag button:hover { color: #dc2626; }

        .sob-submit {
          width: 100%; padding: 14px;
          background: #2563eb; border: none; border-radius: 99px;
          color: #fff; font-family: 'Syne', sans-serif;
          font-size: 0.95rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
          transition: all 0.18s;
        }
        .sob-submit:hover:not(:disabled) {
          background: #1d4ed8; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.4);
        }
        .sob-submit:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }
        .sob-error { text-align: center; font-size: 0.78rem; color: #dc2626; }
      `}</style>

      <div className="sob-overlay">
        <div className="sob-sheet">
          <div className="sob-handle" />

          <div className="sob-header">
            <h2>¿En qué área trabajas?</h2>
            <p>Selecciona tus habilidades para ver vacantes relevantes para ti.</p>
          </div>

          <div className="sob-counter">
            <span className="sob-counter-badge">{selectedSkills.size}</span>
            habilidades seleccionadas
          </div>

          {/* Categorías */}
          <div className="sob-cats">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                className={`sob-cat-btn ${activeCategory === cat.id ? "active" : ""}`}
                style={activeCategory === cat.id ? { background: cat.color } : {}}
                onClick={() => setActiveCategory(cat.id)}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Skills */}
          <div className="sob-skills">
            {currentCategory.skills.map(skill => {
              const isSelected = selectedSkills.has(skill);
              return (
                <button key={skill}
                  className={`sob-chip ${isSelected ? "selected" : ""}`}
                  style={isSelected ? { background: currentCategory.color } : {}}
                  onClick={() => toggleSkill(skill)}>
                  {isSelected ? "✓ " : ""}{skill}
                </button>
              );
            })}
          </div>

          <hr className="sob-divider" />

          {selectedSkills.size > 0 && (
            <div className="sob-preview">
              {Array.from(selectedSkills).map(skill => (
                <span key={skill} className="sob-tag">
                  {skill}
                  <button onClick={() => toggleSkill(skill)}>×</button>
                </span>
              ))}
            </div>
          )}

          {error && <p className="sob-error">{error}</p>}

          <button className="sob-submit"
            disabled={selectedSkills.size === 0 || loading}
            onClick={handleSubmit}>
            {loading ? "Guardando…" : `Explorar ${selectedSkills.size > 0 ? selectedSkills.size + " habilidades" : "habilidades"} →`}
          </button>
        </div>
      </div>
    </>
  );
}
