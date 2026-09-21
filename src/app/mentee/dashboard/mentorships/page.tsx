'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { applicationsApi, mentorshipsApi } from '@/lib/api/client';
import type { MentorshipApplication, Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

type Tab = 'applications' | 'mentorships';

export default function MenteeMentorshipsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('applications');
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    void (async () => {
      try {
        setLoading(true);
        const [applicationsRes, mentorshipsRes] = await Promise.all([
          applicationsApi.getMyApplications(),
          mentorshipsApi.getMenteeMentorships(),
        ]);
        setApplications(applicationsRes.data);
        setMentorships(mentorshipsRes.data);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'Failed to load mentorships');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router]);

  const handleWithdraw = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await applicationsApi.withdraw(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || 'Failed to withdraw application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-lg text-gray-600">Loading...</div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Mentorships</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('applications')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                tab === 'applications'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setTab('mentorships')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                tab === 'mentorships'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Mentorships ({mentorships.length})
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => router.push('/mentee/dashboard/mentorships/plans')}
                className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 font-medium transition-colors"
              >
                Browse Plans
              </button>
            </div>
            {tab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No applications yet.</p>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.plan?.title || 'Plan'}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Mentor: {app.mentor?.fullName || 'Unknown'}
                          </p>
                          {app.message && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{app.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              app.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : app.status === 'ACCEPTED'
                                ? 'bg-green-100 text-green-800'
                                : app.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {app.status}
                          </span>
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => handleWithdraw(app.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'mentorships' && (
              <div className="space-y-4">
                {mentorships.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No active mentorships.</p>
                ) : (
                  mentorships.map((mentorship) => (
                    <div
                      key={mentorship.id}
                      className="border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-orange-300 transition-colors"
                      onClick={() => router.push(`/mentee/dashboard/mentorships/${mentorship.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {mentorship.plan?.title || 'Mentorship'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Mentor: {mentorship.mentor?.fullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Status: {mentorship.status}
                          </p>
                        </div>
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
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
