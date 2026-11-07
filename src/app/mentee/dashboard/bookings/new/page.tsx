'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mentorshipsApi, schedulingApi } from '@/lib/api/client';
import type { Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { MenteeDashboardLayout } from '@/components/layout/MenteeDashboardLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import TimeSlotPicker from '@/components/scheduling/TimeSlotPicker';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { PhoneCall } from 'lucide-react';

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('menteeBookingsNew');
  const tCommon = useTranslations('common');
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
        setError(t('bookingError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router, searchParams, t]);

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
      toast.success(t('bookingSuccess'));
      router.push('/mentee/dashboard');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || t('bookingError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MenteeDashboardLayout activeTab="sessions" activeTabTitle={t('title')}>
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingState message={tCommon('loading')} />
        </div>
      ) : error && !selectedMentorshipId ? (
        <div className="py-12 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t('title')}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('selectMentorLabel')}</label>
            <select
              value={selectedMentorshipId}
              onChange={(e) => setSelectedMentorshipId(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            >
              <option value="">{t('chooseMentorPlaceholder')}</option>
              {mentorships.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.plan?.title || 'Mentorship'} — {m.status}
                </option>
              ))}
            </select>
          </div>

          {selectedMentorship && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className={`px-2.5 py-1 rounded-full border font-semibold ${
                  selectedMentorship.status === 'INTRO'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}>
                  {selectedMentorship.status === 'INTRO' ? 'Free Intro Call' : 'Mentorship Session'}
                </span>
                <span>
                  {selectedMentorship.mentor?.fullName || 'Mentor'} • {selectedMentorship.plan?.title || 'Plan'}
                </span>
              </div>

              {selectedMentorship.status === 'INTRO' && (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Complimentary Intro Call (Free): </span>
                    This first session is included with your accepted application. Pick a slot that fits your schedule to meet your mentor.
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedMentorship && selectedMentorshipId && (
            <TimeSlotPicker mentorId={selectedMentorship.mentor?.id || ''} selectedSlotUtc={selectedSlot?.slotUtc ?? null} onSelectSlot={setSelectedSlot} />
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 whitespace-nowrap inline-flex items-center"
            >
              {tCommon('cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMentorshipId || !selectedSlot || submitting}
              className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50 whitespace-nowrap inline-flex items-center shrink-0"
            >
              <span>{submitting ? t('booking') : t('confirmBooking')}</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </MenteeDashboardLayout>
  );
}

export default function NewBookingPage() {
  const tCommon = useTranslations('common');
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
          <div className="text-sm text-gray-600">{tCommon('loading')}</div>
        </div>
      }
    >
      <NewBookingContent />
    </Suspense>
  );
}
