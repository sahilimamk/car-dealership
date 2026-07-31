/**
 * AuthContext.jsx
 *
 * Provides authentication state and helpers to the entire app.
 *
 * State
 *   user  — decoded user object { id, username, role } or null
 *   token — raw JWT string or null
 *
 * Helpers
 *   login(username, password)        — POST /api/auth/login
 *   register(username, email, pass)  — POST /api/auth/register
 *   logout()                         — clears state + localStorage
 *
 * Persistence
 *   token and user are stored in localStorage so the session
 *   survives page refreshes.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

function getApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  if (import.meta.env.DEV) return '/api';
  return 'https://car-dealership-4ff1.onrender.com/api';
}

/**
 * Thin fetch wrapper for auth endpoints.
 * Throws a plain Error with .status and .data on non-2xx responses.
 */
async function authFetch(path, body) {
  const url = `${getApiBaseUrl()}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    const err = new Error(responseData?.error ?? `HTTP ${response.status}`);
    err.status = response.status;
    err.data = responseData;
    throw err;
  }

  return responseData;
}

function loadFromStorage() {
  try {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function persistToStorage(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const stored = loadFromStorage();

  const [token, setToken] = useState(stored.token);
  const [user,  setUser]  = useState(stored.user);

  /**
   * Login — calls POST /api/auth/login.
   * On success: persists token + user and updates state.
   * Throws on bad credentials or network error.
   */
  const login = useCallback(async (username, password) => {
    const data = await authFetch('/auth/login', { username, password });
    persistToStorage(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  /**
   * Register — calls POST /api/auth/register.
   * Does NOT auto-login; the caller decides whether to redirect to /login.
   * Throws on validation errors or duplicate username.
   */
  const register = useCallback(async (username, email, password) => {
    const data = await authFetch('/auth/register', { username, email, password });
    return data;
  }, []);

  /** Logout — wipes state and storage. */
  const logout = useCallback(() => {
    clearStorage();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
