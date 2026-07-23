export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const isApiConfigured = Boolean(API_URL);

// Access token JWT gardé en mémoire seulement (jamais localStorage/sessionStorage,
// pour limiter l'exposition en cas de XSS). Il est reconstruit au chargement de
// l'app via /auth/refresh, qui s'appuie sur le cookie httpOnly.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function rawFetch(path, options) {
  const headers = new Headers(options.headers || {});
  // FormData : laisser le navigateur poser lui-même Content-Type avec le
  // boundary multipart, ne jamais forcer application/json par-dessus.
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
}

// Dédoublonne les rafraîchissements simultanés : si plusieurs requêtes
// expirent en même temps, une seule vraie requête /auth/refresh part.
let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = rawFetch('/auth/refresh', { method: 'POST' })
      .then(async (res) => {
        if (!res.ok) {
          accessToken = null;
          return false;
        }
        const data = await res.json();
        accessToken = data.accessToken;
        return true;
      })
      .catch(() => {
        accessToken = null;
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const hadToken = Boolean(accessToken);
  let res = await rawFetch(path, options);

  // Un 401 alors qu'on avait un token = access token expiré, on tente un
  // rafraîchissement silencieux puis on rejoue la requête une seule fois.
  // Si on n'avait pas de token (ex. login qui échoue), inutile d'essayer.
  if (res.status === 401 && hadToken) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await rawFetch(path, options);
    }
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const rawMessage = isJson && body?.message ? body.message : null;
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || `Erreur ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return body;
}

export function apiGet(path) {
  return apiFetch(path, { method: 'GET' });
}
export function apiPost(path, body) {
  return apiFetch(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
}
export function apiPatch(path, body) {
  return apiFetch(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined });
}
export function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}

// Exposé pour l'amorçage de session au chargement de l'app (le cookie httpOnly
// survit au rechargement de page, contrairement à l'access token en mémoire).
export { refreshSession };
