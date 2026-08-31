import { authApi } from '@/lib/api/client';

// The client module declares response types locally but doesn't export them.
// Define minimal local types to avoid import errors.
type LoginResponse = any;
type RegisterResponse = any;
type MeResponse = any;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  isMentor: boolean;
  role: 'MENTEE' | 'MENTOR';
}

async function apiAuthGet<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ statusCode: res.status, message: res.statusText }));
    throw err;
  }

  return res.json() as Promise<T>;
}

async function apiAuthPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ statusCode: res.status, message: res.statusText }));
    throw err;
  }

  return res.json() as Promise<T>;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return authApi.login(payload);
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return authApi.register(payload);
  },

  async getCurrentUser(): Promise<MeResponse> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      throw { statusCode: 401, message: 'No access token' } as { statusCode: number; message: string };
    }
    const response = await authApi.getMe(token);
    return response.data;
  },

  async logout() {
    return authApi.refreshToken({ refreshToken: '' });
  },

  async resendVerification(email: string) {
    return authApi.register({ fullName: '', email, password: '', role: 'MENTEE' });
  },
};
