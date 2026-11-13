/**
 * Core HTTP Client and base request handlers for Mentoraura frontend.
 */

import { getApiBaseUrl } from './base-url';

export type ApiResponse<T> = {
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit?: number;
    totalPages: number;
  };
};

export type ApiError = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

const BFF_AUTH_ROUTES = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/auth/me',
  '/auth/refresh',
  '/auth/token',
  '/auth/admin/accept-invite',
]);

export function getEndpointUrl(path: string): string {
  if (typeof window !== 'undefined') {
    const cleanPath = path.split('?')[0];
    // In browser, route cookie-managing auth requests through Next.js BFF API routes,
    // and route stateless auth/API endpoints through the catch-all proxy.
    if (BFF_AUTH_ROUTES.has(cleanPath)) {
      return `/api${path}`;
    }
    return `/api/proxy${path}`;
  }
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
}

export async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const res = await fetch(getEndpointUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(getEndpointUrl(path), {
    ...options,
    headers,
    credentials: 'include', // Same-site cookies sent automatically to Next.js API routes
  });

  if (res.status === 401 && !isRetry && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh')) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return request<T>(path, options, true);
    }
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw err;
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export async function rawRequest<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(getEndpointUrl(path), {
    ...options,
    headers,
    credentials: 'include', // Same-site cookies sent automatically to Next.js API routes
  });

  if (res.status === 401 && !isRetry && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh')) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return rawRequest<T>(path, options, true);
    }
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw err;
  }

  return res.json() as Promise<T>;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
