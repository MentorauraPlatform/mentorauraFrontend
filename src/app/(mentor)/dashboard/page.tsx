'use client';

import { useEffect, useState, useCallback } from 'react';
import { mentorApi } from '@/lib/api/client';
import type { MentorProfile, UserSkill } from '@/lib/types';
import Link from 'next/link';

export default function MentorDashboardPage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    company: '',
    bio: '',
    experience: '',
    areasOfExpertise: [] as string[],
  });

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await mentorApi.getMyProfile(token);
      setProfile(res.data);
      setEditData({
        title: res.data.title,
        company: res.data.company || '',
        bio: res.data.bio || '',
        experience: res.data.experience || '',
        areasOfExpertise: res.data.areasOfExpertise || [],
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  const handleUpdate = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await mentorApi.updateProfile(token, editData);
      setProfile(res.data);
      setIsEditing(false);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">No Mentor Profile</h1>
          <p className="text-gray-600">You haven&apos;t created a mentor profile yet.</p>
          <Link
            href="/mentor/onboarding"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Start Onboarding
          </Link>
        </div>
      </div>
    );
  }

  const isOnboarded = profile.onboardingStatus === 'COMPLETE' || profile.onboardingStatus === 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Status: <span className={`font-medium ${isOnboarded ? 'text-green-600' : 'text-yellow-600'}`}>{profile.onboardingStatus}</span>
              </p>
            </div>
            {!isOnboarded && (
              <Link
                href="/mentor/onboarding"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue Onboarding
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={editData.company}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <textarea
                  value={editData.experience}
                  onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                <input
                  type="text"
                  value={editData.areasOfExpertise.join(', ')}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      areasOfExpertise: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  <dl className="mt-2 space-y-2">
                    <div className="flex"><dt className="w-32 text-gray-600">Full Name:</dt><dd className="text-gray-900">{profile.fullName}</dd></div>
                    <div className="flex"><dt className="w-32 text-gray-600">Title:</dt><dd className="text-gray-900">{profile.title}</dd></div>
                    <div className="flex"><dt className="w-32 text-gray-600">Company:</dt><dd className="text-gray-900">{profile.company || '-'}</dd></div>
                    <div className="flex"><dt className="w-32 text-gray-600">Bio:</dt><dd className="text-gray-900">{profile.bio || '-'}</dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                  <dl className="mt-2 space-y-2">
                    <div className="flex"><dt className="w-32 text-gray-600">Experience:</dt><dd className="text-gray-900">{profile.experience || '-'}</dd></div>
                    <div className="flex"><dt className="w-32 text-gray-600">Expertise:</dt><dd className="text-gray-900">{profile.areasOfExpertise.join(', ') || '-'}</dd></div>
                    <div className="flex"><dt className="w-32 text-gray-600">Verified:</dt><dd className="text-gray-900">{profile.isVerified ? 'Yes' : 'No'}</dd></div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.user.userSkills.map((us: UserSkill) => (
                      <span key={us.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {us.skill.name} ({us.level})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills added yet.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded border overflow-x-auto">
                  {JSON.stringify(profile.availability, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
