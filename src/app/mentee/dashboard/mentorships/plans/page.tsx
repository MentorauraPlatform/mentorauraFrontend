'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { plansApi } from '@/lib/api/client';
import type { PlanSummary } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function BrowsePlansPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
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
        const response = await plansApi.list();
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
        setError(apiError.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSelectPlan = (planId: string) => {
    router.push(`/mentee/dashboard/mentorships/apply?planId=${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-lg text-gray-600">Loading plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Mentorship Plans</h1>
          <p className="text-gray-600 mt-1">
            Choose a plan to apply for mentorship.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-600">
            No active plans available right now.
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
                    Mentor ID: {plan.mentorId}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 block font-semibold">
                      Price
                    </span>
                    <span className="text-lg font-black text-[#172033]">
                      {plan.priceAmount} {plan.currency}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
