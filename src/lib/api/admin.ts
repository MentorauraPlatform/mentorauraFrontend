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
  status?: string;
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

// ── Financial Reporting ──────────────────────────────────────────────
export interface FinancialSummary {
  gmv: number;
  totalGmv?: number;
  platformCommission: number;
  totalPlatformRevenue?: number;
  mentorVolume: number;
  netMentorEarnings?: number;
  currency: string;
  totalTransactions: number;
  totalTransactionsCount?: number;
  successfulTransactions: number;
  successfulTransactionsCount?: number;
  pendingTransactionsCount?: number;
  failedTransactionsCount?: number;
  breakdown?: {
    byProvider: Record<string, { count: number; volume: number }>;
    byStatus: Record<string, number>;
  };
  monthlyTrends?: Array<{
    month: string;
    gmv: number;
    commission: number;
    transactions: number;
  }>;
  monthlyTrend?: Array<{
    month: string;
    gmv: number;
    platformRevenue: number;
    count: number;
  }>;
}

export interface FinancialTransaction {
  id: string;
  amount: number;
  currency: string;
  platformFee: number;
  mentorEarnings: number;
  status: string;
  provider: string;
  providerTxId?: string;
  providerReference?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  mentee?: {
    id: string;
    email: string;
    name: string;
  };
  mentor?: {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
  } | null;
  mentorship?: {
    id: string;
    mentorName: string;
    planTitle?: string;
  } | null;
  planTitle?: string;
}

// ── Payouts Management ───────────────────────────────────────────────
export interface AdminPayout {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  accountNumber: string;
  accountName?: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED';
  transactionRef?: string;
  rejectionReason?: string;
  processedAt?: string;
  createdAt: string;
  mentor: {
    id: string;
    fullName?: string;
    name?: string;
    title?: string;
    email: string;
  };
}

export interface PayoutStats {
  totalCount: number;
  pendingCount: number;
  pendingAmount: number;
  paidCount: number;
  paidAmount: number;
  rejectedCount: number;
  currency: string;
}

export interface MentorPayoutBalance {
  currency: string;
  mentorId: string;
  mentorName: string;
  totalGrossRevenue: number;
  totalNetEarned: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  availableBalance: number;
  minPayoutAmount: number;
  commissionPercent: number;
}

// ── Dispute Resolution ───────────────────────────────────────────────
export interface AdminDispute {
  id: string;
  title: string;
  description: string;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REFUNDED' | 'RESOLVED_REJECTED' | 'RESOLVED_RESCHEDULED' | 'CLOSED';
  resolutionNotes?: string;
  refundAmount?: number;
  resolvedAt?: string;
  createdAt: string;
  raisedBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
  targetUser?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  } | null;
  booking?: {
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
  } | null;
  mentorship?: {
    id: string;
    status: string;
    plan?: {
      title: string;
    };
    payments?: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
    }>;
  } | null;
}

export interface DisputeStats {
  total: number;
  open: number;
  underReview: number;
  resolvedRefunded: number;
  resolvedRejected: number;
  closed: number;
}

// ── Content Moderation ───────────────────────────────────────────────
export interface ModerationReport {
  id: string;
  reporterId: string;
  targetType: 'MESSAGE' | 'USER_PROFILE' | 'REVIEW';
  targetId: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'ACTION_TAKEN' | 'DISMISSED';
  actionTaken?: string;
  notes?: string;
  resolvedAt?: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  targetPreview?: {
    type: string;
    id: string;
    content?: string;
    createdAt?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    isActive?: boolean;
    headline?: string;
    bio?: string;
    rating?: number;
    comment?: string;
    sender?: { name: string; email: string; avatarUrl?: string };
    author?: { name: string; avatarUrl?: string };
  } | null;
}

export interface ModerationStats {
  total: number;
  pending: number;
  actionTaken: number;
  dismissed: number;
  breakdown: {
    messages: number;
    profiles: number;
    reviews: number;
  };
}

// ── Platform Settings & Categories ───────────────────────────────────
export interface PlatformSettingItem {
  value: string;
  description: string;
  updatedAt: string;
}

