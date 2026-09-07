'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { applicationsApi } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';

export default function ApplyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [planId, setPlanId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth?mode=login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

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
            Submit your application to start the mentorship process.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
                className="w-full h-14 px-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                placeholder="Enter plan ID"
              />
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

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !planId}
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
