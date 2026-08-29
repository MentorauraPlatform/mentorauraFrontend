import { apiClient } from '@/lib/api/client';
import { User } from '@/context/AuthContext';

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
  /**
   * Log in user via Next.js API Route (Sets HttpOnly Cookie)
   */
  async login(payload: LoginPayload) {
    return apiClient.post<{ user: User }>('/api/auth/login', payload);
  },

  /**
   * Register new user account via Next.js API Route
   */
  async register(payload: RegisterPayload) {
    return apiClient.post('/api/auth/register', payload);
  },

  /**
   * Fetch currently logged-in user profile (Reads HttpOnly Cookie)
   */
  async getCurrentUser() {
    return apiClient.get<User>('/api/auth/me');
  },

  /**
   * Logout user (Clears HttpOnly Cookie)
   */
  async logout() {
    return apiClient.post('/api/auth/logout', {});
  },

  /**
   * Resend email verification
   */
  async resendVerification(email: string) {
    return apiClient.post('/auth/resend-verification', { email });
  },
};
