import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotificaciones, marcarNotificacionLeida } from '../services/api';

interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

const Header = () => {
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones al montar
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // evitar llamar si no hay token real
        const res = await getNotificaciones();
        if (res.success) {
          setNotificaciones(res.data);
        }
      } catch (error) {
        console.error("Error cargando notificaciones", error);
      }
    };
    fetchNotifs();
  }, []);

  // Cerrar menús al clickear fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNotif(false);
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleMarcarLeida = async (id: number) => {
    try {
      await marcarNotificacionLeida(id);
      // Actualizar localmente para no recargar toda la lista si no es necesario
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error("Error al marcar como leída", error);
    }
  };

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo-circle">AX</div>
        <span className="header-brand">ApplyX</span>
      </div>

      <div className="header-search-wrapper">
        <span className="header-search-icon">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input type="text" placeholder="Buscar..." className="header-search" />
      </div>

      <div className="header-right" ref={menuRef} style={{ position: 'relative' }}>
        
        {/* Campanita de Notificaciones */}
        <button 
          className="header-icon-btn" 
          onClick={() => { setShowNotif(!showNotif); setShowMenu(false); }}
          style={{ position: 'relative' }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '0', right: '2px', background: '#dc2626',
              color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        
        {showNotif && (
          <div style={{ position: 'absolute', top: '120%', right: '40px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', width: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1e293b' }}>Notificaciones</h4>
            
            {notificaciones.length === 0 ? (
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
                No tienes notificaciones.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notificaciones.map(notif => (
                  <div key={notif.id} style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: notif.leida ? '#f8fafc' : '#fff5f1',
                    border: notif.leida ? '1px solid #e2e8f0' : '1px solid #fed7aa',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', fontWeight: notif.leida ? 'normal' : '600' }}>
                        {notif.mensaje}
                      </p>
                    </div>
                    {!notif.leida && (
                      <button 
                        onClick={() => handleMarcarLeida(notif.id)}
                        style={{ background: 'none', border: 'none', color: '#e85d26', fontSize: '11px', cursor: 'pointer', padding: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}
                      >
                        ✔ Marcar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div 
          className="header-avatar" 
          onClick={() => { setShowMenu(!showMenu); setShowNotif(false); }}
          style={{ cursor: 'pointer' }}
        >
          U
        </div>

        {showMenu && (
          <div style={{ position: 'absolute', top: '120%', right: '0', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 0', width: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100 }}>
            <button 
              onClick={handleLogout} 
              style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', color: '#dc2626', fontSize: '14px', fontWeight: '500' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
