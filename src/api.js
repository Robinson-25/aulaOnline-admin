// Nombre del sitio: cámbialo aquí (y SITE_NAME en server/.env) para renombrar la plataforma.
export const SITE = { first: 'Aula', accent: 'Pro', last: 'Online', full: 'Aula Pro Online' };

// Dirección de la API. En desarrollo queda vacía (Vite redirige /api al backend).
// En producción define VITE_API_URL=https://api.tudominio.com en el archivo .env
export const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
// Convierte rutas del backend (/uploads, /img, /api) en direcciones completas.
export const asset = (u) => (u && u.startsWith('/') ? API + u : u);

// Dirección del sitio público (proyecto aparte).
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

const TOKEN = 'aulapro_admin_token';
export const getToken = () => localStorage.getItem(TOKEN);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN, t) : localStorage.removeItem(TOKEN));

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try { res = await fetch(`${API}/api${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) }); }
  catch { throw new Error('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Ocurrió un error. Inténtalo de nuevo.'); e.status = res.status; throw e; }
  return data;
}

// Subida con barra de progreso (panel de administración).
export function upload(kind, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(), fd = new FormData();
    fd.append('file', file);
    xhr.open('POST', `${API}/api/admin/upload/${kind}`);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => { let d = {}; try { d = JSON.parse(xhr.responseText); } catch { /* */ } xhr.status < 300 ? resolve(d) : reject(new Error(d.error || 'No se pudo subir el archivo.')); };
    xhr.onerror = () => reject(new Error('Se interrumpió la subida. Inténtalo de nuevo.'));
    xhr.send(fd);
  });
}

export const money = (n) => (Number(n) === 0 ? 'Gratis' : `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 })}`);
export const fecha = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
