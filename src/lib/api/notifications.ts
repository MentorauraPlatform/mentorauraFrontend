import { apiClient } from './http';

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'BOOKING' | 'PAYMENT' | 'MESSAGE' | 'MENTORSHIP' | 'SYSTEM';
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.unreadOnly !== undefined) query.append('unreadOnly', String(params.unreadOnly));
    const qs = query.toString();
    return apiClient.get<NotificationItem[]>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  getUnreadCount: () =>
    apiClient.get<{ unreadCount: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.patch<NotificationItem>(`/notifications/${id}/read`, {}),

  markAllAsRead: () =>
    apiClient.patch<{ updatedCount: number }>('/notifications/read-all', {}),
};
