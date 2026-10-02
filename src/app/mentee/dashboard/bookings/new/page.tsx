'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applicationsApi, mentorshipsApi, schedulingApi } from '@/lib/api/client';
import type { Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import TimeSlotPicker from '@/components/scheduling/TimeSlotPicker';
import { toast } from 'sonner';

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [selectedMentorshipId, setSelectedMentorshipId] = useState(searchParams.get('mentorshipId') || '');
  const [selectedSlot, setSelectedSlot] = useState<{ slotUtc: string; displayTime: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const res = await mentorshipsApi.getMenteeMentorships();
        const items = (res.data as Mentorship[]).filter((m) => m.status === 'INTRO' || m.status === 'ACTIVE');
        setMentorships(items);
        if (searchParams.get('mentorshipId')) {
          setSelectedMentorshipId(searchParams.get('mentorshipId') || '');
        }
      } catch {
        setError('Failed to load mentorships');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router, searchParams]);

  const selectedMentorship = mentorships.find((m) => m.id === selectedMentorshipId) ?? null;

  const handleConfirm = async () => {
    if (!selectedMentorshipId || !selectedSlot) return;
    try {
      setSubmitting(true);
      setError(null);
      await schedulingApi.createBooking({
        mentorshipId: selectedMentorshipId,
        scheduledAt: selectedSlot.slotUtc,
        durationMinutes: 60,
      });
      toast.success('Booking confirmed');
      router.push('/mentee/dashboard');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-sm text-gray-600">Loading mentorships...</div>
      </div>
    );
  }

  if (error && !selectedMentorshipId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book a Session</h1>
          <p className="text-sm text-gray-600">Choose a mentorship and an available slot to book.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mentorship</label>
            <select
              value={selectedMentorshipId}
              onChange={(e) => setSelectedMentorshipId(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            >
              <option value="">Select mentorship</option>
              {mentorships.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.plan?.title || 'Mentorship'} — {m.status}
                </option>
              ))}
            </select>
          </div>

          {selectedMentorship && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="px-2.5 py-1 rounded-full border border-gray-200 font-semibold">
                {selectedMentorship.status === 'INTRO' ? 'Free Intro Call' : 'Subscription Session'}
              </span>
              <span>
                {selectedMentorship.mentor?.fullName || 'Mentor'} • {selectedMentorship.plan?.title || 'Plan'}
              </span>
            </div>
          )}

          {selectedMentorship && selectedMentorshipId && (
            <TimeSlotPicker mentorId={selectedMentorship.mentor?.id || ''} selectedSlotUtc={selectedSlot?.slotUtc ?? null} onSelectSlot={setSelectedSlot} />
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => router.back()} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMentorshipId || !selectedSlot || submitting}
              className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
