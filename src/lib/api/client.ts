/**
 * Industry-Standard API Client for MentorAura.
 * Features:
 * 1. Automatic Authorization Token Injection (from localStorage)
 * 2. Automatic JWT Token Refresh on 401 Unauthorized errors
 * 3. Unified Error Formatting & Type-Safe Responses
 * 4. Request Timeout Abort Controllers
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T = any> {
  statusCode: number;
  message?: string | string[];
  data: T;
}

export class ApiError extends Error {
  statusCode: number;
  error?: string;
  messages: string[];

  constructor(statusCode: number, message: string | string[], error?: string) {
    const primaryMessage = Array.isArray(message) ? message.join(', ') : message;
    super(primaryMessage);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
    this.messages = Array.isArray(message) ? message : [message];
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(null);
    }
  });
  failedQueue = [];
};

async function refreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Refresh token invalid');
    }

    const data = await res.json();
    const newAccessToken = data.tokens?.accessToken || data.accessToken;
    const newRefreshToken = data.tokens?.refreshToken || data.refreshToken;

    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      return newAccessToken;
    }
    return null;
  } catch (err) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle Token Expiration (401)
    if (response.status === 401 && !isRetry && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => request<T>(endpoint, options, true));
      }

      isRefreshing = true;
      const newPathToken = await refreshToken();
      isRefreshing = false;

      if (newPathToken) {
        processQueue(null);
        return request<T>(endpoint, options, true);
      } else {
        processQueue(new ApiError(401, 'Session expired. Please log in again.'));
      }
    }

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.message || response.statusText || 'An error occurred',
        responseData.error
      );
    }

    // Unwrap NestJS Standard API Wrapper ({ statusCode, data, message })
    return (responseData.data !== undefined ? responseData.data : responseData) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout. Please check your network connection.');
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || 'Network error occurred');
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
