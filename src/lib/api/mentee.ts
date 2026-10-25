import type { MenteeProfile, Availability, UserSkillSummary } from '../types';
import { apiClient } from './http';
import type { UpdateSkillPayload } from './mentor';

export interface AddMenteeSkillPayload {
  name: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface CreateMenteeProfilePayload {
  fullName: string;
  avatarUrl?: string;
  headline?: string;
}

export type UpdateMenteeProfilePayload = Partial<CreateMenteeProfilePayload>;

export interface UpdateMenteeExperiencePayload {
  currentRole?: string;
  educationBackground?: string;
  yearsOfExperience?: number;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export const menteeApi = {
  createProfile: (data: CreateMenteeProfilePayload) =>
    apiClient.post<MenteeProfile>('/mentee/onboarding', data),

  getMyProfile: () =>
    apiClient.get<MenteeProfile>('/mentee/onboarding/me'),

  updateProfile: (data: UpdateMenteeProfilePayload) =>
    apiClient.patch<MenteeProfile>('/mentee/onboarding/me', data),

  updateInterests: (data: { interests: string[] }) =>
    apiClient.patch<MenteeProfile>('/mentee/onboarding/me/interests', data),

  updateGoals: (data: { goals: string[] }) =>
    apiClient.patch<MenteeProfile>('/mentee/onboarding/me/goals', data),

  updateExperience: (data: UpdateMenteeExperiencePayload) =>
    apiClient.patch<MenteeProfile>('/mentee/onboarding/me/experience', data),

  updateAvailability: (data: { availability: Availability }) =>
    apiClient.patch<MenteeProfile>('/mentee/onboarding/me/availability', data),

  addSkill: (data: AddMenteeSkillPayload) =>
    apiClient.post<UserSkillSummary>('/mentee/onboarding/me/skills', data),

  updateSkill: (skillId: string, data: UpdateSkillPayload) =>
    apiClient.patch<UserSkillSummary>(`/mentee/onboarding/me/skills/${skillId}`, data),

  removeSkill: (skillId: string) =>
    apiClient.delete<{ message: string }>(`/mentee/onboarding/me/skills/${skillId}`),

  submitOnboarding: (data: { confirmed: boolean }) =>
    apiClient.post<MenteeProfile>('/mentee/onboarding/me/submit', data),
};
