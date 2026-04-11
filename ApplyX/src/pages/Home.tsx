import { useState, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import "../styles/global.css";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import JobsCard from "../components/JobsCard";
import AddJobModal from "../components/AddJobModal";
import SkillsOnboarding from "../components/SkillsOnboarding";

import {
  fetchJobs,
  fetchUsuario,
  fetchManualJobs,
} from "../services/api";

// ── Tipos ──────────────────────────────────────────────────────────────────
interface JwtPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

interface Job {
  id: string | number;
  title: string;
  company: string;
  location?: string;
  url?: string;          // vacantes externas
  link?: string;         // empleos manuales
  source?: string;
  tags?: string[];
  description?: string;
  status?: "Guardada" | "Aplicada" | "Pendiente" | "Rechazada";
  isManual?: boolean;
}

type FilterStatus = "all" | "Guardada" | "Aplicada" | "Pendiente" | "Rechazada";

// ── Helper: decodificar JWT ────────────────────────────────────────────────
function getUserIdFromToken(): number | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = jwtDecode<JwtPayload>(token);
    return payload.id;
  } catch {
    return null;
  }
}

// ── Componente principal ───────────────────────────────────────────────────
export default function Home() {
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();

  const [showAddModal,    setShowAddModal]    = useState(false);
  const [filterStatus,    setFilterStatus]    = useState<FilterStatus>("all");
  const [searchTerm,      setSearchTerm]      = useState("");
  const [showOnboarding,  setShowOnboarding]  = useState(false);
  const [page,            setPage]            = useState(1);

  // ── Query: datos del usuario (skills) ─────────────────────────────────
  const {
    data: usuario,
    isLoading: loadingUsuario,
  } = useQuery({
    queryKey: ["usuario", userId],
    queryFn: () => fetchUsuario(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const skills: string[]  = usuario?.skills ?? [];
  const hasSkills          = skills.length > 0;
  const needsOnboarding    = !loadingUsuario && !hasSkills;

  // ── Query: vacantes externas (filtradas por skills) ────────────────────
  const {
    data: externalJobs = [],
    isLoading: loadingExternal,
    isFetching: fetchingExternal,
    isError: errorExternal,
    refetch: refetchExternal,
  } = useQuery({
    queryKey: ["jobs", skills, page],
    queryFn: () => fetchJobs(skills.join(","), page),
    enabled: hasSkills,
    staleTime: 3 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // ── Query: empleos manuales ────────────────────────────────────────────
  const {
    data: manualJobs = [],
    isLoading: loadingManual,
  } = useQuery({
    queryKey: ["manualJobs", userId],
    queryFn: () => fetchManualJobs(),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // ── Combinar y filtrar empleos ─────────────────────────────────────────
  const allJobs: Job[] = useMemo(() => {
    const manual: Job[] = manualJobs.map((j) => ({ ...j, isManual: true as const }));
    const external: Job[] = externalJobs.map((j) => ({ ...j, isManual: false as const }));
    return [...manual, ...external];
  }, [manualJobs, externalJobs]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchStatus =
        filterStatus === "all" || job.status === filterStatus;
      const matchSearch =
        !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [allJobs, filterStatus, searchTerm]);

  // ── Callback: onboarding completado ───────────────────────────────────
  const handleOnboardingComplete = (newSkills: string[]) => {
    queryClient.setQueryData(["usuario", userId], (old: Record<string, unknown> | undefined) => ({
      ...old,
      skills: newSkills,
    }));
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    setShowOnboarding(false);
  };

  // ── Callback: empleo manual agregado ──────────────────────────────────
  const handleJobAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["manualJobs", userId] });
    setShowAddModal(false);
  };

  // ── Loading inicial ────────────────────────────────────────────────────
  const isLoading = loadingUsuario || (hasSkills && loadingExternal) || loadingManual;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .home-root {
          min-height: 100dvh;
          background: #f8faff;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          display: flex; flex-direction: column;
        }
        .home-body {
          flex: 1; padding: 20px 16px 110px;
          max-width: 640px; margin: 0 auto; width: 100%;
        }

        /* Search */
        .home-search { position: relative; margin-bottom: 14px; }
        .home-search input {
          width: 100%; padding: 11px 16px 11px 42px;
          background: #fff; border: 1.5px solid #e2e8f4;
          border-radius: 14px; color: #0f172a;
          font-family: 'Inter', sans-serif; font-size: 0.88rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .home-search input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .home-search input::placeholder { color: #94a3b8; }
        .home-search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #94a3b8;
        }

        /* Filtros */
        .home-filters {
          display: flex; gap: 6px; overflow-x: auto;
          padding-bottom: 4px; margin-bottom: 18px; scrollbar-width: none;
        }
        .home-filters::-webkit-scrollbar { display: none; }
        .home-filter-btn {
          flex-shrink: 0; padding: 6px 14px; border-radius: 99px;
          border: 1.5px solid #e2e8f4; background: #fff;
          color: #64748b; font-family: 'Inter', sans-serif;
          font-size: 0.78rem; cursor: pointer; transition: all 0.18s; white-space: nowrap;
        }
        .home-filter-btn:hover { border-color: #93c5fd; color: #2563eb; }
        .home-filter-btn.active {
          background: #2563eb; border-color: #2563eb; color: #fff;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }

        /* Section title */
        .home-section-title {
          font-size: 0.68rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #94a3b8; margin: 0 0 10px;
        }

        /* Skills bar */
        .home-skills-bar { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 18px; }
        .home-skill-tag {
          padding: 3px 10px; border-radius: 99px;
          background: #eff6ff; border: 1px solid #dbeafe;
          color: #2563eb; font-size: 0.72rem; font-weight: 500;
        }

        /* Jobs list */
        .home-jobs-list { display: flex; flex-direction: column; gap: 10px; }

        /* Empty */
        .home-empty { text-align: center; padding: 56px 16px; color: #94a3b8; }
        .home-empty-icon { font-size: 2.5rem; margin-bottom: 14px; }
        .home-empty h3 { font-size: 1rem; font-weight: 700; color: #475569; margin: 0 0 8px; }
        .home-empty p { font-size: 0.82rem; margin: 0; }
        .home-retry-btn {
          margin-top: 16px; padding: 8px 20px;
          background: #fff; border: 1.5px solid #e2e8f4;
          border-radius: 99px; color: #475569;
          font-family: 'Inter', sans-serif; font-size: 0.82rem;
          cursor: pointer; transition: all 0.18s;
        }
        .home-retry-btn:hover { border-color: #2563eb; color: #2563eb; }

        /* Skeleton */
        .home-skeleton { display: flex; flex-direction: column; gap: 10px; }
        .home-skel-card {
          height: 108px; border-radius: 18px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f4 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border: 1px solid #e2e8f4;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }

        /* Count */
        .home-count { font-size: 0.75rem; color: #94a3b8; margin-bottom: 14px; }
        .home-count strong { color: #475569; }
      `}</style>

      <div className="home-root">
        <Header />

        <main className="home-body">

          {/* Barra de búsqueda */}
          <div className="home-search">
            <span className="home-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por cargo o empresa…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros de estado */}
          <div className="home-filters">
            {(["all", "Guardada", "Aplicada", "Pendiente", "Rechazada"] as FilterStatus[]).map(
              (status) => (
                <button
                  key={status}
                  className={`home-filter-btn ${filterStatus === status ? "active" : ""}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" ? "Todas" : status}
                </button>
              )
            )}
          </div>

          {/* Skills activas */}
          {hasSkills && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <p className="home-section-title" style={{ margin: 0 }}>Buscando por tus habilidades</p>
                <button
                  onClick={() => setShowOnboarding(true)}
                  style={{
                    fontSize: "0.72rem", color: "#2563eb", background: "#eff6ff",
                    border: "1px solid #dbeafe", borderRadius: "99px",
                    padding: "2px 10px", cursor: "pointer", fontFamily: "Inter, sans-serif",
                    transition: "all 0.18s"
                  }}
                  title="Cambiar habilidades"
                >
                  ✏️ Cambiar
                </button>
              </div>
              <div className="home-skills-bar">
                {skills.map((s) => (
                  <span key={s} className="home-skill-tag">{s}</span>
                ))}
              </div>
            </>
          )}

          {/* Contenido principal */}
          {isLoading ? (
            <div className="home-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="home-skel-card" />
              ))}
            </div>
          ) : errorExternal ? (
            <div className="home-empty">
              <div className="home-empty-icon">⚠️</div>
              <h3>Error al cargar vacantes</h3>
              <p>No pudimos conectar con las fuentes externas.</p>
              <button className="home-retry-btn" onClick={() => refetchExternal()}>
                Reintentar
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="home-empty">
              <div className="home-empty-icon">🔍</div>
              <h3>Sin resultados</h3>
              <p>
                {searchTerm
                  ? `No hay vacantes que coincidan con "${searchTerm}"`
                  : "No hay vacantes para el filtro seleccionado."}
              </p>
            </div>
          ) : (
            <>
              <p className="home-count">
                <strong>{filteredJobs.length}</strong>{" "}
                {filteredJobs.length === 1 ? "vacante encontrada" : "vacantes encontradas"}
              </p>
              <div className="home-jobs-list" style={{ opacity: fetchingExternal ? 0.6 : 1, transition: "opacity 0.2s" }}>
                {filteredJobs.map((job) => (
                  <JobsCard key={job.id} job={job} />
                ))}
              </div>

              {/* Botones de Paginación para Vacantes Externas */}
              {filterStatus !== "Guardada" && filterStatus !== "Aplicada" && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || fetchingExternal}
                    className="home-retry-btn" style={{ margin: 0 }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", alignSelf: "center" }}>
                    Página {page}
                  </span>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={fetchingExternal || externalJobs.length < 10}
                    className="home-retry-btn" style={{ margin: 0 }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <BottomNav onAddClick={() => setShowAddModal(true)} />
      </div>

      {/* Modal agregar empleo manual */}
      {showAddModal && (
        <AddJobModal
          userId={userId!}
          onClose={() => setShowAddModal(false)}
          onJobAdded={handleJobAdded}
        />
      )}

      {/* Onboarding de skills — primera vez o al hacer click en "Cambiar" */}
      {(needsOnboarding || showOnboarding) && userId && (
        <SkillsOnboarding
          userId={userId}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}