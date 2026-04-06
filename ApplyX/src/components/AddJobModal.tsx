import { useState } from 'react';

type JobStatus = 'guardada' | 'aplicada' | 'pendiente' | 'rechazada';

interface NewJob {
  title: string;
  company: string;
  link: string;
  status: JobStatus;
  description: string;
}

interface AddJobModalProps {
  onClose: () => void;
  onAdd: (job: NewJob) => void;
}

const AddJobModal = ({ onClose, onAdd }: AddJobModalProps) => {
  const [form, setForm] = useState<NewJob>({
    title: '',
    company: '',
    link: '',
    status: 'guardada',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company) return;
    onAdd(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>

        <div className="modal-handle" />
        <h2 className="modal-title">Agregar vacante</h2>

        <form onSubmit={handleSubmit}>

          <label className="form-label">Nombre de la empresa *</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Ej. Google México"
            className="form-input"
            required
          />

          <label className="form-label">Nombre del puesto *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej. Diseñador UX/UI"
            className="form-input"
            required
          />

          <div className="form-row">
            <div>
              <label className="form-label">Link</label>
              <input
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://..."
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Estatus</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-input form-select"
              >
                <option value="guardada">Guardada</option>
                <option value="aplicada">Aplicada</option>
                <option value="pendiente">Pendiente</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
          </div>

          <label className="form-label">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="¿Por qué te interesa esta vacante?"
            className="form-input form-textarea"
          />

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-add">
              Agregar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
