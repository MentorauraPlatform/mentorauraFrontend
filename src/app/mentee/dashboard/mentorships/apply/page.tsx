'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applicationsApi, plansApi } from '@/lib/api/client';
import { marketplaceService, MentorDetailData } from '@/services/marketplace.service';
import type { PlanSummary } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [planId, setPlanId] = useState(searchParams.get('planId') || '');
  const [mentorId, setMentorId] = useState(searchParams.get('mentorId') || '');
  const [mentor, setMentor] = useState<MentorDetailData | null>(null);
  const [message, setMessage] = useState('');
  const [plans, setPlans] = useState<PlanSummary[]>([]);
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
          const [mentorRes, plansRes] = await Promise.all([
            marketplaceService.getMentorProfile(pMentorId).catch(() => null),
            plansApi.getMentorPlans(pMentorId).catch(() => null),
          ]);

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
        const response = await plansApi.list();
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
        setError(apiError.message || 'Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [user, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

    if (!agreedTerms) {
      setError('You must agree to the Terms of Service to apply.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await applicationsApi.apply({ planId, message });
      router.push('/mentee/dashboard/mentorships');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {mentor ? (
            <div className="mb-6 pb-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#172033] to-slate-800 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                {mentor.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Applying for Mentorship with
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{mentor.fullName}</h1>
                <p className="text-xs text-gray-500">
                  {mentor.title} {mentor.company ? `at ${mentor.company}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Mentorship</h1>
              <p className="text-gray-600">
                Select a plan and submit your application to start the mentorship process.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan <span className="text-red-500">*</span>
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
                className="w-full h-14 px-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 bg-white"
              >
                <option value="">
                  {loadingPlans ? 'Loading plans...' : 'Select a plan'}
                </option>
                {(plans || []).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title} — {plan.priceAmount} {plan.currency}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Don’t see a plan?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/mentee/dashboard/mentorships/plans')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Browse all plans
                </button>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={5}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 resize-none"
                placeholder="Tell the mentor why you'd like to work together..."
              />
              <p className="mt-1 text-sm text-gray-500">{message.length}/500 characters</p>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I have read and agree to the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  Mentorship Terms of Service
                </a>
                .
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !planId || !agreedTerms}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
