const BASE_URL = "http://localhost:3000/api";

// ------- HELPER para obtener el token guardado -------
export const getToken = () => localStorage.getItem('token');

// ------- PETICIONES A LA API -------

// Login
export const loginUsuario = async (correo: string, password: string) => {
    const res = await fetch(`${BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ correo, password}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
    return data;
};

// ---- VACANTES EXTERNAS ----
export const fetchJobs = async (search = '', page = 1, limit = 10) => {
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
    const res = await fetch(`${BASE_URL}/jobs/all?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener vacantes');
    return data;
};

// ---- FAVORITOS -----
export const getFavoritos = async (id_usuario: number) => {
    const res = await fetch(`${BASE_URL}/favoritos/${id_usuario}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
};

export const addFavorito = async (id_empleo: string, titulo_empleo: string, empresa: string) => {
    const res = await fetch(`${BASE_URL}/favoritos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ id_empleo, titulo_empleo, empresa }),
    });
    return res.json();
};

export const deleteFavoritos = async (id: number) => {
    const res = await fetch(`${BASE_URL}/favoritos/${id}`, {
        method: 'DELETE',
        headers: { Authorization : `Bearer ${getToken()}`},
    });
    return res.json();
};

// ——— REGISTRO ———
export const registerUsuario = async (
  nombre: string,
  correo: string,
  password: string,
  rol: string = 'usuario'
) => {
  const res = await fetch(`${BASE_URL}/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, password, rol }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al registrarse');
  return data;
};

// ---- NOTIFICACIONES ----
export const getNotificaciones = async () => {
    const res = await fetch(`${BASE_URL}/notificaciones`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
};

export const marcarNotificacionLeida = async (id: number | string) => {
    const res = await fetch(`${BASE_URL}/notificaciones/${id}/leida`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
};
