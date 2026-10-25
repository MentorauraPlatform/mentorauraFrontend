import type { MentorProfile, UserSkill } from '../types';
import { apiClient } from './http';

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
