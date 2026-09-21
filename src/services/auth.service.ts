import { authApi } from '@/lib/api/client';
import type { LoginResponse, RegisterResponse, MeResponse } from '@/lib/types';

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
    const response = await authApi.getMe();
    return (response as { data?: MeResponse })?.data ?? (response as unknown as MeResponse);
  },

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  },

  async resendVerification(email: string) {
    return authApi.register({ fullName: '', email, password: '', role: 'MENTEE' });
  },

  async requestForgotPasswordOtp(email: string) {
    return authApi.requestForgotPasswordOtp(email);
  },

  async verifyOtp(email: string, otp: string) {
    return authApi.verifyOtp(email, otp);
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    return authApi.resetPassword(email, otp, newPassword);
  },
};
