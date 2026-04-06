import { useState, useEffect } from 'react';
import JobCard from '../components/JobsCard';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AddJobModal from '../components/AddJobModal';
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

const Home = () => {
  const [activeTab, setActiveTab] = useState<'todo' | 'guardado' | 'aplicado'>('todo');
  const [modalOpen, setModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar vacantes del backend al montar el componente
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

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'todo') return true;
    if (activeTab === 'guardado') return job.status === 'guardada';
    if (activeTab === 'aplicado') return job.status === 'aplicada';
    return true;
  });

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
  };

  const handleDelete = (id: number | string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  return (
    <div className="home-container">

      {/* Header */}
      <Header />

      {/* Tabs */}
      <div className="tabs-wrapper">
        {(['todo', 'guardado', 'aplicado'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'todo' ? 'Todo' : tab === 'guardado' ? 'Guardado' : 'Aplicado'}
          </button>
        ))}
      </div>

      {/* Lista de vacantes */}
      <div className="jobs-list">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9a9a9a', marginTop: '60px', fontSize: '14px' }}>
            ⏳ Cargando vacantes...
          </p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#dc2626', marginTop: '60px', fontSize: '13px', padding: '0 20px' }}>
            ⚠️ {error}
          </p>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onDelete={() => handleDelete(job.id)} />
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', fontSize: '14px' }}>
            No hay vacantes en esta sección aún.
          </p>
        )}
      </div>

      <BottomNav onAddClick={() => setModalOpen(true)} />

      {modalOpen && (
        <AddJobModal
          onClose={() => setModalOpen(false)}
          onAdd={handleAddJob}
        />
      )}
    </div>
  );
};

export default Home;