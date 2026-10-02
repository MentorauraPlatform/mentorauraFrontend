/**
 * Centralized API client for Mentoraura frontend.
 *
 * All API calls go through this file.
 * The frontend NEVER makes business decisions — it sends data
 * to the NestJS API and renders what comes back.
 */

import type { MentorProfile, UserSkill, PlanSummary, MentorshipApplication, Mentorship, MentorshipSession } from '../types';
import type {
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  MeResponse,
} from '../types';

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

function getEndpointUrl(path: string): string {
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

async function attemptTokenRefresh(): Promise<boolean> {
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

async function request<T>(
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
    credentials: 'include', // ✅ Same-site cookies sent automatically to Next.js API routes
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

async function rawRequest<T>(
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
    credentials: 'include', // ✅ Same-site cookies sent automatically to Next.js API routes
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

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
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
    rawRequest<RegisterResponse>('/auth/register', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),

  login: (data: LoginPayload) =>
    rawRequest<LoginResponse>('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),

  refreshToken: (data: RefreshTokenPayload) =>
    rawRequest<RefreshTokenResponse>('/auth/refresh', { 
      method: 'POST', 
      body: JSON.stringify(data) 
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
  availability: {
    timezone: string;
    slots: Array<{
      day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
      startTime: string;
      endTime: string;
    }>;
  };
}

export interface SubmitOnboardingPayload {
  confirmed: boolean;
}

// ✅ Mentor API - All requests use credentials: 'include' via apiClient

// ... existing code ...

export const mentorApi = {
  createProfile: (data: CreateMentorProfilePayload) =>
    apiClient.post<MentorProfile>('/mentor/applications', data),

  getMyProfile: () =>
    apiClient.get<MentorProfile>('/mentor/applications/me'),

  updateProfile: (data: UpdateMentorProfilePayload) =>
    apiClient.patch<MentorProfile>('/mentor/applications/me', data),

  addSkill: (data: AddSkillPayload) =>
    apiClient.post<UserSkill>('/mentor/applications/me/skills', data),

  updateSkill: (skillId: string, data: UpdateSkillPayload) =>
    apiClient.patch<UserSkill>(`/mentor/applications/me/skills/${skillId}`, data),

  removeSkill: (skillId: string) =>
    apiClient.delete<{ message: string }>(`/mentor/applications/me/skills/${skillId}`),

  updateAvailability: (data: UpdateAvailabilityPayload) =>
    apiClient.patch<MentorProfile>('/mentor/applications/me/availability', data),

  submitOnboarding: (data: SubmitOnboardingPayload) =>
    apiClient.post<MentorProfile>('/mentor/applications/me/submit', data),
};

// ── Plans ─────────────────────────────────────────────────────────────────────

export interface PlanDetail {
  id: string;
  mentorId: string;
  title: string;
  description?: string;
  priceAmount: number;
  currency: string;
  isActive: boolean;
  mentor?: {
    id: string;
    fullName: string;
    title?: string;
    company?: string;
  };
}

export const plansApi = {
  list: () =>
    apiClient.get<PlanSummary[]>('/plans'),
  getMentorPlans: (mentorId: string) =>
    apiClient.get<PlanSummary[]>(`/mentors/${mentorId}/plans`),
};

// ── Mentorship Applications ────────────────────────────────────────────────────

export interface CreateApplicationPayload {
  planId: string;
  message?: string;
}

export const applicationsApi = {
  apply: (data: CreateApplicationPayload) =>
    apiClient.post<MentorshipApplication>('/mentorships/apply', data),

  getMyApplications: () =>
    apiClient.get<MentorshipApplication[]>('/mentorships/applications/mine'),

  getMentorApplications: () =>
    apiClient.get<MentorshipApplication[]>('/mentor/applications'),

  accept: (id: string) =>
    apiClient.patch<MentorshipApplication>(`/mentorships/applications/${id}/accept`, {}),

  reject: (id: string) =>
    apiClient.patch<MentorshipApplication>(`/mentorships/applications/${id}/reject`, {}),

  withdraw: (id: string) =>
    apiClient.delete<MentorshipApplication>(`/mentorships/applications/${id}`),
};

// ── Mentorship Lifecycle ───────────────────────────────────────────────────────

export const mentorshipsApi = {
  getMenteeMentorships: () =>
    apiClient.get<Mentorship[]>('/mentorships/mine'),

  getMentorMentorships: () =>
    apiClient.get<Mentorship[]>('/mentor/mentorships'),

  getMentorship: (id: string) =>
    apiClient.get<Mentorship>(`/mentorships/${id}`),

  activate: (id: string) =>
    apiClient.patch<Mentorship>(`/mentorships/${id}/activate`, {}),

  complete: (id: string) =>
    apiClient.patch<Mentorship>(`/mentorships/${id}/complete`, {}),

  cancel: (id: string, reason?: string) =>
    apiClient.patch<Mentorship>(`/mentorships/${id}/cancel`, { reason }),

  pause: (id: string) =>
    apiClient.patch<Mentorship>(`/mentorships/${id}/pause`, {}),

  resume: (id: string) =>
    apiClient.post<Mentorship>(`/mentorships/${id}/resume`, {}),
};

export const sessionsApi = {
  list: (mentorshipId: string) =>
    apiClient.get<MentorshipSession[]>(`/mentorships/${mentorshipId}/sessions`),
};

// ── Admin Vetting & Management ───────────────────────────────────────────────

export interface AdminMentorApplication {
  id: string;
  userId: string;
  fullName: string;
  slug?: string;
  title: string;
  headline?: string;
  company?: string;
  bio?: string;
  experience?: string;
  yearsOfExperience?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  idDocumentUrl?: string;
  cvUrl?: string;
  areasOfExpertise: string[];
  onboardingStatus: string;
  isVerified: boolean;
  rejectionReason?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    createdAt: string;
    userSkills?: Array<{ id: string; level: string; skill: { name: string } }>;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  role: string;
  isMentor: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  menteeProfile?: { fullName: string; avatarUrl?: string };
  mentorProfile?: { fullName: string; isVerified: boolean; onboardingStatus: string };
}

export const adminApi = {
  getMentorApplications: (params?: { status?: string; q?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.q) query.append('q', params.q);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiClient.get<AdminMentorApplication[]>(
      `/admin/mentor-applications?${query.toString()}`,
    );
  },

  getMentorApplicationDetail: (id: string) =>
    apiClient.get<AdminMentorApplication>(`/admin/mentor-applications/${id}`),

  approveMentorApplication: (id: string) =>
    apiClient.patch<AdminMentorApplication>(`/admin/mentor-applications/${id}/approve`, {}),

  rejectMentorApplication: (id: string, rejectionReason: string) =>
    apiClient.patch<AdminMentorApplication>(`/admin/mentor-applications/${id}/reject`, { rejectionReason }),

  getUsers: (params?: { role?: string; q?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.q) query.append('q', params.q);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiClient.get<AdminUserItem[]>(
      `/admin/users?${query.toString()}`,
    );
  },

  inviteAdmin: (data: { email: string; role?: 'ADMIN' | 'SUPER_ADMIN'; password?: string; fullName?: string }) =>
    apiClient.post<AdminUserItem & { inviteToken?: string }>('/admin/users/invite', data),

  toggleUserActive: (id: string, isActive: boolean) =>
    apiClient.patch<AdminUserItem>(`/admin/users/${id}/active`, { isActive }),

  acceptAdminInvite: (data: { token: string; password: string; fullName?: string }) =>
    apiClient.post<{
      message: string;
      user: { id: string; email: string; role: string; fullName: string };
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/admin/accept-invite', data),
};
