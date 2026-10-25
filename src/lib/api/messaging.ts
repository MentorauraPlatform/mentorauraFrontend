import { apiClient, rawRequest } from './http';

export interface ParticipantSummary {
  id: string;
  email: string;
  role: string;
  isMentor: boolean;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  title: string | null;
  company: string | null;
}

export interface ConversationSummary {
  id: string;
  mentorshipId: string | null;
  mentorship: {
    id: string;
    status: string;
    planTitle?: string;
  } | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  otherParticipant: ParticipantSummary;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    isRead: boolean;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface PaginatedMessagesResponse {
  data: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const messagingApi = {
  getConversations: () =>
    apiClient.get<ConversationSummary[]>('/conversations'),

  getConversation: (conversationId: string) =>
    apiClient.get<ConversationSummary>(`/conversations/${conversationId}`),

  getMessages: (conversationId: string, cursor?: string, limit = 30) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', String(limit));
    return rawRequest<PaginatedMessagesResponse>(
      `/conversations/${conversationId}/messages?${params.toString()}`,
      { method: 'GET' }
    );
  },

  sendMessage: (conversationId: string, content: string) =>
    apiClient.post<ChatMessage>(`/conversations/${conversationId}/messages`, {
      content,
    }),

  markAsRead: (conversationId: string, messageIds?: string[]) =>
    apiClient.patch<{ count: number }>(`/conversations/${conversationId}/read`, {
      messageIds,
    }),

  getOrCreateForMentorship: (mentorshipId: string) =>
    apiClient.post<ConversationSummary>(
      `/conversations/mentorship/${mentorshipId}`
    ),

  getOrCreateDirect: (targetUserId: string) =>
    apiClient.post<ConversationSummary>(
      `/conversations/direct/${targetUserId}`
    ),

  getUnreadCount: () =>
    apiClient.get<{ unreadCount: number }>('/messages/unread-count'),
};
