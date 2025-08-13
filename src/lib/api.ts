export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

function isBrowser() { return typeof window !== 'undefined'; }

const TOKEN_KEY = 'access';
export function getToken(): string | null { return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null; }
export function setToken(token: string) { if (isBrowser()) localStorage.setItem(TOKEN_KEY, token); }
export function clearToken() { if (isBrowser()) localStorage.removeItem(TOKEN_KEY); }

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${API_BASE}${path}`;
  const isFormData = init.body instanceof FormData;

  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
  };

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error((data?.detail as string) || JSON.stringify(data) || `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (res.json() as Promise<T>) : (res as unknown as T);
}

export const api = {
  get: <T>(p: string) => apiFetch<T>(p),
  post: <T>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put:  <T>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'PUT',  body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  patch:<T>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'PATCH',body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  del:  <T>(p: string) => apiFetch<T>(p, { method: 'DELETE' }),
};

export function mediaUrl(path?: string | null) {
  if (!path) return '';
  return path.startsWith('/') ? `${API_BASE}${path}` : path;
}
