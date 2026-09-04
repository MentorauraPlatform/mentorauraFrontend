// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types — mirrors the NestJS domain model
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'mentee' | 'mentor' | 'admin' | 'super_admin';

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    isMentor: boolean;
  };
  tokens: AuthTokens;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    isMentor: boolean;
    fullName: string;
    avatarUrl: string | null;
  };
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  message: string;
  tokens: AuthTokens;
}

export interface MenteeProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  goals: string | null;
  interests: string[];
}

export interface MentorProfileSummary {
  id: string;
  fullName: string;
  title: string;
  company: string | null;
  bio: string | null;
  isVerified: boolean;
}

export interface UserSkillSummary {
  id: string;
  level: SkillLevel;
  skill: {
    id: string;
    name: string;
  };
}

export interface MeResponse {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  menteeProfile: MenteeProfile | null;
  mentorProfile: MentorProfileSummary | null;
  userSkills: UserSkillSummary[];
}

// ── Mentor ────────────────────────────────────────────────────────────────────
export type OnboardingStatus = 'INCOMPLETE' | 'PENDING' | 'COMPLETE';
export type MentorStatus = 'draft' | 'active' | 'suspended' | 'deactivated';

export interface TimeSlot {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
}

export interface Availability {
  timezone: string;
  slots: TimeSlot[];
}

export interface UserSkillSummary {
  id: string;
  userId: string;
  skillId: string;
  level: SkillLevel;
  skill: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MeResponse {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  menteeProfile: MenteeProfile | null;
  mentorProfile: MentorProfileSummary | null;
  userSkills: UserSkillSummary[];
}

// ── Mentor ────────────────────────────────────────────────────────────────────
export type OnboardingStatus = 'INCOMPLETE' | 'PENDING' | 'COMPLETE';
export type MentorStatus = 'draft' | 'active' | 'suspended' | 'deactivated';

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  level: SkillLevel;
  skill: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  company?: string;
  bio?: string;
  experience?: string;
  areasOfExpertise: string[];
  availability?: Availability;
  onboardingStatus: OnboardingStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    userSkills: UserSkill[];
  };
}

// ── Skills ────────────────────────────────────────────────────────────────────
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ── Marketplace ───────────────────────────────────────────────────────────────
export type PlanType = 'monthly' | 'quarterly' | 'custom';
export type SessionType = 'one_off' | 'plan_session';

export interface Plan {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  type: PlanType;
  price: number;
  currency: string;
  sessionsPerMonth: number;
  sessionDurationMinutes: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// ── Mentorship ────────────────────────────────────────────────────────────────
export type MentorshipStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Mentorship {
  id: string;
  menteeId: string;
  mentorId: string;
  planId?: string;
  status: MentorshipStatus;
  startedAt?: string;
  endsAt?: string;
  createdAt: string;
}

// ── Payments ──────────────────────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'card' | 'bank';

export interface Payment {
  id: string;
  reference: string;
  grossAmount: number;
  commissionAmount: number;
  mentorPayable: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayReference?: string;
  paidAt?: string;
  createdAt: string;
}

// ── Scheduling ────────────────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  mentorshipId: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  status: BookingStatus;
  createdAt: string;
}

// ── Messaging ─────────────────────────────────────────────────────────────────
export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: Attachment[];
  sentAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  mentorshipId: string;
  reviewerId: string;
  rating: number;          // 1–5
  comment?: string;
  createdAt: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
