'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { mentorApi, apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { MentorProfile, UserSkill, Skill, SkillLevel } from '@/lib/types';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  FiUser,
  FiBriefcase,
  FiAward,
  FiClock,
  FiEdit2,
  FiSave,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiStar,
  FiShield,
  FiUsers,
  FiArrowRight,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiGlobe,
  FiZap,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiMoreHorizontal
} from 'react-icons/fi';

export default function MentorDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
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
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const [availability, setAvailability] = useState<Record<string, unknown>>({
    timezone: 'Africa/Douala',
    slots: [] as Array<{ day: string; startTime: string; endTime: string }>,
  });
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const DAY_LABELS: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      window.location.href = '/auth?mode=login';
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mentorApi.getMyProfile();
        setProfile(res.data);
        setEditData({
          title: res.data.title,
          company: res.data.company || '',
          bio: res.data.bio || '',
          experience: res.data.experience || '',
          areasOfExpertise: res.data.areasOfExpertise || [],
        });
        setAvailability((res.data.availability as Record<string, unknown>) || {
          timezone: 'Africa/Douala',
          slots: [],
        });

        try {
          setLoadingSkills(true);
          const skillsRes = await apiClient.get<Skill[]>('/mentor/applications/skills');
          setSkills(skillsRes.data);
        } catch {
          // ignore skills loading failure
        } finally {
          setLoadingSkills(false);
        }
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mentorApi.updateProfile(editData);
      setProfile(res.data);
      setIsEditing(false);
      toast.success('Profile updated successfully', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    try {
      setSavingSkills(true);
      setError(null);
      await mentorApi.addSkill({
        skillId: selectedSkillId,
        level: selectedLevel,
      });
      const updated = await mentorApi.getMyProfile();
      setProfile(updated.data);
      setSelectedSkillId('');
      toast.success('Skill added successfully', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to add skill');
      toast.error('Failed to add skill');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      setSavingSkills(true);
      setError(null);
      await mentorApi.removeSkill(skillId);
      const updated = await mentorApi.getMyProfile();
      setProfile(updated.data);
      toast.success('Skill removed', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to remove skill');
      toast.error('Failed to remove skill');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleUpdateSkillLevel = async (skillId: string, level: SkillLevel) => {
    try {
      setSavingSkills(true);
      setError(null);
      await mentorApi.updateSkill(skillId, { level });
      const updated = await mentorApi.getMyProfile();
      setProfile(updated.data);
      toast.success('Skill level updated', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update skill level');
      toast.error('Failed to update skill level');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true);
      setError(null);
      const updated = await mentorApi.updateAvailability({
        availability,
      });
      setProfile(updated.data);
      toast.success('Availability saved', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update availability');
      toast.error('Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  // ── Enhanced Style Tokens ──────────────────────────────────────────────────
  const inputClass =
    'w-full h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30';
  const textareaClass =
    'w-full text-base border border-[#E5E7EB] rounded-xl px-5 py-4 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 resize-none hover:border-[#F97316]/30';
  const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';
  const sectionLabelClass = 'text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2';
  const primaryBtnClass =
    'bg-[#F97316] text-white px-8 py-3.5 rounded-xl hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#F97316]/30 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-all duration-200 flex items-center justify-center gap-2';
  const secondaryBtnClass =
    'border border-[#E5E7EB] rounded-xl hover:bg-[#FFFCF9] hover:border-[#F97316]/30 font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-[#172033] flex items-center justify-center gap-2 px-8 py-3.5';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#E5E7EB] border-t-[#F97316] animate-spin" />
          <span className="text-lg text-[#64748B] font-medium">Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFFCF9] font-sans text-[#172033]">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800;900&display=swap');
          .font-serif {
            font-family: 'Fraunces', ui-serif, Georgia, serif;
          }
          body {
            font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          }
        `}</style>

        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] p-8 sm:p-14 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#F97316]/20 mb-6">
              <FiUser className="w-10 h-10 text-[#F97316]" />
            </div>
            <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
              No profile yet
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
              No Mentor Profile
            </h1>
            <p className="mt-4 text-xl text-[#475569] leading-relaxed max-w-xl mx-auto">
              You haven&apos;t created a mentor profile yet. Start your journey to become a
              mentor today.
            </p>
            <Link href="/mentor/onboarding" className={`${primaryBtnClass} mt-8 inline-flex w-auto`}>
              Start Onboarding
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  const isOnboarded = profile.onboardingStatus === 'COMPLETE' || profile.onboardingStatus === 'PENDING';

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans overflow-x-hidden text-[#172033]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-serif {
          font-family: 'Fraunces', ui-serif, Georgia, serif;
        }
        body {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            {/* Header — Enhanced with gradient accent */}
            <div className="bg-[#172033] px-8 sm:px-10 py-8 sm:py-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F97316]/5 rounded-full blur-2xl" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#F97316]/30">
                    <FiUser className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentor Dashboard</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-sm text-white/70 font-medium">{profile.fullName}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          isOnboarded
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20'
                        }`}
                      >
                        {profile.onboardingStatus}
                      </span>
                    </div>
                  </div>
                </div>
                {!isOnboarded && (
                  <Link
                    href="/mentor/onboarding"
                    className="bg-[#F97316] text-white px-6 py-3 rounded-xl hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#F97316]/30 font-bold text-sm transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <FiAlertCircle className="w-4 h-4" />
                    Continue Onboarding
                  </Link>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10 lg:p-12">
              {error && (
                <div className="mb-8 bg-red-50/80 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-4 text-base">
                  <FiAlertCircle className="w-6 h-6 flex-shrink-0 text-red-500" />
                  {error}
                </div>
              )}

              {isEditing ? (
                /* ── Enhanced Edit Mode ────────────────────────────────── */
                <div className="space-y-8 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
                        Editing profile
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                        Edit Profile
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-[#94A3B8] hover:text-[#64748B] transition-colors p-2 hover:bg-[#FFFCF9] rounded-lg"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Professional Title <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <FiBriefcase className="w-6 h-6 text-[#94A3B8]" />
                        </div>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className={`${inputClass} pl-14`}
                          placeholder="e.g. Senior Software Engineer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Company</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <FiZap className="w-6 h-6 text-[#94A3B8]" />
                        </div>
                        <input
                          type="text"
                          value={editData.company}
                          onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                          className={`${inputClass} pl-14`}
                          placeholder="e.g. Acme Corp"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Bio</label>
                      <div className="relative">
                        <textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          rows={6}
                          className={textareaClass}
                          placeholder="Tell us about yourself, your background, and what drives you..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Professional Experience</label>
                      <textarea
                        value={editData.experience}
                        onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                        rows={6}
                        className={textareaClass}
                        placeholder="Describe your professional experience, achievements, and background..."
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
                        placeholder="e.g. Software Engineering, Leadership, Career Growth"
                      />
                      <p className="mt-2 text-sm text-[#64748B]">Separate multiple areas with commas.</p>
                    </div>

                    {/* Skills Section */}
                    <div className="border-t border-[#E5E7EB] pt-8">
                      <h3 className={sectionLabelClass}>
                        <FiAward className="w-4 h-4 text-[#F97316]" />
                        Skills
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <select
                          value={selectedSkillId}
                          onChange={(e) => setSelectedSkillId(e.target.value)}
                          className="flex-1 h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30"
                        >
                          <option value="">Select a skill</option>
                          {skills.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedLevel}
                          onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
                          className="w-full sm:w-48 h-14 text-base border border-[#E5E7EB] rounded-xl px-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30"
                        >
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                          <option value="EXPERT">Expert</option>
                        </select>
                        <button
                          onClick={handleAddSkill}
                          disabled={!selectedSkillId || savingSkills}
                          className="w-full sm:w-auto bg-[#F97316] text-white px-8 py-3.5 rounded-xl hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#F97316]/30 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <FiPlus className="w-5 h-5" />
                          {savingSkills ? 'Adding…' : 'Add Skill'}
                        </button>
                      </div>
                      {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                        <div className="space-y-3">
                          {profile.user.userSkills.map((us: UserSkill) => (
                            <div
                              key={us.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-r from-[#FFFCF9] to-white rounded-xl px-6 py-5 border border-[#E5E7EB] hover:border-[#F97316]/30 transition-all duration-200 gap-4 sm:gap-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
                                  <FiAward className="w-5 h-5 text-[#F97316]" />
                                </div>
                                <span className="font-bold text-[#172033] text-lg">{us.skill.name}</span>
                              </div>
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <select
                                  value={us.level}
                                  onChange={(e) => handleUpdateSkillLevel(us.id, e.target.value as SkillLevel)}
                                  className="flex-1 sm:flex-none border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30"
                                >
                                  <option value="BEGINNER">Beginner</option>
                                  <option value="INTERMEDIATE">Intermediate</option>
                                  <option value="ADVANCED">Advanced</option>
                                  <option value="EXPERT">Expert</option>
                                </select>
                                <button
                                  onClick={() => handleRemoveSkill(us.id)}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <FiTrash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-2xl">
                          <FiAward className="w-12 h-12 text-[#94A3B8] mx-auto mb-4 opacity-50" />
                          <p className="text-base text-[#64748B]">No skills added yet.</p>
                        </div>
                      )}
                    </div>

                    {/* Availability Section */}
                    <div className="border-t border-[#E5E7EB] pt-8">
                      <h3 className={sectionLabelClass}>
                        <FiClock className="w-4 h-4 text-[#F97316]" />
                        Availability
                      </h3>
                      <div className="space-y-6">
                        <div className="max-w-sm">
                          <label className={labelClass}>Timezone</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                              <FiGlobe className="w-6 h-6 text-[#94A3B8]" />
                            </div>
                            <select
                              value={(availability.timezone as string) || 'Africa/Douala'}
                              onChange={(e) =>
                                setAvailability({ ...availability, timezone: e.target.value })
                              }
                              className={`${inputClass} pl-14 appearance-none`}
                            >
                              <option value="Africa/Douala">Africa/Douala</option>
                              <option value="Africa/Lagos">Africa/Lagos</option>
                              <option value="Africa/Nairobi">Africa/Nairobi</option>
                              <option value="America/New_York">America/New_York</option>
                              <option value="America/Los_Angeles">America/Los_Angeles</option>
                              <option value="Europe/London">Europe/London</option>
                              <option value="Europe/Paris">Europe/Paris</option>
                              <option value="Asia/Tokyo">Asia/Tokyo</option>
                              <option value="Asia/Shanghai">Asia/Shanghai</option>
                            </select>
                          </div>
                        </div>
                        {Array.isArray(availability.slots) && (
                          <div className="space-y-3">
                            {(availability.slots as Array<{ day: string; startTime: string; endTime: string }>).map(
                              (slot, index) => (
                                <div
                                  key={index}
                                  className="flex flex-wrap gap-4 items-center bg-gradient-to-r from-[#F8FAFC] to-white p-5 rounded-xl border border-[#E5E7EB] hover:border-[#F97316]/30 transition-all duration-200"
                                >
                                  <span className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] text-white text-sm font-bold flex items-center justify-center shadow-sm">
                                    {DAY_LABELS[slot.day] || slot.day.slice(0, 3)}
                                  </span>
                                  <select
                                    value={slot.day}
                                    onChange={(e) => {
                                      const newSlots = [...(availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                                      newSlots[index] = { ...newSlots[index], day: e.target.value };
                                      setAvailability({ ...availability, slots: newSlots });
                                    }}
                                    className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30"
                                  >
                                    {DAYS.map((day) => (
                                      <option key={day} value={day}>
                                        {day}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => {
                                      const newSlots = [...(availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                                      newSlots[index] = { ...newSlots[index], startTime: e.target.value };
                                      setAvailability({ ...availability, slots: newSlots });
                                    }}
                                    className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30 w-32"
                                  />
                                  <span className="text-[#64748B] font-medium">to</span>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => {
                                      const newSlots = [...(availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                                      newSlots[index] = { ...newSlots[index], endTime: e.target.value };
                                      setAvailability({ ...availability, slots: newSlots });
                                    }}
                                    className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30 w-32"
                                  />
                                  <button
                                    onClick={() => {
                                      const newSlots = (availability.slots as Array<{ day: string; startTime: string; endTime: string }>).filter((_, i) => i !== index);
                                      setAvailability({ ...availability, slots: newSlots });
                                    }}
                                    className="ml-auto text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <FiTrash2 className="w-6 h-6" />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const newSlots = [
                              ...(Array.isArray(availability.slots)
                                ? (availability.slots as Array<{ day: string; startTime: string; endTime: string }>)
                                : []),
                              { day: 'MONDAY', startTime: '09:00', endTime: '12:00' },
                            ];
                            setAvailability({ ...availability, slots: newSlots });
                          }}
                          className="text-[#F97316] hover:text-[#ea580c] font-bold text-base flex items-center gap-2 transition-colors"
                        >
                          <FiCalendar className="w-5 h-5" />
                          Add time slot
                        </button>
                      </div>
                      <button
                        onClick={handleSaveAvailability}
                        disabled={savingAvailability}
                        className="mt-6 bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 font-bold text-base transition-all duration-200 flex items-center gap-3"
                      >
                        <FiSave className="w-5 h-5" />
                        {savingAvailability ? 'Saving…' : 'Save Availability'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#E5E7EB] pt-10">
                    <button onClick={() => setIsEditing(false)} className={`w-full sm:w-auto ${secondaryBtnClass}`}>
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className={`w-full sm:w-auto ${primaryBtnClass}`}
                    >
                      <FiSave className="w-5 h-5" />
                      {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Enhanced View Mode ────────────────────────────────── */
                <div className="space-y-10 max-w-3xl mx-auto">
                  <div>
                    <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
                      Your profile
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                      {profile.fullName}
                    </h2>
                    <p className="mt-3 text-xl text-[#475569]">{profile.title}</p>
                  </div>

                  {/* Enhanced Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-[#FFF7ED] to-white border border-[#F97316]/20 rounded-2xl p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-2 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                        <FiStar className="w-4 h-4 text-[#F97316]" />
                        Rating
                      </div>
                      <p className="mt-2 text-3xl font-extrabold text-[#172033]">
                        {profile.avgRating ? profile.avgRating.toFixed(1) : '—'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E5E7EB] rounded-2xl p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-2 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                        <FiUsers className="w-4 h-4 text-[#172033]" />
                        Mentees
                      </div>
                      <p className="mt-2 text-3xl font-extrabold text-[#172033]">
                        {profile.totalMenteesServed || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E5E7EB] rounded-2xl p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-2 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                        <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                        Status
                      </div>
                      <p className="mt-2 text-lg font-extrabold text-[#172033]">
                        {isOnboarded ? 'Active' : 'In Progress'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E5E7EB] rounded-2xl p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-2 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                        <FiShield className="w-4 h-4 text-blue-600" />
                        Verified
                      </div>
                      <p className="mt-2 text-lg font-extrabold text-[#172033]">
                        {profile.isVerified ? 'Yes' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Detail Sections */}
                  <div className="border border-[#E5E7EB] rounded-2xl divide-y divide-[#E5E7EB] overflow-hidden">
                    <div className="p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-[#F97316]" />
                        Profile Information
                      </h3>
                      <dl className="space-y-3 text-base">
                        <div className="flex flex-wrap gap-x-4 py-1.5">
                          <dt className="w-40 text-[#64748B] font-medium">Full Name</dt>
                          <dd className="text-[#172033] font-semibold">{profile.fullName}</dd>
                        </div>
                        <div className="flex flex-wrap gap-x-4 py-1.5">
                          <dt className="w-40 text-[#64748B] font-medium">Title</dt>
                          <dd className="text-[#172033]">{profile.title}</dd>
                        </div>
                        <div className="flex flex-wrap gap-x-4 py-1.5">
                          <dt className="w-40 text-[#64748B] font-medium">Company</dt>
                          <dd className="text-[#172033]">{profile.company || '—'}</dd>
                        </div>
                        <div className="flex flex-wrap gap-x-4 py-1.5">
                          <dt className="w-40 text-[#64748B] font-medium">Bio</dt>
                          <dd className="text-[#172033]">{profile.bio || '—'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiTrendingUp className="w-4 h-4 text-[#F97316]" />
                        Experience
                      </h3>
                      <p className="text-[#172033] whitespace-pre-wrap leading-relaxed">{profile.experience || '—'}</p>
                      <p className="mt-4 text-base text-[#64748B]">
                        <span className="font-medium text-[#172033]">Areas of Expertise: </span>
                        {profile.areasOfExpertise.length > 0 ? profile.areasOfExpertise.join(', ') : '—'}
                      </p>
                    </div>

                    <div className="p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiAward className="w-4 h-4 text-[#F97316]" />
                        Skills
                      </h3>
                      {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {profile.user.userSkills.map((us: UserSkill) => (
                            <span
                              key={us.id}
                              className="bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/20 px-5 py-2.5 rounded-full text-base font-medium hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-all duration-200 cursor-default"
                            >
                              {us.skill.name} · {us.level}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#64748B]">No skills added</p>
                      )}
                    </div>

                    <div className="p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-[#F97316]" />
                        Availability
                      </h3>
                      <p className="text-base text-[#64748B] mb-3">
                        Timezone:{' '}
                        <span className="text-[#172033] font-semibold">
                          {String(profile.availability?.timezone || '—')}
                        </span>
                      </p>
                      {Array.isArray(profile.availability?.slots) &&
                      (profile.availability?.slots as Array<{ day: string; startTime: string; endTime: string }>)
                        .length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(profile.availability?.slots as Array<{
                            day: string;
                            startTime: string;
                            endTime: string;
                          }>).map((slot, i) => (
                            <span
                              key={i}
                              className="bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-2 rounded-lg text-base text-[#172033] hover:border-[#F97316]/30 hover:bg-[#FFF7ED] transition-all duration-200"
                            >
                              {DAY_LABELS[slot.day] || slot.day} {slot.startTime}–{slot.endTime}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#64748B]">No availability slots set</p>
                      )}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex justify-end border-t border-[#E5E7EB] pt-10">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`w-full sm:w-auto ${primaryBtnClass}`}
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
      </main>

      <Footer />
    </div>
  );
}