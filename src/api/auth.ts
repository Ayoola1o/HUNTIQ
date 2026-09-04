/**
 * Client Authentication API
 * Connects frontend to Express auth service with JWT token persistence.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  workspaceId: string;
  role: string;
  defaultCurrency: string;
}

export interface AuthSuccessPayload {
  user: UserAccount;
  token: string;
}

const TOKEN_KEY = 'huntiq_auth_token';
const USER_KEY = 'huntiq_user_profile';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: UserAccount) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user.defaultCurrency) {
      localStorage.setItem('huntiq_preferred_currency', user.defaultCurrency);
    }
  } catch {}
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export async function signupUser(params: {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  defaultCurrency?: string;
}): Promise<AuthSuccessPayload> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || body.error || 'Failed to sign up.');
  }

  setStoredSession(body.data.token, body.data.user);
  return body.data;
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<AuthSuccessPayload> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || body.error || 'Invalid credentials.');
  }

  setStoredSession(body.data.token, body.data.user);
  return body.data;
}

export async function fetchCurrentUser(): Promise<UserAccount | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      clearStoredSession();
      return null;
    }
    const body = await res.json();
    if (body.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(body.data));
      return body.data;
    }
    return null;
  } catch {
    return getStoredUser();
  }
}

export async function fetchUserApiKeys(): Promise<any[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/api-keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data || [];
  } catch {
    return [];
  }
}

export async function createUserApiKey(name: string): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ name })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to create API key');
  return body.data;
}

export async function deleteUserApiKey(id: string): Promise<boolean> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/api-keys/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  return res.ok;
}

export async function fetchUserActivityLogs(): Promise<any[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/activity`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data || [];
  } catch {
    return [];
  }
}

export async function updateUserProfile(updates: { fullName?: string; companyName?: string; defaultCurrency?: string }): Promise<UserAccount> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(updates)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update profile');
  const user = body.data;
  if (token && user) {
    setStoredSession(token, user);
  }
  return user;
}

