import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { loginUsuario, loginGoogleUsuario } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUsuario(email, password);
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setError('');
      setLoading(true);
      try {
        const data = await loginGoogleUsuario(codeResponse.access_token);
        localStorage.setItem('token', data.token);
        navigate('/home');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Fallo el inicio de sesión con Google'),
  });

  return (
    <div className="login-container">

      {/* ——— MITAD SUPERIOR: naranja ——— */}
      <div className="login-top">
        <div className="login-logo">AX</div>
        <h1 className="login-top-title">ApplyX</h1>
        <p className="login-top-subtitle">Gestiona tus postulaciones en un solo lugar</p>

        {/* Círculos decorativos */}
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
      </div>

      {/* ——— MITAD INFERIOR: blanca ——— */}
      <div className="login-bottom">
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle">Bienvenido de nuevo 👋</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />

          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>⚠️ {error}</p>}

          <span className="login-forgot">¿Olvidaste tu contraseña?</span>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>

          <div className="login-divider"><span>o continúa con</span></div>

          <button type="button" className="login-google-btn" onClick={() => loginWithGoogle()}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#9a9a9a' }}>
          ¿No tienes cuenta?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: '#e85d26', fontWeight: 600, cursor: 'pointer' }}
          >
            Regístrate
          </span>
        </p>
      </div>

    </div>
  );
};

export default Login;
