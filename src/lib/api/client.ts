/**
 * Centralized API client for Mentoraura frontend.
 *
 * All API calls go through this file.
 * The frontend NEVER makes business decisions — it sends data
 * to the NestJS API and renders what comes back.
 */

import type { MentorProfile, UserSkill } from '../types';
import type {
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  MeResponse,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

async function request<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw err;
  }

  return res.json() as Promise<ApiResponse<T>>;
}

async function rawRequest<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

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
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET' }, token),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token),

  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, token),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE' }, token),
};

// ── Auth ──────────────────────────────────────────────────────────────────────

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
    rawRequest<RegisterResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginPayload) =>
    rawRequest<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (data: RefreshTokenPayload) =>
    rawRequest<RefreshTokenResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify(data) }),

  getMe: (token: string) =>
    rawRequest<MeResponse>('/auth/me', { method: 'GET' }, token),
};

// ── Mentor Onboarding ─────────────────────────────────────────────────────────

export interface CreateMentorProfilePayload {
  fullName: string;
  title: string;
  company?: string;
  bio?: string;
  experience?: string;
  areasOfExpertise?: string[];
}

export interface UpdateMentorProfilePayload {
  title?: string;
  company?: string;
  bio?: string;
  experience?: string;
  areasOfExpertise?: string[];
}

export interface AddSkillPayload {
  skillId: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface UpdateSkillPayload {
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface UpdateAvailabilityPayload {
  availability: Record<string, unknown>;
}

export interface SubmitOnboardingPayload {
  confirmed: boolean;
}

export const mentorApi = {
  createProfile: (token: string, data: CreateMentorProfilePayload) =>
    apiClient.post<MentorProfile>('/mentor/applications', data, token),

  getMyProfile: (token: string) =>
    apiClient.get<MentorProfile>('/mentor/applications/me', token),

  updateProfile: (token: string, data: UpdateMentorProfilePayload) =>
    apiClient.patch<MentorProfile>('/mentor/applications/me', data, token),

  addSkill: (token: string, data: AddSkillPayload) =>
    apiClient.post<UserSkill>('/mentor/applications/me/skills', data, token),

  updateSkill: (token: string, skillId: string, data: UpdateSkillPayload) =>
    apiClient.patch<UserSkill>(`/mentor/applications/me/skills/${skillId}`, data, token),

  removeSkill: (token: string, skillId: string) =>
    apiClient.delete<{ message: string }>(`/mentor/applications/me/skills/${skillId}`, token),

  updateAvailability: (token: string, data: UpdateAvailabilityPayload) =>
    apiClient.patch<MentorProfile>('/mentor/applications/me/availability', data, token),

  submitOnboarding: (token: string, data: SubmitOnboardingPayload) =>
    apiClient.post<MentorProfile>('/mentor/applications/me/submit', data, token),
};
