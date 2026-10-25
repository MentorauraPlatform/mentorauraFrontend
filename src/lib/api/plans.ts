import type { PlanSummary } from '../types';
import { apiClient } from './http';

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
