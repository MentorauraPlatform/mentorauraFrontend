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
import { PhoneCall, Video, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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
  const [quota, setQuota] = useState<{
    status: string;
    isIntro: boolean;
    totalSessionsAllowed: number;
    sessionsBooked: number;
    sessionsRemaining: number;
    canBook: boolean;
    planTitle: string;
  } | null>(null);
  const [loadingQuota, setLoadingQuota] = useState(false);

  useEffect(() => {
    if (!selectedMentorshipId) {
      setQuota(null);
      return;
    }

    void (async () => {
      try {
        setLoadingQuota(true);
        const res = await schedulingApi.getBookingQuota(selectedMentorshipId);
        const data = (res.data as any)?.data || res.data;
        setQuota(data);
      } catch (err) {
        console.error('Failed to load quota:', err);
      } finally {
        setLoadingQuota(false);
      }
    })();
  }, [selectedMentorshipId]);

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
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
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

              {loadingQuota && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                  <span>Checking plan session quota...</span>
                </div>
              )}

              {quota && quota.isIntro && (
                quota.canBook ? (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs">
                    <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Complimentary Intro Call (Free): </span>
                      This 1 free introductory call is included with your accepted application. Pick a slot that fits your schedule to meet your mentor.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Intro Call Already Booked</p>
                      <p>
                        You have already booked your complimentary intro call for this mentorship. Once completed, activate your plan to book recurring mentorship sessions.
                      </p>
                    </div>
                  </div>
                )
              )}

              {quota && !quota.isIntro && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  quota.canBook
                    ? 'bg-orange-50/40 border-orange-200/80'
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Plan Allowance: {quota.totalSessionsAllowed} {quota.totalSessionsAllowed === 1 ? 'session' : 'sessions'} / month</span>
                    </span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-xs ${
                      quota.sessionsRemaining > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {quota.sessionsRemaining} of {quota.totalSessionsAllowed} sessions remaining
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {quota.canBook
                      ? `The number of sessions you can book is determined by your ${quota.planTitle} plan. You have booked ${quota.sessionsBooked} session(s) this month.`
                      : `You have reached the maximum number of sessions allowed (${quota.totalSessionsAllowed}/${quota.totalSessionsAllowed}) for your ${quota.planTitle} plan this month.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedMentorship && selectedMentorshipId && (quota ? quota.canBook : true) && (
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
              disabled={!selectedMentorshipId || !selectedSlot || submitting || (quota ? !quota.canBook : false)}
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
