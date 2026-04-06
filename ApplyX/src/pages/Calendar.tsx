import { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AddJobModal from '../components/AddJobModal';
import JobCard from '../components/JobsCard';
import '../styles/global.css';
import { fetchJobs } from '../services/api';

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

const Calendar = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarVacantes = async () => {
      try {
        setLoading(true);
        const data = await fetchJobs();
        const normalized: Job[] = data.jobs.map((j: Record<string, unknown>) => ({
          id: j.id as string,
          title: j.title as string,
          company: j.company as string,
          description: j.description as string,
          link: j.url as string,
          status: 'pendiente' as const,
          date: new Date(j.publishedAt as string).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
          }),
          iconType: 'blue' as const,
        }));
        setJobs(normalized);
      } catch {
        setError('No se pudieron cargar las vacantes. ¿Está el servidor corriendo?');
      } finally {
        setLoading(false);
      }
    };
    cargarVacantes();
  }, []);

  const handleAddJob = (newJob: Omit<Job, 'id' | 'date' | 'iconType'>) => {
    setJobs(prev => [
      ...prev,
      {
        ...newJob,
        id: Date.now(),
        date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }),
        iconType: 'blue' as const,
      },
    ]);
    setModalOpen(false);
  };

  const handleDelete = (id: number | string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  // Agrupar trabajos por fecha
  const jobsAgrupados = jobs.reduce((acumulador: Record<string, Job[]>, job) => {
    const fecha = job.date;
    if (!acumulador[fecha]) acumulador[fecha] = [];
    acumulador[fecha].push(job);
    return acumulador;
  }, {});

  return (
    <div className="home-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <div style={{ padding: '80px 20px 100px', flex: 1, maxWidth: '100%' }}>
        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '24px' }}>Calendario de Vacantes</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9a9a9a', marginTop: '40px', fontSize: '14px' }}>
            ⏳ Cargando calendario...
          </p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#dc2626', marginTop: '40px', fontSize: '13px' }}>
            ⚠️ {error}
          </p>
        ) : Object.keys(jobsAgrupados).length > 0 ? (
          Object.keys(jobsAgrupados).map(fecha => (
            <div key={fecha} style={{ marginBottom: '32px' }}>
              <h3 style={{ 
                color: '#e85d26', 
                borderBottom: '2px solid #f1f5f9', 
                paddingBottom: '8px', 
                marginBottom: '16px',
                fontSize: '16px'
              }}>
                📅 {fecha}
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {jobsAgrupados[fecha].map(job => (
                  <JobCard key={job.id} job={job} onDelete={() => handleDelete(job.id)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', fontSize: '14px' }}>
            No hay vacantes para mostrar.
          </p>
        )}
      </div>

      <BottomNav activeNav="calendar" onAddClick={() => setModalOpen(true)} />

      {modalOpen && (
        <AddJobModal
          onClose={() => setModalOpen(false)}
          onAdd={handleAddJob}
        />
      )}
    </div>
  );
};

export default Calendar;
