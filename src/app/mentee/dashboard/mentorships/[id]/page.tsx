'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mentorshipsApi } from '@/lib/api/client';
import type { Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function MentorshipDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [loading, setLoading] = useState(true);
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
        const data = await mentorshipsApi.getMentorship(params.id);
        setMentorship(data.data);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'Failed to load mentorship');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !mentorship) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-red-600">{error || 'Mentorship not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {mentorship.plan?.title || 'Mentorship'}
            </h1>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
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

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Mentor
              </h3>
              <p className="mt-1 text-gray-900">{mentorship.mentor?.fullName || 'Unknown'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Plan Details
              </h3>
              <p className="mt-1 text-gray-900">{mentorship.plan?.title || '—'}</p>
              <p className="text-sm text-gray-600">
                {mentorship.plan?.priceAmount} {mentorship.plan?.currency}
              </p>
            </div>

            {mentorship.startedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Started At
                </h3>
                <p className="mt-1 text-gray-900">
                  {new Date(mentorship.startedAt).toLocaleString()}
                </p>
              </div>
            )}

            {mentorship.endedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ended At
                </h3>
                <p className="mt-1 text-gray-900">
                  {new Date(mentorship.endedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push('/messages')}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 font-medium transition-colors"
              >
                Go to Messages
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
