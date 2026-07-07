/**
 * API Client — shared Axios instance, interceptors, and request function.
 *
 * This file has NO circular dependencies. Domain services and api.ts both import from here.
 */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};


export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * The one place that understands the `auth_session` localStorage shape.
 * Everything that needs the session or a token (axios interceptor, the chat
 * SSE fetch, per-user query keys) goes through these.
 */
export function getSession(): any | null {
  try {
    const raw = localStorage.getItem('auth_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  const session = getSession();
  if (!session) return null;
  if (typeof session === 'string') return session;
  return session.access_token || session.accessToken || null;
}

/** Auth headers for requests made outside the axios instance (e.g. SSE fetch). */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const activeOrgId = localStorage.getItem('active_org_id');
  if (activeOrgId) headers['X-Organization-Id'] = activeOrgId;
  return headers;
}

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const activeOrgId = localStorage.getItem('active_org_id');
    if (activeOrgId) {
      config.headers['X-Organization-Id'] = activeOrgId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isProtectedRoute = currentPath.startsWith('/app/') || currentPath === '/app';
      if (isProtectedRoute) {
        localStorage.removeItem('auth_session');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

class ApiError extends Error {
  code?: string;
  /** HTTP status of the failed response, when there was one. */
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'ApiError';
  }
}

export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      const code = error.response?.data?.code;
      throw new ApiError(message, code, error.response?.status);
    }
    throw error;
  }
};
