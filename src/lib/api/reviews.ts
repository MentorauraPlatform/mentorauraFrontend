import { apiClient } from './http';
import type { ApiResponse } from './http';

export type RatingBreakdown = Record<'1' | '2' | '3' | '4' | '5', number>;

export type Review = {
  id: string;
  mentorshipId: string;
  reviewerId: string;
  mentorId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
};

export type ReviewStats = {
  avgRating: string;
  reviewCount: number;
  breakdown: RatingBreakdown;
};

export type MentorReviewsResult = ReviewStats & {
  items: PublicReview[];
  total: number;
  page: number;
  limit: number;
};

export type CreateReviewPayload = {
  rating: number;
  comment?: string;
};

export type ReviewQueryParams = {
  page?: number;
  limit?: number;
  rating?: number;
};

function toQuery(params?: ReviewQueryParams): string {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.rating) q.set('rating', String(params.rating));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const reviewsApi = {
  createReview: (mentorshipId: string, payload: CreateReviewPayload) =>
    apiClient.post<Review>(`/mentorships/${mentorshipId}/reviews`, payload) as Promise<
      ApiResponse<Review> & { mentorStats?: ReviewStats }
    >,

  getMentorshipReview: (mentorshipId: string) =>
    apiClient.get<Review | null>(`/mentorships/${mentorshipId}/review`),

  getMentorReviews: (mentorId: string, params?: ReviewQueryParams) =>
    apiClient.get<MentorReviewsResult>(
      `/mentors/${encodeURIComponent(mentorId)}/reviews${toQuery(params)}`,
    ),

  getMyReceivedReviews: (params?: ReviewQueryParams) =>
    apiClient.get<MentorReviewsResult>(`/mentor/reviews${toQuery(params)}`),
};