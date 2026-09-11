import { apiClient } from '@/lib/api/client';

export interface PlanItem {
  id: string;
  mentorId: string;
  title: string;
  description?: string;
  priceAmount: number;
  currency: string;
  sessionsPerMonth: number;
  isActive: boolean;
}

export interface MentorSkill {
  id: string;
  name: string;
  level: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface MentorCardData {
  id: string;
  userId: string;
  slug: string;
  fullName: string;
  title: string;
  company?: string;
  bio?: string;
  experience?: string;
  areasOfExpertise: string[];
  isVerified: boolean;
  startingPrice: number | null;
  currency: string;
  avgRating: string | null;
  reviewCount: number;
  skills: MentorSkill[];
  plansCount: number;
}

export interface MentorDetailData {
  id: string;
  userId: string;
  slug: string;
  fullName: string;
  title: string;
  company?: string;
  bio?: string;
  experience?: string;
  areasOfExpertise: string[];
  availability?: Record<string, unknown>;
  isVerified: boolean;
  avgRating: string | null;
  reviewCount: number;
  categories: CategoryItem[];
  skills: MentorSkill[];
  plans: PlanItem[];
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    reviewerName: string;
    reviewerAvatar?: string;
  }>;
}

export interface MentorSearchResponse {
  items: MentorCardData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePlanPayload {
  title: string;
  description?: string;
  priceAmount: number;
  currency: string;
  sessionsPerMonth?: number;
}

export interface UpdatePlanPayload {
  title?: string;
  description?: string;
  priceAmount?: number;
  currency?: string;
  sessionsPerMonth?: number;
  isActive?: boolean;
}

export const marketplaceService = {
  async searchMentors(params: {
    q?: string;
    category?: string;
    skill?: string;
    page?: number;
    limit?: number;
  }): Promise<MentorSearchResponse> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category) query.append('category', params.category);
    if (params.skill) query.append('skill', params.skill);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await apiClient.get<MentorSearchResponse>(`/mentors?${query.toString()}`);
    return res.data;
  },

  async getMentorProfile(slugOrId: string): Promise<MentorDetailData> {
    const res = await apiClient.get<MentorDetailData>(`/mentors/${slugOrId}`);
    return res.data;
  },

  async getCategories(): Promise<CategoryItem[]> {
    const res = await apiClient.get<CategoryItem[]>('/categories');
    return res.data;
  },

  async getSkills(): Promise<Array<{ id: string; name: string }>> {
    const res = await apiClient.get<Array<{ id: string; name: string }>>('/skills');
    return res.data;
  },

  async getFeaturedMentors(): Promise<MentorCardData[]> {
    const res = await apiClient.get<MentorCardData[]>('/discovery/featured');
    return res.data;
  },

  async getMyPlans(): Promise<PlanItem[]> {
    const res = await apiClient.get<PlanItem[]>('/mentor/plans');
    return res.data;
  },

  async createPlan(payload: CreatePlanPayload): Promise<PlanItem> {
    const res = await apiClient.post<PlanItem>('/mentor/plans', payload);
    return res.data;
  },

  async updatePlan(id: string, payload: UpdatePlanPayload): Promise<PlanItem> {
    const res = await apiClient.patch<PlanItem>(`/mentor/plans/${id}`, payload);
    return res.data;
  },

  async deletePlan(id: string): Promise<PlanItem> {
    const res = await apiClient.delete<PlanItem>(`/mentor/plans/${id}`);
    return res.data;
  },
};
