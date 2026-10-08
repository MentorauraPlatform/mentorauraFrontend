import { apiClient } from './http';

export interface SlotItem {
  slotUtc: string;
  displayTime: string;
}

export interface BlackoutDateItem {
  id: string;
  date: string;
  reason?: string;
  createdAt: string;
}

export const schedulingApi = {
  getSlots: (mentorId: string, from: string, to: string, timezone: string) =>
    apiClient.get<SlotItem[]>(
      `/mentors/${mentorId}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&timezone=${encodeURIComponent(timezone)}`
    ),

  createBooking: (data: { mentorshipId: string; scheduledAt: string; durationMinutes?: number }) =>
    apiClient.post<unknown>('/bookings', data),

  getMyBookings: () =>
    apiClient.get<unknown[]>('/bookings/mine'),

  getMentorBookings: () =>
    apiClient.get<unknown[]>('/mentor/bookings'),

  getBooking: (id: string) =>
    apiClient.get<unknown>(`/bookings/${id}`),

  cancelBooking: (id: string, reason?: string) =>
    apiClient.patch<unknown>(`/bookings/${id}/cancel`, { reason }),

  getAvailability: () =>
    apiClient.get<Record<string, unknown>>('/mentor/availability'),

  updateAvailability: (availability: unknown) =>
    apiClient.put<Record<string, unknown>>('/mentor/availability', availability),

  listBlackouts: () =>
    apiClient.get<BlackoutDateItem[]>('/mentor/blackouts'),

  createBlackout: (data: { date: string; reason?: string }) =>
    apiClient.post<BlackoutDateItem>('/mentor/blackouts', data),

  deleteBlackout: (id: string) =>
    apiClient.delete<{ id: string }>(`/mentor/blackouts/${id}`),
};
