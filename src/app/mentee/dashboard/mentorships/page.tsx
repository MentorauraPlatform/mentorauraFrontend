'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { applicationsApi, mentorshipsApi } from '@/lib/api/client';
import type { MentorshipApplication, Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { MenteeDashboardLayout } from '@/components/layout/MenteeDashboardLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { Calendar, PhoneCall, CheckCircle2, Video, RefreshCw, AlertCircle } from 'lucide-react';

type Tab = 'applications' | 'mentorships';

export default function MenteeMentorshipsPage() {
  const router = useRouter();
  const t = useTranslations('menteeMentorships');
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('applications');
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [applicationsRes, mentorshipsRes] = await Promise.allSettled([
        applicationsApi.getMyApplications(),
        mentorshipsApi.getMenteeMentorships(),
      ]);

      let loadedApps: MentorshipApplication[] = [];
      let loadedMentorships: Mentorship[] = [];

      if (applicationsRes.status === 'fulfilled') {
        const raw = applicationsRes.value?.data as unknown;
        loadedApps = Array.isArray(raw)
          ? (raw as MentorshipApplication[])
          : Array.isArray((raw as any)?.data)
          ? ((raw as any).data as MentorshipApplication[])
          : [];
        setApplications(loadedApps);
      }

      if (mentorshipsRes.status === 'fulfilled') {
        const raw = mentorshipsRes.value?.data as unknown;
        loadedMentorships = Array.isArray(raw)
          ? (raw as Mentorship[])
          : Array.isArray((raw as any)?.data)
          ? ((raw as any).data as Mentorship[])
          : [];
        setMentorships(loadedMentorships);
      }

      if (applicationsRes.status === 'rejected' && mentorshipsRes.status === 'rejected') {
        const err = applicationsRes.reason as { message?: string };
        setError(err?.message || t('failedToLoad'));
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    const isMentee =
      String(user.role ?? '').trim().toLowerCase() === 'mentee' ||
      !(user as unknown as { isMentor?: boolean })?.isMentor;

    if (!isMentee) {
      router.replace('/');
      return;
    }

    void loadData();
  }, [user, authLoading, router, loadData]);

  const handleWithdraw = async (id: string) => {
    if (!confirm(t('withdrawConfirm'))) return;
    try {
      await applicationsApi.withdraw(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || t('withdrawError'));
    }
  };

  return (
    <MenteeDashboardLayout activeTab="mentors" activeTabTitle={t('myMentorshipsTitle')}>
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingState message={t('loadingMentorships')} />
        </div>
      ) : error ? (
        <div className="py-12 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('failedToLoad')}</h2>
            <p className="text-xs text-gray-600">{error}</p>
            <button
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" /> {t('tryAgain')}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t('myMentorshipsTitle')}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('myMentorshipsSubtitle')}</p>
            </div>
            <button
              onClick={() => router.push('/mentee/dashboard/mentorships/plans')}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 font-bold text-sm transition-all shadow-sm w-fit"
            >
              {t('browsePlansBtn')}
            </button>
          </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('applications')}
              className={`flex-1 py-4 text-center font-bold text-sm transition-colors whitespace-nowrap flex-nowrap shrink-0 ${
                tab === 'applications'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/20'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('applicationsTab', { count: applications.length })}
            </button>
            <button
              onClick={() => setTab('mentorships')}
              className={`flex-1 py-4 text-center font-bold text-sm transition-colors whitespace-nowrap flex-nowrap shrink-0 ${
                tab === 'mentorships'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/20'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('mentorshipsTab', { count: mentorships.length })}
            </button>
          </div>

          <div className="p-6">
            {tab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-gray-600 text-sm">{t('noApplications')}</p>
                    <button
                      onClick={() => router.push('/mentors')}
                      className="text-orange-600 hover:underline text-xs font-bold"
                    >
                      {t('exploreMentorsBtn')} &rarr;
                    </button>
                  </div>
                ) : (
                  applications.map((app) => {
                    const matchingMentorship = mentorships.find(
                      (m) => m.mentorId === app.mentorId || m.id === app.mentorshipId,
                    );
                    const hasIntroBooking =
                      matchingMentorship?.bookings && matchingMentorship.bookings.length > 0;
                    const introBooking = hasIntroBooking ? matchingMentorship.bookings![0] : null;

                    return (
                      <div key={app.id} className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-gray-900">
                                {app.plan?.title || t('planFallback')}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                  app.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : app.status === 'ACCEPTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : app.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {t('mentorLabel', { name: app.mentor?.fullName || t('mentorFallback') })}
                            </p>
                            {app.message && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                &ldquo;{app.message}&rdquo;
                              </p>
                            )}
                            <p className="text-[11px] text-gray-400 mt-2">
                              {t('applied', { date: new Date(app.createdAt).toLocaleDateString() })}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {app.status === 'ACCEPTED' && (
                              <>
                                {matchingMentorship && !hasIntroBooking && (
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/mentee/dashboard/bookings/new?mentorshipId=${matchingMentorship.id}`,
                                      )
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    {t('bookFreeIntroCall')}
                                  </button>
                                )}
                                {matchingMentorship && (
                                  <button
                                    onClick={() =>
                                      router.push(`/mentee/dashboard/mentorships/${matchingMentorship.id}`)
                                    }
                                    className="border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                                  >
                                    {t('viewMentorship')}
                                  </button>
                                )}
                              </>
                            )}

                            {app.status === 'PENDING' && (
                              <button
                                onClick={() => handleWithdraw(app.id)}
                                className="text-red-600 hover:text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                              >
                                {t('withdraw')}
                              </button>
                            )}
                          </div>
                        </div>

                        {app.status === 'ACCEPTED' && matchingMentorship && (
                          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                {hasIntroBooking && introBooking
                                  ? t('introCallScheduled', {
                                      date: new Date(introBooking.scheduledAt).toLocaleString(),
                                    })
                                  : t('freeIntroCallDesc')}
                              </span>
                            </div>
                            {hasIntroBooking && introBooking?.meetingLink && (
                              <a
                                href={introBooking.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition"
                              >
                                <Video className="w-3.5 h-3.5" />
                                {t('joinSession')}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {tab === 'mentorships' && (
              <div className="space-y-4">
                {mentorships.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-gray-600 text-sm">{t('noActiveMentorships')}</p>
                    <button
                      onClick={() => setTab('applications')}
                      className="text-orange-600 hover:underline text-xs font-bold"
                    >
                      Check pending applications &rarr;
                    </button>
                  </div>
                ) : (
                  mentorships.map((mentorship) => {
                    const hasBookings =
                      mentorship.bookings && mentorship.bookings.length > 0;
                    const latestBooking = hasBookings ? mentorship.bookings![0] : null;

                    return (
                      <div
                        key={mentorship.id}
                        className="border border-gray-200 rounded-2xl p-5 hover:border-orange-300 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              router.push(`/mentee/dashboard/mentorships/${mentorship.id}`)
                            }
                          >
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-gray-900 hover:text-orange-600 transition-colors">
                                {mentorship.plan?.title || t('planFallback')}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
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
                            <p className="text-xs text-gray-600 mt-1">
                              {t('mentorLabel', {
                                name: mentorship.mentor?.fullName || t('mentorFallback'),
                              })}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-2">
                              {t('statusLabel', { status: mentorship.status })}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {String(mentorship.status) === 'INTRO' && !hasBookings && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/mentee/dashboard/bookings/new?mentorshipId=${mentorship.id}`,
                                  )
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                {t('bookFreeIntroCall')}
                              </button>
                            )}

                            {String(mentorship.status) === 'ACTIVE' && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/mentee/dashboard/bookings/new?mentorshipId=${mentorship.id}`,
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                {t('bookSession')}
                              </button>
                            )}

                            {String(mentorship.status) === 'INTRO' && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/mentee/dashboard/mentorships/${mentorship.id}/checkout`,
                                  )
                                }
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                {t('activatePlan')}
                              </button>
                            )}

                            <button
                              onClick={() =>
                                router.push(`/mentee/dashboard/mentorships/${mentorship.id}`)
                              }
                              className="border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                            >
                              {t('viewDetailsBtn')}
                            </button>
                          </div>
                        </div>

                        {/* If in INTRO and booking is made, display meeting banner */}
                        {String(mentorship.status) === 'INTRO' && hasBookings && latestBooking && (
                          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
                            <div className="flex items-center gap-2">
                              <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                              <span>
                                {t('introCallScheduled', {
                                  date: new Date(latestBooking.scheduledAt).toLocaleString(),
                                })}
                              </span>
                            </div>
                            {latestBooking.meetingLink && (
                              <a
                                href={latestBooking.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition"
                              >
                                <Video className="w-3.5 h-3.5" />
                                {t('joinSession')}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </MenteeDashboardLayout>
  );
}
