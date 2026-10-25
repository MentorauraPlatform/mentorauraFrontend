import type { MentorshipApplication } from '../types';
import { apiClient } from './http';

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
