import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import AddJobModal from "../components/AddJobModal";
import JobsCard from "../components/JobsCard";
import "../styles/global.css";
import { fetchManualJobs } from "../services/api";
import type { ManualJob } from "../services/api";

interface JwtPayload { id: number; email: string; iat: number; exp: number; }

function getUserIdFromToken(): number | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return jwtDecode<JwtPayload>(token).id;
  } catch { return null; }
}

// Agrupar empleos por fecha de creación
function groupByDate(jobs: ManualJob[]): Record<string, ManualJob[]> {
  return jobs.reduce((acc, job) => {
    const fecha = job.created_at
      ? new Date(job.created_at).toLocaleDateString("es-MX", {
          day: "numeric", month: "long", year: "numeric",
        })
      : "Sin fecha";
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(job);
    return acc;
  }, {} as Record<string, ManualJob[]>);
}

export default function Calendar() {
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: manualJobs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["manualJobs", userId],
    queryFn: () => fetchManualJobs(),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  const handleJobAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["manualJobs", userId] });
    setShowModal(false);
  };

  const filteredJobs = manualJobs.filter(job => 
    !searchTerm || 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = groupByDate(filteredJobs);
  const dates   = Object.keys(grouped);

  return (
    <>
      <style>{`
        .cal-root {
          min-height: 100dvh; background: #f8faff;
          display: flex; flex-direction: column;
          font-family: 'Inter', sans-serif;
        }
        .cal-body {
          flex: 1; padding: 24px 16px 110px;
          max-width: 640px; margin: 0 auto; width: 100%;
        }
        .cal-heading {
          font-size: 1.3rem; font-weight: 800;
          color: #0f172a; margin-bottom: 6px;
          font-family: 'Syne', sans-serif;
        }
        .cal-sub {
          font-size: 0.8rem; color: #94a3b8; margin-bottom: 24px;
        }
        .cal-group { margin-bottom: 28px; }
        .cal-date-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #2563eb; margin-bottom: 10px;
        }
        .cal-date-label::after {
          content: ''; flex: 1; height: 1px; background: #dbeafe;
        }
        .cal-jobs { display: flex; flex-direction: column; gap: 10px; }
        .cal-empty {
          text-align: center; padding: 60px 16px; color: #94a3b8;
        }
        .cal-empty-icon { font-size: 2.5rem; margin-bottom: 14px; }
        .cal-empty h3 { font-size: 1rem; color: #475569; margin: 0 0 8px; }
        .cal-empty p  { font-size: 0.82rem; margin: 0; }
        .cal-add-btn {
          margin-top: 16px; padding: 10px 24px;
          background: #2563eb; border: none;
          border-radius: 99px; color: #fff;
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.18s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .cal-add-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        .cal-skeleton {
          display: flex; flex-direction: column; gap: 10px;
        }
        .cal-skel-card {
          height: 80px; border-radius: 16px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f4 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: calShimmer 1.5s infinite;
          border: 1px solid #e2e8f4;
        }
        @keyframes calShimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>

      <div className="cal-root">
        <Header />

        <main className="cal-body">
          <h2 className="cal-heading">📅 Mis postulaciones</h2>
          <p className="cal-sub">Empleos que has registrado manualmente, agrupados por fecha.</p>

          {/* Barra de búsqueda */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
             <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
             <input
               type="text"
               placeholder="Buscar vacante guardada…"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{
                 width: "100%", padding: "11px 16px 11px 42px",
                 background: "#fff", border: "1.5px solid #e2e8f4",
                 borderRadius: "14px", color: "#0f172a",
                 fontFamily: "'Inter', sans-serif", fontSize: "0.88rem",
                 outline: "none"
               }}
             />
          </div>

          {isLoading ? (
            <div className="cal-skeleton">
              {[...Array(4)].map((_, i) => <div key={i} className="cal-skel-card" />)}
            </div>
          ) : isError ? (
            <div className="cal-empty">
              <div className="cal-empty-icon">⚠️</div>
              <h3>Error al cargar</h3>
              <p>No se pudieron obtener tus postulaciones.</p>
            </div>
          ) : dates.length === 0 ? (
            <div className="cal-empty">
              <div className="cal-empty-icon">📭</div>
              <h3>Sin postulaciones</h3>
              <p>Agrega empleos manualmente para verlos aquí agrupados por fecha.</p>
              <button className="cal-add-btn" onClick={() => setShowModal(true)}>
                + Agregar empleo
              </button>
            </div>
          ) : (
            dates.map(fecha => (
              <div key={fecha} className="cal-group">
                <div className="cal-date-label">📅 {fecha}</div>
                <div className="cal-jobs">
                  {grouped[fecha].map(job => (
                    <JobsCard
                      key={job.id}
                      job={{ ...job, isManual: true }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </main>

        <BottomNav activeNav="calendar" onAddClick={() => setShowModal(true)} />
      </div>

      {showModal && (
        <AddJobModal
          userId={userId!}
          onClose={() => setShowModal(false)}
          onJobAdded={handleJobAdded}
        />
      )}
    </>
  );
}
