'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applicationsApi, plansApi } from '@/lib/api/client';
import type { PlanSummary } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [planId, setPlanId] = useState(searchParams.get('planId') || '');
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
    const paramPlanId = searchParams.get('planId');
    if (paramPlanId) {
      setPlanId(paramPlanId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      try {
        setLoadingPlans(true);
        const response = await plansApi.list();
        setPlans(response.data.data);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [user]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Mentorship</h1>
          <p className="text-gray-600 mb-8">
            Select a plan and submit your application to start the mentorship process.
          </p>

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
                {plans.map((plan) => (
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
