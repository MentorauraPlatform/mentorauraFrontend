/**
 * Core HTTP Client and base request handlers for Mentoraura frontend.
 */

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

export function getEndpointUrl(path: string): string {
  if (typeof window !== 'undefined') {
    // In browser, route requests through Next.js API routes (BFF pattern)
    if (path.startsWith('/auth/')) {
      return `/api${path}`;
    }
    return `/api/proxy${path}`;
  }
  const baseUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
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
