'use client';

import { useEffect, useState, useCallback } from 'react';
import { mentorApi } from '@/lib/api/client';
import type { MentorProfile, UserSkill } from '@/lib/types';
import Link from 'next/link';
import { 
  FiUser, 
  FiBriefcase, 
  FiMail, 
  FiAward, 
  FiClock, 
  FiEdit2,
  FiSave,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiStar,
  FiGlobe,
  FiShield,
  FiCalendar,
  FiUserCheck,
  FiUsers,
  FiArrowRight
} from 'react-icons/fi';

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

  const inputClass =
    'w-full h-12 border border-[#E2E5EB] rounded-lg px-4 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478] mb-2';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <div className="flex items-center gap-3 text-[#5B6478]">
          <span className="w-5 h-5 rounded-full border-2 border-[#E2E5EB] border-t-[#E8A33D] animate-spin" />
          <span className="text-lg">Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,27,51,0.15)] border border-[#E2E5EB] p-12 text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-[#101B33]/10 flex items-center justify-center mx-auto mb-6">
            <FiUser className="w-10 h-10 text-[#101B33]" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#101B33]">No Mentor Profile</h1>
          <p className="mt-3 text-[#5B6478]">
            You haven&apos;t created a mentor profile yet. Start your journey to become a mentor today.
          </p>
          <Link
            href="/mentor/onboarding"
            className="mt-6 inline-flex items-center gap-2 bg-[#101B33] text-white px-6 py-3 rounded-lg hover:bg-[#1B2A4D] font-medium transition-colors"
          >
            Start Onboarding
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const isOnboarded = profile.onboardingStatus === 'COMPLETE' || profile.onboardingStatus === 'PENDING';

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif {
          font-family: 'Fraunces', ui-serif, Georgia, serif;
        }
        body {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,27,51,0.15)] border border-[#E2E5EB] overflow-hidden">
          {/* Header */}
          <div className="bg-[#101B33] px-8 pt-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#E8A33D]/20 flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-[#E8A33D]" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl text-white">Mentor Dashboard</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-white/60">{profile.fullName}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isOnboarded 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {profile.onboardingStatus}
                    </span>
                  </div>
                </div>
              </div>
              {!isOnboarded && (
                <Link
                  href="/mentor/onboarding"
                  className="bg-[#E8A33D] text-[#101B33] px-4 py-2 rounded-lg hover:bg-[#d4902e] font-medium transition-colors flex items-center gap-2"
                >
                  <FiAlertCircle className="w-4 h-4" />
                  Continue Onboarding
                </Link>
              )}
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-[#B3483F]/5 border border-[#B3483F]/30 text-[#8f3a33] px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E2E5EB] pb-4">
                  <h2 className="font-serif text-2xl text-[#101B33]">Edit Profile</h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-[#9AA1B0] hover:text-[#5B6478] transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Professional Title *</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className={inputClass}
                      placeholder="Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input
                      type="text"
                      value={editData.company}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      className={inputClass}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Bio</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={4}
                      className="w-full border border-[#E2E5EB] rounded-lg px-4 py-3 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Professional Experience</label>
                    <textarea
                      value={editData.experience}
                      onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                      rows={4}
                      className="w-full border border-[#E2E5EB] rounded-lg px-4 py-3 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors resize-none"
                      placeholder="Describe your professional experience..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Areas of Expertise</label>
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
                      className={inputClass}
                      placeholder="Software Engineering, Leadership, Career Growth"
                    />
                    <p className="mt-2 text-sm text-[#9AA1B0]">Separate multiple areas with commas.</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-[#E2E5EB]">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-[#101B33] text-white px-6 py-2.5 rounded-lg hover:bg-[#1B2A4D] disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
                  >
                    <FiSave className="w-5 h-5" />
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="border border-[#E2E5EB] px-6 py-2.5 rounded-lg hover:bg-[#F5F6F8] font-medium transition-colors text-[#12172B]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#F5F6F8] rounded-xl p-4 border border-[#E2E5EB]">
                    <div className="flex items-center gap-2 text-[#5B6478] text-xs font-medium uppercase tracking-wider">
                      <FiStar className="w-4 h-4 text-[#E8A33D]" />
                      Rating
                    </div>
                    <p className="mt-1 text-2xl font-semibold text-[#101B33]">
                      {profile.avgRating ? profile.avgRating.toFixed(1) : '—'}
                    </p>
                  </div>
                  <div className="bg-[#F5F6F8] rounded-xl p-4 border border-[#E2E5EB]">
                    <div className="flex items-center gap-2 text-[#5B6478] text-xs font-medium uppercase tracking-wider">
                      <FiUsers className="w-4 h-4 text-[#101B33]" />
                      Mentees
                    </div>
                    <p className="mt-1 text-2xl font-semibold text-[#101B33]">
                      {profile.totalMenteesServed || 0}
                    </p>
                  </div>
                  <div className="bg-[#F5F6F8] rounded-xl p-4 border border-[#E2E5EB]">
                    <div className="flex items-center gap-2 text-[#5B6478] text-xs font-medium uppercase tracking-wider">
                      <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                      Status
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#101B33]">
                      {isOnboarded ? 'Active' : 'In Progress'}
                    </p>
                  </div>
                  <div className="bg-[#F5F6F8] rounded-xl p-4 border border-[#E2E5EB]">
                    <div className="flex items-center gap-2 text-[#5B6478] text-xs font-medium uppercase tracking-wider">
                      <FiShield className="w-4 h-4 text-blue-600" />
                      Verified
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#101B33]">
                      {profile.isVerified ? 'Yes' : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-serif text-xl text-[#101B33] mb-4 flex items-center gap-2">
                      <FiUser className="w-5 h-5 text-[#E8A33D]" />
                      Profile Information
                    </h3>
                    <dl className="space-y-3">
                      <div className="flex flex-wrap">
                        <dt className="w-32 text-sm text-[#5B6478] font-medium">Full Name</dt>
                        <dd className="text-[#12172B]">{profile.fullName}</dd>
                      </div>
                      <div className="flex flex-wrap">
                        <dt className="w-32 text-sm text-[#5B6478] font-medium">Title</dt>
                        <dd className="text-[#12172B]">{profile.title}</dd>
                      </div>
                      <div className="flex flex-wrap">
                        <dt className="w-32 text-sm text-[#5B6478] font-medium">Company</dt>
                        <dd className="text-[#12172B]">{profile.company || '—'}</dd>
                      </div>
                      <div className="flex flex-wrap">
                        <dt className="w-32 text-sm text-[#5B6478] font-medium">Bio</dt>
                        <dd className="text-[#12172B]">{profile.bio || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl text-[#101B33] mb-4 flex items-center gap-2">
                      <FiTrendingUp className="w-5 h-5 text-[#E8A33D]" />
                      Experience & Expertise
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-[#5B6478] font-medium">Experience</dt>
                        <dd className="text-[#12172B] whitespace-pre-wrap">{profile.experience || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#5B6478] font-medium">Areas of Expertise</dt>
                        <dd className="text-[#12172B]">
                          {profile.areasOfExpertise.length > 0 
                            ? profile.areasOfExpertise.join(', ') 
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-serif text-xl text-[#101B33] mb-4 flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-[#E8A33D]" />
                    Skills
                  </h3>
                  {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.user.userSkills.map((us: UserSkill) => (
                        <span
                          key={us.id}
                          className="bg-[#E8A33D]/10 text-[#C67F1E] border border-[#E8A33D]/30 px-4 py-1.5 rounded-full text-sm font-medium"
                        >
                          {us.skill.name} · {us.level}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#9AA1B0]">No skills added yet.</p>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-serif text-xl text-[#101B33] mb-4 flex items-center gap-2">
                    <FiClock className="w-5 h-5 text-[#E8A33D]" />
                    Availability
                  </h3>
                  <div className="bg-[#F5F6F8] rounded-xl p-4 border border-[#E2E5EB]">
                    <pre className="text-sm text-[#5B6478] overflow-x-auto">
                      {JSON.stringify(profile.availability, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-4 border-t border-[#E2E5EB]">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#101B33] text-white px-6 py-2.5 rounded-lg hover:bg-[#1B2A4D] font-medium transition-colors flex items-center gap-2"
                  >
                    <FiEdit2 className="w-5 h-5" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}