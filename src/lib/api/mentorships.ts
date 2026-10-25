import type { Mentorship } from '../types';
import { apiClient } from './http';

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
