/**
 * api.ts — Shared fetch helpers for the SecondBrain Dashboard.
 *
 * Centralizes what used to be two near-identical `fetchJSON`/`api` helpers
 * duplicated in App.tsx and AgentHub.tsx. Every request includes
 * `credentials: 'include'` so the httpOnly session cookie is sent — this
 * matters once the dashboard is reached through a tunnel/reverse-proxy
 * hostname (remote members) rather than plain localhost, where a missing
 * `credentials` flag silently drops the cookie and looks like a random
 * 401.
 */

export interface ApiError { error: string }

async function request<T>(method: string, url: string, body?: unknown): Promise<{ data: T | null; status: number; error?: string }> {
  try {
    const r = await fetch(url, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const status = r.status;
    let json: any = null;
    try { json = await r.json(); } catch { /* empty body */ }
    if (!r.ok) {
      return { data: null, status, error: json?.error || `Request failed (${status})` };
    }
    return { data: json as T, status };
  } catch (err) {
    return { data: null, status: 0, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body ?? {}),
  patch: <T>(url: string, body?: unknown) => request<T>('PATCH', url, body ?? {}),
  del: <T>(url: string) => request<T>('DELETE', url),
};

/** Back-compat convenience matching the old `fetchJSON<T>(path)` signature
 *  used throughout App.tsx — returns null on any failure. */
export async function fetchJSON<T>(path: string): Promise<T | null> {
  const { data } = await api.get<T>(path);
  return data;
}
