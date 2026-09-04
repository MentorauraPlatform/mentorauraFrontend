'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
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
} from 'react-icons/fi';

type AvailabilityDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

type AvailabilitySlot = {
  day: AvailabilityDay;
  startTime: string;
  endTime: string;
};

type Availability = {
  timezone: string;
  slots: AvailabilitySlot[];
};

export default function MentorDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations('dashboard');
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
  const [availability, setAvailability] = useState<Availability>({
    timezone: 'Africa/Douala',
    slots: [],
  });
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const DAYS: AvailabilityDay[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];
  const DAY_LABELS: Record<AvailabilityDay, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
  };

  const getDayLabel = (day: string): string => {
    return DAY_LABELS[day as AvailabilityDay] ?? day;
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
        const [profileRes, skillsRes] = await Promise.all([
          mentorApi.getMyProfile(),
          apiClient.get<Skill[]>('/mentor/applications/skills').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setEditData({
          title: profileRes.data.title,
          company: profileRes.data.company || '',
          bio: profileRes.data.bio || '',
          experience: profileRes.data.experience || '',
          areasOfExpertise: profileRes.data.areasOfExpertise || [],
        });
        const rawAvailability = profileRes.data.availability as
          | { timezone?: string; slots?: Array<{ day?: string; startTime?: string; endTime?: string }> }
          | null
          | undefined;

        setAvailability({
          timezone: rawAvailability?.timezone || 'Africa/Douala',
          slots: (rawAvailability?.slots || []).map((slot) => ({
            day: (slot.day as AvailabilityDay) || 'MONDAY',
            startTime: slot.startTime || '09:00',
            endTime: slot.endTime || '17:00',
          })),
        });

        setSkills(skillsRes.data);
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
    const previousProfile = profile;
    if (profile && profile.user) {
      setProfile({
        ...profile,
        user: {
          ...profile.user,
          id: profile.user.id || '',
          email: profile.user.email || '',
          role: profile.user.role || '',
          isActive: profile.user.isActive ?? true,
          userSkills: profile.user.userSkills.map((us) =>
            us.id === skillId ? { ...us, level } : us
          ),
        },
      });
    }
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
      setProfile(previousProfile);
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

  // ── Style Tokens ─────────────────────────────────────────────────────────
  const inputClass =
    'w-full h-12 sm:h-14 text-base border border-[#E5E7EB] rounded-xl px-4 sm:px-5 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30';
  const textareaClass =
    'w-full text-base border border-[#E5E7EB] rounded-xl px-4 sm:px-5 py-4 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 resize-none hover:border-[#F97316]/30';
  const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';
  const sectionLabelClass =
    'text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2';
  const primaryBtnClass =
    'bg-[#F97316] text-white px-6 sm:px-8 py-3.5 rounded-xl hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#F97316]/30 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-all duration-200 flex items-center justify-center gap-2';
  const secondaryBtnClass =
    'border border-[#E5E7EB] rounded-xl hover:bg-[#FFFCF9] hover:border-[#F97316]/30 font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-[#172033] flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5';

  const initials = (name?: string) =>
    (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || '—';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] px-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#E5E7EB] border-t-[#F97316] animate-spin" />
          <span className="text-base sm:text-lg text-[#64748B] font-medium">{t('loadingProfile')}</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFFCF9] font-sans text-[#172033] flex flex-col">
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

        <main className="flex-1 flex items-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] p-8 sm:p-14 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#F97316]/20 mb-6">
                <FiUser className="w-8 h-8 sm:w-10 sm:h-10 text-[#F97316]" />
              </div>
              <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
                {t('noProfileYet')}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
                {t('noMentorProfile')}
              </h1>
              <p className="mt-4 text-base sm:text-xl text-[#475569] leading-relaxed max-w-xl mx-auto">
                {t('noProfileDescription')}
              </p>
              <Link
                href="/mentor/onboarding"
                className={`${primaryBtnClass} mt-8 inline-flex w-full sm:w-auto`}
              >
                {t('startOnboarding')}
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const isOnboarded = profile.onboardingStatus === 'COMPLETE' || profile.onboardingStatus === 'PENDING';
  const profileMetrics = profile as MentorProfile & {
    avgRating?: number | null;
    totalMenteesServed?: number | null;
  };

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12 lg:py-16">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            {/* Header */}
            <div className="bg-[#172033] px-5 sm:px-10 py-7 sm:py-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F97316]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#F97316]/30">
                    <span className="text-white font-extrabold text-base sm:text-lg">
                      {initials(profile.fullName)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                      {t('title')}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1">
                      <span className="text-sm text-white/70 font-medium truncate max-w-[220px] sm:max-w-none">
                        {profile.fullName}
                      </span>
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
                    className="bg-[#F97316] text-white px-5 sm:px-6 py-3 rounded-xl hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#F97316]/30 font-bold text-sm transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center flex-shrink-0"
                  >
                    <FiAlertCircle className="w-4 h-4" />
                    {t('continueOnboarding')}
                  </Link>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-10 lg:p-12">
              {error && (
                <div className="mb-8 bg-red-50/80 border border-red-200 text-red-700 px-5 sm:px-6 py-4 rounded-xl flex items-start sm:items-center gap-3 sm:gap-4 text-sm sm:text-base">
                  <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-red-500 mt-0.5 sm:mt-0" />
                  <span>{error}</span>
                </div>
              )}

              {isEditing ? (
                /* ── Edit Mode ─────────────────────────────────────────── */
                <div className="space-y-8 max-w-3xl mx-auto">
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-3 sm:mb-4">
                        {t('editingProfile')}
                      </span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#172033] tracking-tight">
                        {t('editProfile')}
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-[#94A3B8] hover:text-[#64748B] transition-colors p-2 hover:bg-[#FFFCF9] rounded-lg flex-shrink-0"
                      aria-label="Close editing"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>
                        {t('professionalTitle')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                          <FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#94A3B8]" />
                        </div>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className={`${inputClass} pl-12 sm:pl-14`}
                          placeholder={t('titlePlaceholder')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{t('company')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                          <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-[#94A3B8]" />
                        </div>
                        <input
                          type="text"
                          value={editData.company}
                          onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                          className={`${inputClass} pl-12 sm:pl-14`}
                          placeholder={t('companyPlaceholder')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{t('bio')}</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        rows={6}
                        className={textareaClass}
                        placeholder="Tell us about yourself, your background, and what drives you..."
                      />
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
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <select
                          value={selectedSkillId}
                          onChange={(e) => setSelectedSkillId(e.target.value)}
                          className="flex-1 h-12 sm:h-14 text-base border border-[#E5E7EB] rounded-xl px-4 sm:px-5 text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30"
                        >
                          <option value="">Select a skill</option>
                          {skills.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-3 sm:gap-4">
                          <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
                            className="flex-1 sm:flex-none sm:w-48 h-12 sm:h-14 text-base border border-[#E5E7EB] rounded-xl px-4 sm:px-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30"
                          >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                            <option value="EXPERT">Expert</option>
                          </select>
                          <button
                            onClick={handleAddSkill}
                            disabled={!selectedSkillId || savingSkills}
                            className="flex-shrink-0 bg-[#F97316] text-white px-5 sm:px-8 h-12 sm:h-14 rounded-xl hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#F97316]/30 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <FiPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">{savingSkills ? 'Adding…' : 'Add Skill'}</span>
                          </button>
                        </div>
                      </div>
                      {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                        <div className="space-y-3">
                          {profile.user.userSkills.map((us: UserSkill) => (
                            <div
                              key={us.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#FFFCF9] to-white rounded-xl px-4 sm:px-6 py-4 sm:py-5 border border-[#E5E7EB] hover:border-[#F97316]/30 transition-all duration-200 gap-4"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center flex-shrink-0">
                                  <FiAward className="w-5 h-5 text-[#F97316]" />
                                </div>
                                <span className="font-bold text-[#172033] text-base sm:text-lg truncate">
                                  {us.skill.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 w-full sm:w-auto">
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
                                  className="text-red-500 hover:text-red-700 p-2.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                  aria-label={`Remove ${us.skill.name}`}
                                >
                                  <FiTrash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 sm:py-12 border-2 border-dashed border-[#E5E7EB] rounded-2xl">
                          <FiAward className="w-10 h-10 sm:w-12 sm:h-12 text-[#94A3B8] mx-auto mb-4 opacity-50" />
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
                            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                              <FiGlobe className="w-5 h-5 sm:w-6 sm:h-6 text-[#94A3B8]" />
                            </div>
                            <select
                              value={(availability.timezone as string) || 'Africa/Douala'}
                              onChange={(e) =>
                                setAvailability({ ...availability, timezone: e.target.value })
                              }
                              className={`${inputClass} pl-12 sm:pl-14 appearance-none`}
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
                            {(availability.slots as AvailabilitySlot[]).map((slot, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-r from-[#F8FAFC] to-white p-4 sm:p-5 rounded-xl border border-[#E5E7EB] hover:border-[#F97316]/30 transition-all duration-200"
                              >
                                <div className="flex items-center justify-between mb-3 sm:hidden">
                                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                    {DAY_LABELS[slot.day as AvailabilityDay] || (slot.day as string).slice(0, 3)}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newSlots: AvailabilitySlot[] = availability.slots.filter(
                                        (_, i) => i !== index
                                      );
                                      setAvailability({ ...availability, slots: newSlots });
                                    }}
                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    aria-label="Remove time slot"
                                  >
                                    <FiTrash2 className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                                  <span className="hidden sm:flex flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] text-white text-sm font-bold items-center justify-center shadow-sm">
                                    {DAY_LABELS[slot.day as AvailabilityDay] || (slot.day as string).slice(0, 3)}
                                  </span>
                                  <select
                                    value={slot.day}
                                    onChange={(e) => {
                                      const newSlots: AvailabilitySlot[] = [...availability.slots];
                                      newSlots[index] = {
                                        ...newSlots[index],
                                        day: e.target.value as AvailabilityDay,
                                      };
                                      setAvailability({ ...availability, slots: newSlots });
                                    }}
                                    className="flex-1 sm:flex-none min-w-[120px] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30"
                                  >
                                    {DAYS.map((day) => (
                                      <option key={day} value={day}>
                                        {day}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-2 flex-1 sm:flex-none">
                                    <input
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) => {
                                        const newSlots: AvailabilitySlot[] = [...availability.slots];
                                        newSlots[index] = { ...newSlots[index], startTime: e.target.value };
                                        setAvailability({ ...availability, slots: newSlots });
                                      }}
                                      className="flex-1 sm:flex-none border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2.5 text-base bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30 sm:w-32"
                                    />
                                    <span className="text-[#64748B] font-medium text-sm flex-shrink-0">to</span>
                                    <input
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) => {
                                        const newSlots: AvailabilitySlot[] = [...availability.slots];
                                        newSlots[index] = { ...newSlots[index], endTime: e.target.value };
                                        setAvailability({ ...availability, slots: newSlots });
                                      }}
                                      className="flex-1 sm:flex-none border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2.5 text-base bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 hover:border-[#F97316]/30 sm:w-32"
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newSlots: AvailabilitySlot[] = availability.slots.filter(
                                        (_, i) => i !== index
                                      );
                                      setAvailability({ ...availability, slots: newSlots });
                                    }}
                                    className="hidden sm:flex ml-auto text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                    aria-label="Remove time slot"
                                  >
                                    <FiTrash2 className="w-6 h-6" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const newSlots: AvailabilitySlot[] = [
                              ...(Array.isArray(availability.slots) ? availability.slots : []),
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
                        className="mt-6 w-full sm:w-auto bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 font-bold text-base transition-all duration-200 flex items-center justify-center gap-3"
                      >
                        <FiSave className="w-5 h-5" />
                        {savingAvailability ? 'Saving…' : 'Save Availability'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 border-t border-[#E5E7EB] pt-8 sm:pt-10">
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
                /* ── View Mode ─────────────────────────────────────────── */
                <div className="space-y-8 sm:space-y-10 max-w-3xl mx-auto">
                  <div>
                    <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
                      Your profile
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                      {profile.fullName}
                    </h2>
                    <p className="mt-2 sm:mt-3 text-lg sm:text-xl text-[#475569]">{profile.title}</p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-[#FFF7ED] to-white border border-[#F97316]/20 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#64748B] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        <FiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F97316]" />
                        Rating
                      </div>
                      <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#172033]">
                        {profile.avgRating ? profile.avgRating.toFixed(1) : '—'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#64748B] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#172033]" />
                        Mentees
                      </div>
                      <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#172033]">
                        {profile.totalMenteesServed || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#64748B] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                        Status
                      </div>
                      <p className="mt-2 text-sm sm:text-lg font-extrabold text-[#172033]">
                        {isOnboarded ? 'Active' : 'In Progress'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:shadow-[#F97316]/10 transition-all duration-200">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#64748B] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        <FiShield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                        Verified
                      </div>
                      <p className="mt-2 text-sm sm:text-lg font-extrabold text-[#172033]">
                        {profile.isVerified ? 'Yes' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Detail Sections */}
                  <div className="border border-[#E5E7EB] rounded-2xl divide-y divide-[#E5E7EB] overflow-hidden">
                    <div className="p-5 sm:p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-[#F97316]" />
                        Profile Information
                      </h3>
                      <dl className="space-y-3 text-base">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-0.5 py-1.5">
                          <dt className="sm:w-40 text-[#64748B] font-medium text-sm sm:text-base">Full Name</dt>
                          <dd className="text-[#172033] font-semibold">{profile.fullName}</dd>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-0.5 py-1.5">
                          <dt className="sm:w-40 text-[#64748B] font-medium text-sm sm:text-base">Title</dt>
                          <dd className="text-[#172033]">{profile.title}</dd>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-0.5 py-1.5">
                          <dt className="sm:w-40 text-[#64748B] font-medium text-sm sm:text-base">Company</dt>
                          <dd className="text-[#172033]">{profile.company || '—'}</dd>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-0.5 py-1.5">
                          <dt className="sm:w-40 text-[#64748B] font-medium text-sm sm:text-base">Bio</dt>
                          <dd className="text-[#172033]">{profile.bio || '—'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="p-5 sm:p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiTrendingUp className="w-4 h-4 text-[#F97316]" />
                        Experience
                      </h3>
                      <p className="text-[#172033] whitespace-pre-wrap leading-relaxed">{profile.experience || '—'}</p>
                      <p className="mt-4 text-sm sm:text-base text-[#64748B]">
                        <span className="font-medium text-[#172033]">Areas of Expertise: </span>
                        {profile.areasOfExpertise.length > 0 ? profile.areasOfExpertise.join(', ') : '—'}
                      </p>
                    </div>

                    <div className="p-5 sm:p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiAward className="w-4 h-4 text-[#F97316]" />
                        Skills
                      </h3>
                      {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {profile.user.userSkills.map((us: UserSkill) => (
                            <span
                              key={us.id}
                              className="bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/20 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-all duration-200 cursor-default"
                            >
                              {us.skill.name} · {us.level}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#64748B]">No skills added</p>
                      )}
                    </div>

                    {/* ✅ Fixed Availability Section - View Mode */}
                    <div className="p-5 sm:p-8 hover:bg-[#FFFCF9]/50 transition-colors duration-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-[#F97316]" />
                        {t('availabilityHeading')}
                      </h3>
                      <p className="text-sm sm:text-base text-[#64748B] mb-3">
                        {t('timezoneLabel')}{' '}
                        <span className="text-[#172033] font-semibold">
                          {profile.availability?.timezone ? String(profile.availability.timezone) : '—'}
                        </span>
                      </p>
                      
                      {(() => {
                        // ✅ Get slots from profile.availability
                        let slots: AvailabilitySlot[] = [];
                        if (profile.availability) {
                          if (typeof profile.availability === 'object' && 'slots' in profile.availability) {
                            slots = Array.isArray(profile.availability.slots) ? profile.availability.slots : [];
                          } else if (typeof profile.availability === 'string') {
                            try {
                              const parsed = JSON.parse(profile.availability);
                              slots = Array.isArray(parsed?.slots) ? parsed.slots : [];
                            } catch {
                              slots = [];
                            }
                          }
                        }
                        
                        if (slots.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-2">
                              {slots.map((slot: AvailabilitySlot, i: number) => {
                                const day = String(slot.day || '');
                                const start = String(slot.startTime || '');
                                const end = String(slot.endTime || '');
                                if (!day || !start || !end) return null;
                                return (
                                  <span
                                    key={i}
                                    className="bg-[#F8FAFC] border border-[#E5E7EB] px-3.5 sm:px-4 py-2 rounded-lg text-sm sm:text-base text-[#172033] hover:border-[#F97316]/30 hover:bg-[#FFF7ED] transition-all duration-200"
                                  >
                                    {getDayLabel(day)} {start}–{end}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        } else {
                          return <p className="text-[#64748B]">{t('noAvailabilitySlots')}</p>;
                        }
                      })()}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex justify-end border-t border-[#E5E7EB] pt-8 sm:pt-10">
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