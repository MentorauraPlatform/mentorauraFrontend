'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { applicationsApi, plansApi, mentorshipsApi } from '@/lib/api/client';
import { marketplaceService, MentorDetailData } from '@/services/marketplace.service';
import type { PlanSummary, MentorshipApplication, Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

function ApplyContent() {
  const router = useRouter();
  const t = useTranslations('menteeMentorships');
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [planId, setPlanId] = useState(searchParams.get('planId') || '');
  const [mentorId, setMentorId] = useState(searchParams.get('mentorId') || '');
  const [mentor, setMentor] = useState<MentorDetailData | null>(null);
  const [message, setMessage] = useState('');
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [myApplications, setMyApplications] = useState<MentorshipApplication[]>([]);
  const [myMentorships, setMyMentorships] = useState<Mentorship[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth?mode=login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const pPlanId = searchParams.get('planId');
    const pMentorId = searchParams.get('mentorId');
    if (pPlanId) setPlanId(pPlanId);
    if (pMentorId) setMentorId(pMentorId);
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      try {
        setLoadingPlans(true);
        const pMentorId = searchParams.get('mentorId');
        const pPlanId = searchParams.get('planId');

        // 1. If mentorId is available, load that specific mentor and their plans
        if (pMentorId) {
          const [mentorRes, plansRes, appsRes, mentorshipsRes] = await Promise.all([
            marketplaceService.getMentorProfile(pMentorId).catch(() => null),
            plansApi.getMentorPlans(pMentorId).catch(() => null),
            applicationsApi.getMyApplications().catch(() => null),
            mentorshipsApi.getMenteeMentorships().catch(() => null),
          ]);

          if (appsRes?.data) {
            const rawApps = appsRes.data as unknown;
            const appList = Array.isArray(rawApps)
              ? (rawApps as MentorshipApplication[])
              : Array.isArray((rawApps as any)?.data)
              ? ((rawApps as any).data as MentorshipApplication[])
              : [];
            setMyApplications(appList);
          }

          if (mentorshipsRes?.data) {
            const rawM = mentorshipsRes.data as unknown;
            const mList = Array.isArray(rawM)
              ? (rawM as Mentorship[])
              : Array.isArray((rawM as any)?.data)
              ? ((rawM as any).data as Mentorship[])
              : [];
            setMyMentorships(mList);
          }

          if (mentorRes) {
            setMentor(mentorRes);
          }

          let mentorPlansList: PlanSummary[] = [];
          if (plansRes) {
            const raw = plansRes as unknown;
            if (Array.isArray(raw)) {
              mentorPlansList = raw as PlanSummary[];
            } else if (typeof raw === 'object' && raw !== null) {
              const record = raw as Record<string, unknown>;
              if (Array.isArray(record.data)) {
                mentorPlansList = record.data as PlanSummary[];
              } else if (typeof record.data === 'object' && record.data !== null) {
                const nested = record.data as Record<string, unknown>;
                if (Array.isArray(nested.data)) {
                  mentorPlansList = nested.data as PlanSummary[];
                }
              }
            }
          }

          // Fallback to mentor profile's embedded plans if endpoint returned empty
          if (mentorPlansList.length === 0 && mentorRes?.plans?.length) {
            mentorPlansList = mentorRes.plans.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              priceAmount: p.priceAmount,
              currency: p.currency,
              isActive: p.isActive,
              mentorId: pMentorId,
            }));
          }

          setPlans(mentorPlansList);
          return;
        }

        // 2. If only planId is available, fetch all plans and filter to the selected plan's mentor
        const [response, appsRes, mentorshipsRes] = await Promise.all([
          plansApi.list().catch(() => null),
          applicationsApi.getMyApplications().catch(() => null),
          mentorshipsApi.getMenteeMentorships().catch(() => null),
        ]);

        if (appsRes?.data) {
          const rawApps = appsRes.data as unknown;
          const appList = Array.isArray(rawApps)
            ? (rawApps as MentorshipApplication[])
            : Array.isArray((rawApps as any)?.data)
            ? ((rawApps as any).data as MentorshipApplication[])
            : [];
          setMyApplications(appList);
        }

        if (mentorshipsRes?.data) {
          const rawM = mentorshipsRes.data as unknown;
          const mList = Array.isArray(rawM)
            ? (rawM as Mentorship[])
            : Array.isArray((rawM as any)?.data)
            ? ((rawM as any).data as Mentorship[])
            : [];
          setMyMentorships(mList);
        }

        const raw = response as unknown;
        let allPlans: PlanSummary[] = [];
        if (Array.isArray(raw)) {
          allPlans = raw as PlanSummary[];
        } else if (typeof raw === 'object' && raw !== null) {
          const record = raw as Record<string, unknown>;
          if (Array.isArray(record.data)) {
            allPlans = record.data as PlanSummary[];
          } else if (typeof record.data === 'object' && record.data !== null) {
            const nested = record.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) {
              allPlans = nested.data as PlanSummary[];
            }
          }
        }

        if (pPlanId) {
          const targetPlan = allPlans.find((p) => p.id === pPlanId);
          if (targetPlan?.mentorId) {
            setMentorId(targetPlan.mentorId);
            setPlans(allPlans.filter((p) => p.mentorId === targetPlan.mentorId));
            void marketplaceService
              .getMentorProfile(targetPlan.mentorId)
              .then(setMentor)
              .catch(() => null);
            return;
          }
        }

        setPlans(allPlans);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || t('failedToLoadPlans'));
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [user, searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

    if (!agreedTerms) {
      setError(t('termsRequiredError'));
      return;
    }

    const hasExisting =
      myApplications.some(
        (a) =>
          (a.planId === planId || (mentor && a.mentorId === mentor.id)) &&
          (a.status === 'PENDING' || a.status === 'ACCEPTED'),
      ) ||
      myMentorships.some(
        (m) =>
          mentor &&
          m.mentorId === mentor.id &&
          ['INTRO', 'ACTIVE', 'PAUSED'].includes(m.status),
      );

    if (hasExisting) {
      setError(t('alreadyAppliedWithMentor'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await applicationsApi.apply({ planId, message });
      router.push('/mentee/dashboard/mentorships');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || t('withdrawError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {mentor ? (
            <div className="mb-6 pb-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#172033] to-slate-800 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                {mentor.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  {t('applyingForMentorshipWith')}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{mentor.fullName}</h1>
                <p className="text-xs text-gray-500">
                  {mentor.title} {mentor.company ? `at ${mentor.company}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('applyPageTitle')}</h1>
              <p className="text-gray-600">
                {t('applyPageSubtitle')}
              </p>
            </div>
          )}

          {(() => {
            const existingPending = myApplications.find(
              (a) =>
                (a.planId === planId || (mentor && a.mentorId === mentor.id)) &&
                a.status === 'PENDING',
            );
            const existingAccepted = myApplications.find(
              (a) =>
                (a.planId === planId || (mentor && a.mentorId === mentor.id)) &&
                a.status === 'ACCEPTED',
            );
            const existingMentorship = myMentorships.find(
              (m) =>
                mentor &&
                m.mentorId === mentor.id &&
                ['INTRO', 'ACTIVE', 'PAUSED'].includes(m.status),
            );

            if (existingPending) {
              return (
                <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('applicationAlreadySubmittedTitle')}</span>
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      {t('applicationAlreadySubmittedDesc', {
                        date: new Date(existingPending.createdAt).toLocaleDateString(),
                        mentor: mentor?.fullName || t('mentorFallback'),
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/mentee/dashboard/mentorships')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex-nowrap shrink-0 shadow-sm"
                  >
                    {t('viewApplicationBtn')}
                  </button>
                </div>
              );
            }

            if (existingMentorship || existingAccepted) {
              const isIntro =
                existingMentorship?.status === 'INTRO' || Boolean(existingAccepted);
              const mId = existingMentorship?.id;
              return (
                <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        {isIntro ? t('freeIntroCallAvailable') : t('alreadyAppliedWithMentor')}
                      </span>
                    </h3>
                    <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                      {isIntro ? t('freeIntroCallDesc') : t('alreadyAppliedWithMentor')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isIntro && mId && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/mentee/dashboard/bookings/new?mentorshipId=${mId}`)
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        {t('bookFreeIntroCall')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => router.push('/mentee/dashboard/mentorships')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      {t('viewMentorship')}
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('planSelectLabel')} <span className="text-red-500">*</span>
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
                className="w-full h-14 px-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 bg-white"
              >
                <option value="">
                  {loadingPlans ? t('loadingPlans') : t('selectPlanPlaceholder')}
                </option>
                {(plans || []).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title} — {plan.priceAmount} {plan.currency}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {t('dontSeePlan')}{' '}
                <button
                  type="button"
                  onClick={() => router.push('/mentee/dashboard/mentorships/plans')}
                  className="text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap flex-nowrap shrink-0"
                >
                  {t('browseAllPlans')}
                </button>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('messageOptionalLabel')}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={5}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 resize-none"
                placeholder={t('messagePlaceholder')}
              />
              <p className="mt-1 text-sm text-gray-500">{t('charactersCount', { count: message.length })}</p>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 shrink-0"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                {t('agreeTermsLabel')}{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  {t('termsOfServiceLink')}
                </a>
                .
              </label>
            </div>

            <div className="flex items-center gap-3">
              {(() => {
                const isAlreadyApplied =
                  myApplications.some(
                    (a) =>
                      (a.planId === planId || (mentor && a.mentorId === mentor.id)) &&
                      (a.status === 'PENDING' || a.status === 'ACCEPTED'),
                  ) ||
                  myMentorships.some(
                    (m) =>
                      mentor &&
                      m.mentorId === mentor.id &&
                      ['INTRO', 'ACTIVE', 'PAUSED'].includes(m.status),
                  );
                return (
                  <button
                    type="submit"
                    disabled={loading || !planId || !agreedTerms || isAlreadyApplied}
                    className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 disabled:opacity-50 font-medium transition-colors whitespace-nowrap flex-nowrap shrink-0"
                  >
                    {loading
                      ? t('submittingApplication')
                      : isAlreadyApplied
                      ? t('alreadyAppliedBtn')
                      : t('submitApplicationBtn')}
                  </button>
                );
              })()}
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors whitespace-nowrap flex-nowrap shrink-0"
              >
                {t('cancelBtn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const t = useTranslations('menteeMentorships');
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
          <div className="text-sm text-gray-600">{t('loadingForm')}</div>
        </div>
      }
    >
      <ApplyContent />
    </Suspense>
  );
}
