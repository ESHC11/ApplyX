const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Tipos compartidos ─────────────────────────────────────────────────────
export interface ExternalJob {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    salary: string;
    tags: string[];
    publishedAt: string;
    source: string;
}

export interface ManualJob {
    id: number;
    title: string;
    company: string;
    description?: string;
    link?: string;
    status?: "Guardada" | "Aplicada" | "Pendiente" | "Rechazada";
    iconType?: string;
    created_at?: string;
}

export interface NewManualJob {
    title: string;
    company: string;
    description?: string;
    link?: string;
    status?: string;
    iconType?: string;
}

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
// El backend devuelve { success, total, jobs: [...] }
// Home.tsx espera un array directo → extraemos data.jobs
export const fetchJobs = async (search = '', page = 1, limit = 10) => {
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
    const res = await fetch(`${BASE_URL}/jobs/all?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener vacantes');
    return (data.jobs ?? []) as ExternalJob[];
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

// ---- USUARIO / SKILLS ----
// El backend devuelve el objeto usuario directo (no envuelto en {data})
// Lanzamos error para que React Query lo detecte correctamente
export const fetchUsuario = async (id: number) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener usuario');
    return data; // { id_usuario, nombre, correo, rol, skills: string[], fecha_registro }
};

export const updateUsuarioSkills = async (id: number, skills: string[]) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/skills`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ skills }),
    });
    return res.json();
};

export const updateUsuarioPerfil = async (id: number, nombre: string, correo: string) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}/perfil`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ nombre, correo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar perfil');
    return data;
};

// ---- TRABAJOS MANUALES ----
// El backend devuelve { success, data: [...] }
// El userId lo lee el backend del JWT, no lo necesitamos como parámetro
export const fetchManualJobs = async () => {
    const res = await fetch(`${BASE_URL}/manual-jobs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener empleos manuales');
    return (data.data ?? []) as ManualJob[];
};

export const createManualJob = async (jobData: NewManualJob) => {
    const res = await fetch(`${BASE_URL}/manual-jobs`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(jobData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Error al crear empleo manual');
    return data.data;
};

export const deleteManualJob = async (id: number | string) => {
    const res = await fetch(`${BASE_URL}/manual-jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    return res.json();
};

export const updateManualJobStatus = async (
    id: number | string,
    status: "Guardada" | "Aplicada" | "Pendiente" | "Rechazada"
) => {
    const res = await fetch(`${BASE_URL}/manual-jobs/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar estatus');
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
