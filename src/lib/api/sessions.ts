import type { MentorshipSession } from '../types';
import { apiClient } from './http';

export const sessionsApi = {
  list: (mentorshipId: string) =>
    apiClient.get<MentorshipSession[]>(`/mentorships/${mentorshipId}/sessions`),
};