export interface PlatformCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  mentorCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Unified adminApi ─────────────────────────────────────────────────
export const adminApi = {
  // Existing Mentor applications & Users
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

  // 1. Financial & Revenue Reporting
  getFinancialSummary: () =>
    apiClient.get<FinancialSummary>('/admin/reporting/financial-summary'),

  getTransactions: (params?: { page?: number; limit?: number; status?: string; provider?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.provider) query.append('provider', params.provider);
    return apiClient.get<FinancialTransaction[]>(`/admin/reporting/transactions?${query.toString()}`);
  },

  // 2. Payout Management & Batch Approval
  getPayouts: (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    return apiClient.get<AdminPayout[]>(`/admin/payouts?${query.toString()}`);
  },

  getPayoutStats: () =>
    apiClient.get<PayoutStats>('/admin/payouts/stats'),

  getMentorPayoutBalance: () =>
    apiClient.get<MentorPayoutBalance>('/admin/payouts/balance'),

  approvePayout: (id: string) =>
    apiClient.patch<{ message: string; payout: AdminPayout }>(`/admin/payouts/${id}/approve`, {}),

  rejectPayout: (id: string, rejectionReason: string) =>
    apiClient.patch<{ message: string; payout: AdminPayout }>(`/admin/payouts/${id}/reject`, { rejectionReason }),

  batchApprovePayouts: (payoutIds: string[]) =>
    apiClient.post<{ message: string; approvedCount: number; totalAmountReleased: number; currency: string }>(
      '/admin/payouts/batch-approve',
      { payoutIds },
    ),

  // 3. Dispute Resolution Center
  getDisputes: (params?: { page?: number; limit?: number; status?: string; reason?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.reason) query.append('reason', params.reason);
    if (params?.search) query.append('search', params.search);
    return apiClient.get<AdminDispute[]>(`/admin/disputes?${query.toString()}`);
  },

  getDisputeStats: () =>
    apiClient.get<DisputeStats>('/admin/disputes/stats'),

  getDisputeById: (id: string) =>
    apiClient.get<AdminDispute>(`/admin/disputes/${id}`),

  resolveDispute: (id: string, data: { status: string; resolutionNotes: string; refundAmount?: number }) =>
    apiClient.patch<{ message: string; dispute: AdminDispute }>(`/admin/disputes/${id}/resolve`, data),

  createDispute: (data: {
    title: string;
    description: string;
    reason:
      | 'SESSION_NO_SHOW'
      | 'POOR_QUALITY'
      | 'UNAUTHORIZED_CHARGE'
      | 'MENTOR_UNRESPONSIVE'
      | 'SCHEDULING_CONFLICT'
      | 'OTHER';
    bookingId?: string;
    mentorshipId?: string;
    targetUserId?: string;
  }) => apiClient.post<AdminDispute>('/disputes', data),

  // 4. Content & Chat Moderation
  getModerationReports: (params?: { page?: number; limit?: number; status?: string; targetType?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.targetType) query.append('targetType', params.targetType);
    return apiClient.get<ModerationReport[]>(`/admin/moderation/reports?${query.toString()}`);
  },

  getModerationStats: () =>
    apiClient.get<ModerationStats>('/admin/moderation/stats'),

  takeModerationAction: (reportId: string, data: { action: 'DELETE_CONTENT' | 'SUSPEND_USER' | 'DISMISS' | 'WARN_USER'; notes?: string }) =>
    apiClient.post<{ message: string; status: string }>(`/admin/moderation/reports/${reportId}/action`, data),

  createReport: (data: {
    targetType: 'MESSAGE' | 'USER_PROFILE' | 'REVIEW';
    targetId: string;
    reason: string;
    details?: string;
  }) => apiClient.post<ModerationReport>('/moderation/reports', data),

  // 5. Platform Settings & Categories
  getSettings: () =>
    apiClient.get<Record<string, PlatformSettingItem>>('/admin/configuration'),

  updateSettings: (settings: Record<string, string>) =>
    apiClient.put<{ message: string; updated: Array<{ key: string; value: string }> }>('/admin/configuration', { settings }),

  getCategories: () =>
    apiClient.get<PlatformCategory[]>('/admin/configuration/categories'),

  createCategory: (data: { name: string; description?: string }) =>
    apiClient.post<PlatformCategory>('/admin/configuration/categories', data),

  updateCategory: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<PlatformCategory>(`/admin/configuration/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<{ message: string }>(`/admin/configuration/categories/${id}`),
};
