import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { registerUsuario } from '../services/api';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUsuario(nombre, email, password);
      navigate('/'); // Redirige al login
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* Mitad superior */}
      <div className="login-top">
        <div className="login-logo">AX</div>
        <h1 className="login-top-title">ApplyX</h1>
        <p className="login-top-subtitle">Crea tu cuenta y empieza a gestionar tus postulaciones</p>
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
      </div>

      {/* Mitad inferior */}
      <div className="login-bottom">
        <h2 className="login-title">Crear cuenta</h2>
        <p className="login-subtitle">Es gratis y tarda menos de un minuto 🚀</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="login-input"
            required
          />

          {error && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
              ⚠️ {error}
            </p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#9a9a9a' }}>
          ¿Ya tienes cuenta?{' '}
          <span
            onClick={() => navigate('/')}
            style={{ color: '#e85d26', fontWeight: 600, cursor: 'pointer' }}
          >
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
