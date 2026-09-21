'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { applicationsApi, mentorshipsApi } from '@/lib/api/client';
import type { MentorshipApplication, Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

type Tab = 'applications' | 'mentees';

export default function MentorMenteesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('applications');
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [applicationsRes, mentorshipsRes] = await Promise.all([
        applicationsApi.getMentorApplications(),
        mentorshipsApi.getMentorMentorships(),
      ]);
      setApplications(applicationsRes.data);
      setMentorships(mentorshipsRes.data);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    const isUserMentor = Boolean(
      (user as unknown as { isMentor?: boolean })?.isMentor ||
        String(user.role ?? '').trim().toLowerCase() === 'mentor'
    );

    if (!isUserMentor) {
      router.replace('/');
      return;
    }

    void loadData();
  }, [user, authLoading, router, loadData]);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      await applicationsApi.accept(id);
      void loadData();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || 'Failed to accept application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await applicationsApi.reject(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || 'Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    try {
      await mentorshipsApi.pause(id);
      setMentorships((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'PAUSED' } : m)),
      );
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || 'Failed to pause mentorship');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (id: string) => {
    setActionLoading(id);
    try {
      await mentorshipsApi.resume(id);
      setMentorships((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'ACTIVE' } : m)),
      );
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || 'Failed to resume mentorship');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Are you sure you want to mark this mentorship as completed?')) return;
    setActionLoading(id);
    try {
      await mentorshipsApi.complete(id);
      setMentorships((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'COMPLETED' } : m)),
      );
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || 'Failed to complete mentorship');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalId) return;
    setActionLoading(cancelModalId);
    try {
      await mentorshipsApi.cancel(cancelModalId, cancelReason || undefined);
      setMentorships((prev) =>
        prev.map((m) => (m.id === cancelModalId ? { ...m, status: 'CANCELLED' } : m)),
      );
      setCancelModalId(null);
      setCancelReason('');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || 'Failed to cancel mentorship');
    } finally {
      setActionLoading(null);
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Mentees & Applications</h1>
          <button
            onClick={() => router.push('/mentor/dashboard')}
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            ← Back to Dashboard
          </button>
        </div>

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
              Incoming Applications ({applications.length})
            </button>
            <button
              onClick={() => setTab('mentees')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                tab === 'mentees'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Mentees ({mentorships.length})
            </button>
          </div>

          <div className="p-6">
            {tab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No incoming applications yet.</p>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {app.mentee?.email || 'Applicant'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Plan: {app.plan?.title || 'Mentorship Plan'}
                          </p>
                          {app.message && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">
                              &ldquo;{app.message}&rdquo;
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAccept(app.id)}
                                disabled={actionLoading === app.id}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                              >
                                {actionLoading === app.id ? 'Accepting...' : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                disabled={actionLoading === app.id}
                                className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                              >
                                {actionLoading === app.id ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'mentees' && (
              <div className="space-y-4">
                {mentorships.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No active mentees yet.</p>
                ) : (
                  mentorships.map((mentorship) => {
                    const statusStr = String(mentorship.status);
                    return (
                      <div
                        key={mentorship.id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {mentorship.mentee?.email || 'Mentee'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Plan: {mentorship.plan?.title || 'Unknown'}
                            </p>
                            {mentorship.startedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Started: {new Date(mentorship.startedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:items-end gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-end ${
                                statusStr === 'INTRO'
                                  ? 'bg-blue-100 text-blue-800'
                                  : statusStr === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : statusStr === 'PAUSED'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : statusStr === 'COMPLETED'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {statusStr}
                            </span>

                            {/* Management Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                              {statusStr === 'ACTIVE' && (
                                <>
                                  <button
                                    onClick={() => handlePause(mentorship.id)}
                                    disabled={actionLoading === mentorship.id}
                                    className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg text-xs font-medium hover:bg-yellow-100 disabled:opacity-50"
                                  >
                                    Pause
                                  </button>
                                  <button
                                    onClick={() => handleComplete(mentorship.id)}
                                    disabled={actionLoading === mentorship.id}
                                    className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-100 disabled:opacity-50"
                                  >
                                    Complete
                                  </button>
                                </>
                              )}

                              {statusStr === 'PAUSED' && (
                                <button
                                  onClick={() => handleResume(mentorship.id)}
                                  disabled={actionLoading === mentorship.id}
                                  className="px-3 py-1 bg-green-50 text-green-700 border border-green-300 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                                >
                                  Resume
                                </button>
                              )}

                              {(statusStr === 'INTRO' || statusStr === 'ACTIVE' || statusStr === 'PAUSED') && (
                                <button
                                  onClick={() => {
                                    setCancelModalId(mentorship.id);
                                    setCancelReason('');
                                  }}
                                  disabled={actionLoading === mentorship.id}
                                  className="px-3 py-1 bg-red-50 text-red-700 border border-red-300 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Reason Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Mentorship</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide an optional cancellation reason for the mentee.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 resize-none"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalId(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={actionLoading === cancelModalId}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === cancelModalId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
