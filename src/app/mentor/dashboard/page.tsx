'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { mentorApi, apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { MentorProfile, UserSkill, Skill, SkillLevel } from '@/lib/types';
import Link from 'next/link';
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
  FiChevronRight
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
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const [availability, setAvailability] = useState<Record<string, unknown>>({ 
    timezone: 'Africa/Douala', 
    slots: [] as Array<{ day: string; startTime: string; endTime: string }> 
  });
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const tokenRef = useRef<string | null>(null);

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
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    tokenRef.current = token;

    void (async () => {
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
        setAvailability((res.data.availability as Record<string, unknown>) || {
          timezone: 'Africa/Douala',
          slots: [],
        });

        try {
          setLoadingSkills(true);
          const skillsRes = await apiClient.get<Skill[]>('/mentor/applications/skills', token);
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
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await mentorApi.updateProfile(token, editData);
      setProfile(res.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId || !tokenRef.current) return;
    try {
      setSavingSkills(true);
      setError(null);
      await mentorApi.addSkill(tokenRef.current, {
        skillId: selectedSkillId,
        level: selectedLevel,
      });
      const updated = await mentorApi.getMyProfile(tokenRef.current);
      setProfile(updated.data);
      setSelectedSkillId('');
      toast.success('Skill added successfully');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to add skill');
      toast.error('Failed to add skill');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!tokenRef.current) return;
    try {
      setSavingSkills(true);
      setError(null);
      await mentorApi.removeSkill(tokenRef.current, skillId);
      const updated = await mentorApi.getMyProfile(tokenRef.current);
      setProfile(updated.data);
      toast.success('Skill removed');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to remove skill');
      toast.error('Failed to remove skill');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleUpdateSkillLevel = async (skillId: string, level: SkillLevel) => {
    if (!tokenRef.current) return;
    try {
      setSavingSkills(true);
      setError(null);
      await mentorApi.updateSkill(tokenRef.current, skillId, { level });
      const updated = await mentorApi.getMyProfile(tokenRef.current);
      setProfile(updated.data);
      toast.success('Skill level updated');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update skill level');
      toast.error('Failed to update skill level');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!tokenRef.current) return;
    try {
      setSavingAvailability(true);
      setError(null);
      const updated = await mentorApi.updateAvailability(tokenRef.current, {
        availability,
      });
      setProfile(updated.data);
      toast.success('Availability saved');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update availability');
      toast.error('Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  const inputClass =
    'w-full h-11 sm:h-12 border border-[#E2E5EB] rounded-lg px-3 sm:px-4 text-[#12172B] text-sm sm:text-base placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors';
  const labelClass = 'block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478] mb-1.5 sm:mb-2';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-[#E2E5EB] border-t-[#E8A33D] animate-spin" />
          <span className="text-sm sm:text-base text-[#5B6478]">Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,27,51,0.15)] border border-[#E2E5EB] p-8 sm:p-12 text-center max-w-sm sm:max-w-lg w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#101B33]/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FiUser className="w-8 h-8 sm:w-10 sm:h-10 text-[#101B33]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#101B33]">No Mentor Profile</h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#5B6478]">
            You haven&apos;t created a mentor profile yet. Start your journey to become a mentor today.
          </p>
          <Link
            href="/mentor/onboarding"
            className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-[#101B33] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#1B2A4D] font-medium transition-colors text-sm sm:text-base"
          >
            Start Onboarding
            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,27,51,0.15)] border border-[#E2E5EB] overflow-hidden">
          {/* Header */}
          <div className="bg-[#101B33] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-[#E8A33D]/20 flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#E8A33D]" />
                </div>
                <div>
                  <h1 className="font-serif text-lg sm:text-xl md:text-2xl text-white">Mentor Dashboard</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 sm:mt-1">
                    <span className="text-xs sm:text-sm text-white/60 truncate max-w-[120px] sm:max-w-none">{profile.fullName}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                    <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
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
                  className="bg-[#E8A33D] text-[#101B33] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#d4902e] font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  Continue Onboarding
                </Link>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {error && (
              <div className="mb-4 sm:mb-6 bg-[#B3483F]/5 border border-[#B3483F]/30 text-[#8f3a33] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 sm:gap-3">
                <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between border-b border-[#E2E5EB] pb-3 sm:pb-4">
                  <h2 className="font-serif text-xl sm:text-2xl text-[#101B33]">Edit Profile</h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-[#9AA1B0] hover:text-[#5B6478] transition-colors p-1"
                  >
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-5">
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
                      className="w-full border border-[#E2E5EB] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Professional Experience</label>
                    <textarea
                      value={editData.experience}
                      onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                      rows={4}
                      className="w-full border border-[#E2E5EB] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors resize-none"
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
                    <p className="mt-1.5 text-xs sm:text-sm text-[#9AA1B0]">Separate multiple areas with commas.</p>
                  </div>

                  {/* Skills Section */}
                  <div className="border-t border-[#E2E5EB] pt-4 sm:pt-5">
                    <h3 className="font-serif text-lg sm:text-xl text-[#101B33] mb-3 sm:mb-4 flex items-center gap-2">
                      <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8A33D]" />
                      Skills
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <select
                        value={selectedSkillId}
                        onChange={(e) => setSelectedSkillId(e.target.value)}
                        className="flex-1 h-10 sm:h-11 border border-[#E2E5EB] rounded-lg px-3 text-sm text-[#12172B] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
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
                        className="w-full sm:w-36 h-10 sm:h-11 border border-[#E2E5EB] rounded-lg px-3 text-sm text-[#12172B] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                      <button
                        onClick={handleAddSkill}
                        disabled={!selectedSkillId || savingSkills}
                        className="w-full sm:w-auto bg-[#101B33] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1B2A4D] disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-1.5 text-sm"
                      >
                        <FiPlus className="w-4 h-4" />
                        {savingSkills ? 'Adding…' : 'Add'}
                      </button>
                    </div>
                    {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                      <div className="space-y-2">
                        {profile.user.userSkills.map((us: UserSkill) => (
                          <div
                            key={us.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#F5F6F8] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E2E5EB] gap-2 sm:gap-0"
                          >
                            <span className="font-medium text-[#12172B] text-sm sm:text-base">{us.skill.name}</span>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <select
                                value={us.level}
                                onChange={(e) => handleUpdateSkillLevel(us.id, e.target.value as SkillLevel)}
                                className="flex-1 sm:flex-none border border-[#E2E5EB] rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white text-[#12172B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                              >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                                <option value="EXPERT">Expert</option>
                              </select>
                              <button
                                onClick={() => handleRemoveSkill(us.id)}
                                className="text-[#B3483F] hover:text-[#8f3a33] p-1.5 sm:p-2 hover:bg-[#B3483F]/10 rounded-lg transition-colors"
                              >
                                <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#9AA1B0]">No skills added yet.</p>
                    )}
                  </div>

                  {/* Availability Section */}
                  <div className="border-t border-[#E2E5EB] pt-4 sm:pt-5">
                    <h3 className="font-serif text-lg sm:text-xl text-[#101B33] mb-3 sm:mb-4 flex items-center gap-2">
                      <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8A33D]" />
                      Availability
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className={labelClass}>Timezone</label>
                        <select
                          value={(availability.timezone as string) || 'Africa/Douala'}
                          onChange={(e) =>
                            setAvailability({ ...availability, timezone: e.target.value })
                          }
                          className="w-full h-10 sm:h-11 border border-[#E2E5EB] rounded-lg px-3 text-sm text-[#12172B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors bg-white"
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
                      {Array.isArray(availability.slots) && (
                        <div className="space-y-2 sm:space-y-3">
                          {(availability.slots as Array<{ day: string; startTime: string; endTime: string }>).map(
                            (slot, index) => (
                              <div
                                key={index}
                                className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center bg-[#F5F6F8] p-3 sm:p-4 rounded-xl border border-[#E2E5EB]"
                              >
                                <select
                                  value={slot.day}
                                  onChange={(e) => {
                                    const newSlots = [...(availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                                    newSlots[index] = { ...newSlots[index], day: e.target.value };
                                    setAvailability({ ...availability, slots: newSlots });
                                  }}
                                  className="flex-1 sm:flex-none h-9 sm:h-10 border border-[#E2E5EB] rounded-lg px-2 sm:px-3 text-sm bg-white text-[#12172B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                                >
                                  {DAYS.map((day) => (
                                    <option key={day} value={day}>{DAY_LABELS[day]}</option>
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
                                  className="w-full sm:w-28 h-9 sm:h-10 border border-[#E2E5EB] rounded-lg px-2 sm:px-3 text-sm bg-white text-[#12172B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                                />
                                <span className="text-[#12172B] font-medium text-sm text-center sm:text-left">to</span>
                                <input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => {
                                    const newSlots = [...(availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                                    newSlots[index] = { ...newSlots[index], endTime: e.target.value };
                                    setAvailability({ ...availability, slots: newSlots });
                                  }}
                                  className="w-full sm:w-28 h-9 sm:h-10 border border-[#E2E5EB] rounded-lg px-2 sm:px-3 text-sm bg-white text-[#12172B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                                />
                                <button
                                  onClick={() => {
                                    const newSlots = (availability.slots as Array<{ day: string; startTime: string; endTime: string }>).filter((_, i) => i !== index);
                                    setAvailability({ ...availability, slots: newSlots });
                                  }}
                                  className="text-[#B3483F] hover:text-[#8f3a33] p-1.5 sm:p-2 hover:bg-[#B3483F]/10 rounded-lg transition-colors flex items-center justify-center"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const newSlots = [
                            ...(Array.isArray(availability.slots) ? (availability.slots as Array<{ day: string; startTime: string; endTime: string }>) : []),
                            { day: 'MONDAY', startTime: '09:00', endTime: '12:00' },
                          ];
                          setAvailability({ ...availability, slots: newSlots });
                        }}
                        className="text-[#101B33] hover:text-[#1B2A4D] font-medium flex items-center gap-1.5 sm:gap-2 transition-colors text-sm"
                      >
                        <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        Add time slot
                      </button>
                    </div>
                    <div className="mt-3 sm:mt-4">
                      <button
                        onClick={handleSaveAvailability}
                        disabled={savingAvailability}
                        className="w-full sm:w-auto bg-[#2F9E68] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-[#268255] disabled:opacity-50 font-medium transition-colors text-sm"
                      >
                        {savingAvailability ? 'Saving…' : 'Save Availability'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#E2E5EB]">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#101B33] text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-[#1B2A4D] disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <FiSave className="w-4 h-4 sm:w-5 sm:h-5" />
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:w-auto border border-[#E2E5EB] px-4 sm:px-6 py-2.5 rounded-lg hover:bg-[#F5F6F8] font-medium transition-colors text-[#12172B] text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6 sm:space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="bg-[#F5F6F8] rounded-xl p-3 sm:p-4 border border-[#E2E5EB] text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-[#5B6478] text-[9px] sm:text-xs font-medium uppercase tracking-wider">
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-[#E8A33D]" />
                      Rating
                    </div>
                    <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-semibold text-[#101B33]">
                      {profile.avgRating ? profile.avgRating.toFixed(1) : '—'}
                    </p>
                  </div>
                  <div className="bg-[#F5F6F8] rounded-xl p-3 sm:p-4 border border-[#E2E5EB] text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-[#5B6478] text-[9px] sm:text-xs font-medium uppercase tracking-wider">
                      <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-[#101B33]" />
                      Mentees
                    </div>
                    <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-semibold text-[#101B33]">
                      {profile.totalMenteesServed || 0}
                    </p>
                  </div>
                  <div className="bg-[#F5F6F8] rounded-xl p-3 sm:p-4 border border-[#E2E5EB] text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-[#5B6478] text-[9px] sm:text-xs font-medium uppercase tracking-wider">
                      <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                      Status
                    </div>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-semibold text-[#101B33]">
                      {isOnboarded ? 'Active' : 'In Progress'}
                    </p>
                  </div>
                  <div className="bg-[#F5F6F8] rounded-xl p-3 sm:p-4 border border-[#E2E5EB] text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-[#5B6478] text-[9px] sm:text-xs font-medium uppercase tracking-wider">
                      <FiShield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      Verified
                    </div>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-semibold text-[#101B33]">
                      {profile.isVerified ? 'Yes' : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl text-[#101B33] mb-3 sm:mb-4 flex items-center gap-2">
                      <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8A33D]" />
                      Profile Information
                    </h3>
                    <dl className="space-y-2 sm:space-y-3">
                      <div className="flex flex-wrap gap-1">
                        <dt className="w-24 sm:w-32 text-xs sm:text-sm text-[#5B6478] font-medium">Full Name</dt>
                        <dd className="text-xs sm:text-sm text-[#12172B] font-medium">{profile.fullName}</dd>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <dt className="w-24 sm:w-32 text-xs sm:text-sm text-[#5B6478] font-medium">Title</dt>
                        <dd className="text-xs sm:text-sm text-[#12172B]">{profile.title}</dd>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <dt className="w-24 sm:w-32 text-xs sm:text-sm text-[#5B6478] font-medium">Company</dt>
                        <dd className="text-xs sm:text-sm text-[#12172B]">{profile.company || '—'}</dd>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <dt className="w-24 sm:w-32 text-xs sm:text-sm text-[#5B6478] font-medium">Bio</dt>
                        <dd className="text-xs sm:text-sm text-[#12172B]">{profile.bio || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg sm:text-xl text-[#101B33] mb-3 sm:mb-4 flex items-center gap-2">
                      <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8A33D]" />
                      Experience &amp; Expertise
                    </h3>
                    <dl className="space-y-2 sm:space-y-3">
                      <div>
                        <dt className="text-xs sm:text-sm text-[#5B6478] font-medium">Experience</dt>
                        <dd className="text-xs sm:text-sm text-[#12172B] whitespace-pre-wrap">{profile.experience || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm text-[#5B6478] font-medium">Areas of Expertise</dt>
                        <dd className="text-xs sm:text-sm text-[#12172B]">
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
                  <h3 className="font-serif text-lg sm:text-xl text-[#101B33] mb-3 sm:mb-4 flex items-center gap-2">
                    <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8A33D]" />
                    Skills
                  </h3>
                  {profile.user?.userSkills && profile.user.userSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {profile.user.userSkills.map((us: UserSkill) => (
                        <span
                          key={us.id}
                          className="bg-[#E8A33D]/10 text-[#C67F1E] border border-[#E8A33D]/30 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                        >
                          {us.skill.name} · {us.level}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#9AA1B0]">No skills added yet.</p>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-[#101B33] mb-3 sm:mb-4 flex items-center gap-2">
                    <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8A33D]" />
                    Availability
                  </h3>
                  <div className="bg-[#F5F6F8] rounded-xl p-3 sm:p-4 border border-[#E2E5EB]">
                    {Array.isArray(profile.availability?.slots) && (profile.availability?.slots as Array<{ day: string; startTime: string; endTime: string }>).length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {(profile.availability?.slots as Array<{ day: string; startTime: string; endTime: string }>).map((slot, i) => (
                            <span
                              key={i}
                              className="bg-white border border-[#E2E5EB] px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm text-[#12172B]"
                            >
                              {DAY_LABELS[slot.day] || slot.day} {slot.startTime}–{slot.endTime}
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-[#5B6478]">
                          Timezone: {String(profile.availability?.timezone || '—')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[#9AA1B0]">No availability slots set.</p>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-3 sm:pt-4 border-t border-[#E2E5EB]">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto bg-[#101B33] text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-[#1B2A4D] font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
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