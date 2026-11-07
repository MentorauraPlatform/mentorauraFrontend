'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { mentorshipsApi, sessionsApi } from '@/lib/api/client';
import type { Mentorship, MentorshipSession } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { MenteeDashboardLayout } from '@/components/layout/MenteeDashboardLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { DisputeModal } from '@/components/modals/DisputeModal';
import { Calendar, PhoneCall, Video, CheckCircle2 } from 'lucide-react';

export default function MentorshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('menteeMentorships');
  const { user, isLoading: authLoading } = useAuth();
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const [mentorshipRes, sessionsRes] = await Promise.all([
          mentorshipsApi.getMentorship(id),
          sessionsApi.list(id),
        ]);
        setMentorship(mentorshipRes.data);
        const sessionsList: MentorshipSession[] = Array.isArray(sessionsRes.data)
          ? sessionsRes.data
          : Array.isArray((sessionsRes.data as any)?.data)
          ? (sessionsRes.data as any).data
          : [];
        setSessions(sessionsList);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || t('failedToLoad'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router, id, t]);

  return (
    <MenteeDashboardLayout
      activeTab="mentors"
      activeTabTitle={mentorship?.plan?.title || t('myMentorshipsTitle')}
    >
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingState message={t('loadingMentorships')} />
        </div>
      ) : error || !mentorship ? (
        <div className="py-12 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">{t('failedToLoad')}</h2>
            <p className="text-xs text-red-600">{error || t('failedToLoad')}</p>
            <button
              onClick={() => router.push('/mentee/dashboard/mentorships')}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700"
            >
              {t('backToMentorships') || 'Back to Mentorships'}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mentorship.plan?.title || t('planFallback')}
              </h1>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-nowrap shrink-0 ${
                  String(mentorship.status) === 'INTRO'
                    ? 'bg-blue-100 text-blue-800'
                    : String(mentorship.status) === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : String(mentorship.status) === 'PAUSED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : String(mentorship.status) === 'COMPLETED'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {mentorship.status}
              </span>
            </div>

            {String(mentorship.status) === 'INTRO' && (
              <div className="flex flex-wrap items-center gap-2">
                {sessions.length === 0 && (
                  <button
                    onClick={() => router.push(`/mentee/dashboard/bookings/new?mentorshipId=${mentorship.id}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all text-sm whitespace-nowrap flex-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    {t('bookFreeIntroCall')}
                  </button>
                )}
                <button
                  onClick={() => router.push(`/mentee/dashboard/mentorships/${mentorship.id}/checkout`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all text-sm whitespace-nowrap flex-nowrap shrink-0"
                >
                  {t('activatePlan')}
                </button>
              </div>
            )}

            {String(mentorship.status) === 'ACTIVE' && (
              <button
                onClick={() => router.push(`/mentee/dashboard/bookings/new?mentorshipId=${mentorship.id}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-green-600/20 transition-all text-sm whitespace-nowrap flex-nowrap shrink-0"
              >
                {t('bookSession')}
              </button>
            )}
          </div>

          {String(mentorship.status) === 'INTRO' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 via-amber-50/40 to-orange-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {sessions.length === 0 ? t('freeIntroCallAvailable') : t('readyToActivateTitle')}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 max-w-xl">
                    {sessions.length === 0
                      ? t('freeIntroCallDesc')
                      : t('readyToActivateDesc')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                {sessions.length === 0 && (
                  <button
                    onClick={() => router.push(`/mentee/dashboard/bookings/new?mentorshipId=${mentorship.id}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    {t('bookFreeIntroCall')}
                  </button>
                )}
                <button
                  onClick={() => router.push(`/mentee/dashboard/mentorships/${mentorship.id}/checkout`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-nowrap shrink-0 shadow-sm"
                >
                  {t('proceedToPaymentBtn')}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {t('mentorHeading')}
              </h3>
              <p className="mt-1 text-gray-900">{mentorship.mentor?.fullName || t('mentorFallback')}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {t('planDetailsHeading')}
              </h3>
              <p className="mt-1 text-gray-900">{mentorship.plan?.title || '—'}</p>
              <p className="text-sm text-gray-600">
                {mentorship.plan?.priceAmount} {mentorship.plan?.currency}
              </p>
            </div>

            {mentorship.startedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {t('startedAtHeading')}
                </h3>
                <p className="mt-1 text-gray-900">
                  {new Date(mentorship.startedAt).toLocaleString()}
                </p>
              </div>
            )}

            {mentorship.endedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {t('endedAtHeading')}
                </h3>
                <p className="mt-1 text-gray-900">
                  {new Date(mentorship.endedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                {t('sessionHistoryHeading')}
              </h3>
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500">{t('noSessionsScheduled')}</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(session.scheduledAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('sessionDurationAndStatus', {
                            min: session.durationMinutes,
                            status: session.status,
                          })}
                        </p>
                      </div>
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium whitespace-nowrap flex-nowrap shrink-0"
                        >
                          {t('joinSession')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => router.push('/mentee/dashboard/messages')}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 font-medium transition-colors whitespace-nowrap flex-nowrap shrink-0"
              >
                {t('goToMessagesBtn')}
              </button>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(true)}
                className="border border-red-200 text-red-600 hover:bg-red-50 px-5 py-3 rounded-xl font-medium text-sm transition-colors whitespace-nowrap flex-nowrap shrink-0"
              >
                {t('raiseDisputeBtn')}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {mentorship && (
        <DisputeModal
          isOpen={disputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          mentorshipId={mentorship.id}
          contextLabel={`${t('planFallback')}: ${mentorship.plan?.title || t('planFallback')}`}
        />
      )}
    </MenteeDashboardLayout>
  );
}
