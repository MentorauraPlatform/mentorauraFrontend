import { apiClient } from './http';

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
