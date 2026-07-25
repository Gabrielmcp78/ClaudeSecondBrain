/**
 * AuthContext — current session state for the SecondBrain Dashboard.
 *
 * Wraps the whole app. On mount it calls GET /api/auth/me once, which
 * always returns 200 with an `authenticated` flag (see server/index.ts) —
 * that lets App.tsx branch cleanly between Bootstrap / Login / Dashboard
 * without special-casing HTTP error codes.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthState, Member, Role } from '../types';

interface AuthContextValue extends AuthState {
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  bootstrap: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMPTY_STATE: AuthState = { authenticated: false, bootstrapRequired: false, permissions: [] };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await api.get<AuthState & { member?: Member; role?: Role }>('/api/auth/me');
    setState(data ?? EMPTY_STATE);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await api.post<{ ok: boolean }>('/api/auth/login', { email, password });
    if (!data?.ok) return { ok: false, error: error || 'Login failed' };
    await refresh();
    return { ok: true };
  }, [refresh]);

  const bootstrap = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await api.post<{ ok: boolean }>('/api/auth/bootstrap', { name, email, password });
    if (!data?.ok) return { ok: false, error: error || 'Setup failed' };
    await refresh();
    return { ok: true };
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout');
    setState(EMPTY_STATE);
  }, []);

  const hasPermission = useCallback((key: string) => {
    return state.permissions.includes('manage_system') || state.permissions.includes(key);
  }, [state.permissions]);

  return (
    <AuthContext.Provider value={{ ...state, loading, refresh, login, bootstrap, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
