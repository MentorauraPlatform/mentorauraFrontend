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
    return authApi.resendVerification(email);
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
