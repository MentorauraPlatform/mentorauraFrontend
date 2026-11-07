'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { plansApi, applicationsApi } from '@/lib/api/client';
import type { PlanSummary, MentorshipApplication } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { MenteeDashboardLayout } from '@/components/layout/MenteeDashboardLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { CheckCircle2 } from 'lucide-react';

export default function BrowsePlansPage() {
  const router = useRouter();
  const t = useTranslations('menteeMentorships');
  const { user, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth?mode=login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const [response, appsRes] = await Promise.all([
          plansApi.list(),
          applicationsApi.getMyApplications().catch(() => null),
        ]);

        if (appsRes?.data) {
          const rawApps = appsRes.data as unknown;
          const appList = Array.isArray(rawApps)
            ? (rawApps as MentorshipApplication[])
            : Array.isArray((rawApps as any)?.data)
            ? ((rawApps as any).data as MentorshipApplication[])
            : [];
          setApplications(appList);
        }

        const raw = response as unknown;
        let plansList: PlanSummary[] = [];
        if (Array.isArray(raw)) {
          plansList = raw as PlanSummary[];
        } else if (typeof raw === 'object' && raw !== null) {
          const record = raw as Record<string, unknown>;
          if (Array.isArray(record.data)) {
            plansList = record.data as PlanSummary[];
          } else if (typeof record.data === 'object' && record.data !== null) {
            const nested = record.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) {
              plansList = nested.data as PlanSummary[];
            }
          }
        }
        setPlans(plansList);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || t('failedToLoadPlans'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, t]);

  const handleSelectPlan = (planId: string) => {
    router.push(`/mentee/dashboard/mentorships/apply?planId=${planId}`);
  };

  return (
    <MenteeDashboardLayout activeTab="mentors" activeTabTitle={t('plansHeading')}>
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingState message={t('loadingPlans')} />
        </div>
      ) : error ? (
        <div className="py-12 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">{t('failedToLoad')}</h2>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t('plansHeading')}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('plansSub')}
            </p>
          </div>

          {plans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-600">
            {t('noActivePlans')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(plans || []).map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-orange-300 transition-colors"
              >
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{plan.title}</h2>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {plan.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {t('mentorHeading')}: {plan.mentorId}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 block font-semibold">
                      {t('priceLabel')}
                    </span>
                    <span className="text-lg font-black text-[#172033]">
                      {plan.priceAmount} {plan.currency}
                    </span>
                  </div>
                  {(() => {
                    const isApplied = applications.some(
                      (a) => a.planId === plan.id && a.status === 'PENDING'
                    );

                    if (isApplied) {
                      return (
                        <button
                          onClick={() => router.push('/mentee/dashboard/mentorships')}
                          className="bg-emerald-50 text-emerald-700 border border-emerald-300 px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap flex-nowrap shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{t('appliedBadge')}</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 font-medium transition-colors whitespace-nowrap flex-nowrap shrink-0"
                      >
                        {t('applyBtn')}
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </MenteeDashboardLayout>
  );
}
