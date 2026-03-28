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

if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    ENV_VAR: process.env.REACT_APP_API_URL
  });
}

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const sessionStr = localStorage.getItem('auth_session');
    if (process.env.NODE_ENV === 'development') {
      console.log('Interceptor checking auth_session:', sessionStr ? 'Found' : 'Not found');
    }

    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (process.env.NODE_ENV === 'development') {
          console.log('Parsed session object (keys only):', Object.keys(session));
        }

        let token = null;
        if (session.access_token) {
          token = session.access_token;
        } else if (session.accessToken) {
          token = session.accessToken;
        } else if (typeof session === 'string') {
          token = session;
        }

        if (token) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Setting Authorization header with token');
          }
          config.headers.Authorization = `Bearer ${token}`;
        }

        const activeOrgId = localStorage.getItem('active_org_id');
        if (activeOrgId) {
          config.headers['X-Organization-Id'] = activeOrgId;
        }

        if (!token && process.env.NODE_ENV === 'development') {
          console.warn('No token found in session. Session keys:', Object.keys(session || {}));
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to parse session', e);
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('No auth_session found in localStorage');
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

const debugApiCall = (method: string, url: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔶 API ${method}: ${API_CONFIG.BASE_URL}${url}`, data || '');
    console.log('Headers:', {
      'Authorization': localStorage.getItem('auth_session') ? 'Bearer [TOKEN]' : 'None',
      'Content-Type': 'application/json'
    });
  }
};

class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    debugApiCall(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
    const response: AxiosResponse<T> = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      const code = error.response?.data?.code;
      throw new ApiError(message, code);
    }
    throw error;
  }
};
