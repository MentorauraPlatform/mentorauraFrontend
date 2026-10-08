import type {
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  MeResponse,
} from '../types';
import { request, rawRequest } from './http';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: 'MENTEE' | 'MENTOR';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    rawRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginPayload) =>
    rawRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: (data: RefreshTokenPayload) =>
    rawRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<MeResponse>('/auth/me', { method: 'GET' }),

  requestForgotPasswordOtp: (email: string) =>
    rawRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    rawRequest<{ message: string; valid: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    rawRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),
};
