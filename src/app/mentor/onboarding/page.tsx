'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mentorApi, apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { MentorProfile, Skill, SkillLevel, UserSkill } from '@/lib/types';

const STEPS = [
  { id: 1, title: 'Introduction', description: 'Welcome to mentor onboarding' },
  { id: 2, title: 'Professional Information', description: 'Tell us about yourself' },
  { id: 3, title: 'Skills & Expertise', description: 'What can you teach?' },
  { id: 4, title: 'Experience', description: 'Your background' },
  { id: 5, title: 'Availability', description: 'When are you available?' },
  { id: 6, title: 'Review', description: 'Review your information' },
  { id: 7, title: 'Complete', description: 'Onboarding complete' },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface OnboardingData {
  fullName: string;
  title: string;
  company: string;
  bio: string;
  experience: string;
  areasOfExpertise: string[];
  skills: Array<{ id: string; name: string; level: SkillLevel }>;
  availability: Record<string, unknown>;
}

const initialData: OnboardingData = {
  fullName: '',
  title: '',
  company: '',
  bio: '',
  experience: '',
  areasOfExpertise: [],
  skills: [],
  availability: {
    timezone: 'Africa/Douala',
    slots: [
      { day: 'MONDAY', startTime: '09:00', endTime: '12:00' },
      { day: 'WEDNESDAY', startTime: '14:00', endTime: '17:00' },
    ],
  },
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

const LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
} as unknown as Record<SkillLevel, string>;

export default function MentorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const [saving, setSaving] = useState(false);
  const tokenRef = useRef<string | null>(null);

  const initializeData = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const profileRes = await mentorApi.getMyProfile(token).catch(() => null);
      let skillsData: Skill[] = [];
      try {
        const skillsRes = await apiClient.get<Skill[]>('/mentor/applications/skills', token);
        skillsData = skillsRes.data;
      } catch {
        // skills loading failed, use empty array
      }

      if (profileRes) {
        const existing = profileRes.data;
        setProfile(existing);
        setData({
          fullName: existing.fullName || '',
          title: existing.title || '',
          company: existing.company || '',
          bio: existing.bio || '',
          experience: existing.experience || '',
          areasOfExpertise: existing.areasOfExpertise || [],
          skills: (existing.user?.userSkills || []).map((us: UserSkill) => ({
            id: us.skill.id,
            name: us.skill.name,
            level: us.level,
          })),
          availability: (existing.availability as Record<string, unknown>) || initialData.availability,
        });
        if (existing.onboardingStatus === 'COMPLETE' || existing.onboardingStatus === 'PENDING') {
          setCurrentStep(7);
        }
      }

      setSkills(skillsData);
    } catch {
      // ignore initialization errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    tokenRef.current = token;
    initializeData(token);
  }, [router, initializeData]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setError(null);
    // Validate current step before proceeding
    if (currentStep === 2) {
      if (!data.fullName.trim() || !data.title.trim()) {
        setError('Please fill in your full name and professional title');
        return;
      }
    }
    if (currentStep === 3) {
      if (data.skills.length === 0) {
        setError('Please add at least one skill before proceeding');
        return;
      }
    }
    if (currentStep === 4) {
      if (!data.experience.trim()) {
        setError('Please describe your professional experience');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId || !tokenRef.current) return;
    try {
      setSaving(true);
      setError(null);
      await mentorApi.addSkill(tokenRef.current, {
        skillId: selectedSkillId,
        level: selectedLevel,
      });
      const skill = skills.find((s) => s.id === selectedSkillId);
      if (skill) {
        setData((prev) => ({
          ...prev,
          skills: [...prev.skills, { id: skill.id, name: skill.name, level: selectedLevel }],
        }));
      }
      setSelectedSkillId('');
      setSkillSearch('');
      toast.success('Skill added');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!tokenRef.current) return;
    try {
      setSaving(true);
      setError(null);
      await mentorApi.removeSkill(tokenRef.current, skillId);
      setData((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.id !== skillId),
      }));
      toast.success('Skill removed');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to remove skill');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSkillLevel = async (skillId: string, level: SkillLevel) => {
    if (!tokenRef.current) return;
    try {
      setSaving(true);
      setError(null);
      await mentorApi.updateSkill(tokenRef.current, skillId, { level });
      setData((prev) => ({
        ...prev,
        skills: prev.skills.map((s) => (s.id === skillId ? { ...s, level } : s)),
      }));
      toast.success('Skill level updated');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update skill level');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvailability = async () => {
    if (!tokenRef.current) return;
    try {
      setSaving(true);
      setError(null);
      await mentorApi.updateAvailability(tokenRef.current, { availability: data.availability });
      toast.success('Availability saved');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!tokenRef.current) return;
    try {
      setLoading(true);
      setError(null);
      if (!profile) {
        await mentorApi.createProfile(tokenRef.current, {
          fullName: data.fullName,
          title: data.title,
          company: data.company,
          bio: data.bio,
          experience: data.experience,
          areasOfExpertise: data.areasOfExpertise,
        });
      } else {
        await mentorApi.updateProfile(tokenRef.current, {
          title: data.title,
          company: data.company,
          bio: data.bio,
          experience: data.experience,
          areasOfExpertise: data.areasOfExpertise,
        });
      }
      await mentorApi.updateAvailability(tokenRef.current, { availability: data.availability });
      await mentorApi.submitOnboarding(tokenRef.current, { confirmed: true });
      toast.success('Onboarding submitted for review');
      setCurrentStep(7);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to submit onboarding');
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()));
  const visibleSteps = STEPS.filter((s) => s.id <= 6);

  const inputClass =
    'w-full h-12 border border-[#E2E5EB] rounded-lg px-4 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478] mb-2';

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C67F1E]">
                Before you begin
              </span>
              <h2 className="mt-3 font-serif text-4xl text-[#101B33] leading-[1.1]">
                Welcome to MentorAura
              </h2>
              <p className="mt-4 text-[#5B6478] text-lg leading-relaxed max-w-xl">
                Thank you for choosing to become a mentor. This process builds the profile
                mentees will see when they look for someone to learn from &mdash; and book a
                session with.
              </p>
            </div>
            <div className="border border-[#E2E5EB] rounded-xl overflow-hidden">
              {visibleSteps
                .filter((s) => s.id > 1)
                .map((step, i, arr) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 px-6 py-4 ${
                      i < arr.length - 1 ? 'border-b border-[#E2E5EB]' : ''
                    }`}
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#101B33] text-[#E8A33D] text-xs font-semibold flex items-center justify-center">
                      {step.id - 1}
                    </span>
                    <span className="text-[#12172B] font-medium">{step.title}</span>
                    <span className="ml-auto text-sm text-[#9AA1B0] hidden sm:block">
                      {step.description}
                    </span>
                  </div>
                ))}
            </div>
            <p className="text-sm text-[#9AA1B0]">
              Takes about 5&ndash;10 minutes. Your progress is saved as you go, so you can pick
              up later.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C67F1E]">
                Step 2 of 6
              </span>
              <h2 className="mt-3 font-serif text-4xl text-[#101B33]">Professional information</h2>
              <p className="mt-3 text-[#5B6478]">Tell mentees who you are and what you do.</p>
            </div>
            <div className="space-y-5 max-w-xl">
              <div>
                <label className={labelClass}>Full name *</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => updateData({ fullName: e.target.value })}
                  required
                  className={inputClass}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className={labelClass}>Professional title *</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateData({ title: e.target.value })}
                  required
                  className={inputClass}
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div>
                <label className={labelClass}>Company</label>
                <input
                  type="text"
                  value={data.company}
                  onChange={(e) => updateData({ company: e.target.value })}
                  className={inputClass}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  value={data.bio}
                  onChange={(e) => updateData({ bio: e.target.value })}
                  rows={5}
                  className="w-full border border-[#E2E5EB] rounded-lg px-4 py-3 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors resize-none"
                  placeholder="Tell us about yourself, your background, and what drives you..."
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C67F1E]">
                Step 3 of 6
              </span>
              <h2 className="mt-3 font-serif text-4xl text-[#101B33]">Skills &amp; expertise</h2>
              <p className="mt-3 text-[#5B6478] max-w-xl">
                Add the skills you can mentor others in, and rate your proficiency in each.
              </p>
              {data.skills.length === 0 && (
                <div className="mt-2 p-4 bg-[#E8A33D]/10 border border-[#E8A33D]/30 rounded-lg">
                  <p className="text-sm text-[#C67F1E]">
                    <span className="font-semibold">⚠️ Required:</span> Please add at least one skill to continue.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {data.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between bg-[#F5F6F8] rounded-xl px-5 py-4 border border-[#E2E5EB]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 bg-[#101B33] rounded-lg flex items-center justify-center text-[#E8A33D] font-semibold text-sm">
                      {skill.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-[#12172B] truncate">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <select
                      value={skill.level}
                      onChange={(e) => handleUpdateSkillLevel(skill.id, e.target.value as SkillLevel)}
                      className="border border-[#E2E5EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-[#B3483F] hover:text-[#8f3a33] p-2 hover:bg-[#B3483F]/10 rounded-lg transition-colors"
                      title="Remove skill"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {data.skills.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[#E2E5EB] rounded-xl">
                  <p className="text-[#9AA1B0]">No skills added yet. Search and add skills below.</p>
                </div>
              )}
            </div>

            <div className="border-t border-[#E2E5EB] pt-6">
              <label className={labelClass}>Add a skill</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className={inputClass}
                    placeholder="Search skills..."
                  />
                  {filteredSkills.length > 0 && skillSearch && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-[#E2E5EB] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          onClick={() => {
                            setSelectedSkillId(skill.id);
                            setSkillSearch('');
                          }}
                          className={`block w-full text-left px-4 py-3 hover:bg-[#F5F6F8] transition-colors ${
                            selectedSkillId === skill.id ? 'bg-[#E8A33D]/10' : ''
                          }`}
                        >
                          <span className="font-medium text-[#12172B]">{skill.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
                  className="border border-[#E2E5EB] rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button
                  onClick={handleAddSkill}
                  disabled={!selectedSkillId || saving}
                  className="bg-[#101B33] text-white px-6 py-2 rounded-lg hover:bg-[#1B2A4D] disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {saving ? 'Adding…' : 'Add'}
                </button>
              </div>
              {selectedSkillId && (
                <p className="mt-2 text-sm text-[#2F9E68]">
                  Selected: {skills.find((s) => s.id === selectedSkillId)?.name}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C67F1E]">
                Step 4 of 6
              </span>
              <h2 className="mt-3 font-serif text-4xl text-[#101B33]">Experience</h2>
              <p className="mt-3 text-[#5B6478] max-w-xl">
                Share your professional experience and areas of expertise.
              </p>
            </div>
            <div className="space-y-5 max-w-xl">
              <div>
                <label className={labelClass}>Professional experience *</label>
                <textarea
                  value={data.experience}
                  onChange={(e) => updateData({ experience: e.target.value })}
                  rows={8}
                  className="w-full border border-[#E2E5EB] rounded-lg px-4 py-3 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors resize-none"
                  placeholder="Describe your professional experience, achievements, and background. Include relevant work history, projects, and accomplishments."
                />
              </div>
              <div>
                <label className={labelClass}>Areas of expertise</label>
                <input
                  type="text"
                  value={data.areasOfExpertise.join(', ')}
                  onChange={(e) =>
                    updateData({
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
                {data.areasOfExpertise.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.areasOfExpertise.map((area) => (
                      <span
                        key={area}
                        className="bg-[#101B33]/5 text-[#101B33] border border-[#101B33]/10 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C67F1E]">
                Step 5 of 6
              </span>
              <h2 className="mt-3 font-serif text-4xl text-[#101B33]">Availability</h2>
              <p className="mt-3 text-[#5B6478] max-w-xl">
                Specify when you&apos;re available for mentorship sessions.
              </p>
            </div>
            <div className="space-y-6 max-w-2xl">
              <div className="max-w-xs">
                <label className={labelClass}>Timezone *</label>
                <select
                  value={data.availability.timezone as string}
                  onChange={(e) =>
                    updateData({
                      availability: { ...data.availability, timezone: e.target.value },
                    })
                  }
                  className="w-full h-12 border border-[#E2E5EB] rounded-lg px-4 text-[#12172B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors bg-white"
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
              <div>
                <label className={labelClass}>Time slots</label>
                {Array.isArray(data.availability.slots) && (
                  <div className="space-y-3">
                    {(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).map(
                      (slot, index) => (
                        <div
                          key={index}
                          className="flex flex-wrap gap-3 items-center bg-[#F5F6F8] p-4 rounded-xl border border-[#E2E5EB]"
                        >
                          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#101B33] text-[#E8A33D] text-xs font-semibold flex items-center justify-center">
                            {DAY_LABELS[slot.day] || slot.day.slice(0, 3)}
                          </span>
                          <select
                            value={slot.day}
                            onChange={(e) => {
                              const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                              newSlots[index] = { ...newSlots[index], day: e.target.value };
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="border border-[#E2E5EB] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                          >
                            <option value="MONDAY">Monday</option>
                            <option value="TUESDAY">Tuesday</option>
                            <option value="WEDNESDAY">Wednesday</option>
                            <option value="THURSDAY">Thursday</option>
                            <option value="FRIDAY">Friday</option>
                            <option value="SATURDAY">Saturday</option>
                            <option value="SUNDAY">Sunday</option>
                          </select>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => {
                              const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                              newSlots[index] = { ...newSlots[index], startTime: e.target.value };
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="border border-[#E2E5EB] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                          />
                          <span className="text-[#9AA1B0] font-medium">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => {
                              const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                              newSlots[index] = { ...newSlots[index], endTime: e.target.value };
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="border border-[#E2E5EB] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]"
                          />
                          <button
                            onClick={() => {
                              const newSlots = (data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).filter((_, i) => i !== index);
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="ml-auto text-[#B3483F] hover:text-[#8f3a33] p-2 hover:bg-[#B3483F]/10 rounded-lg transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    const newSlots = [
                      ...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>),
                      { day: 'MONDAY', startTime: '09:00', endTime: '12:00' },
                    ];
                    updateData({ availability: { ...data.availability, slots: newSlots } });
                  }}
                  className="mt-4 text-[#101B33] hover:text-[#1B2A4D] font-medium flex items-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add time slot
                </button>
              </div>
              <button
                onClick={handleUpdateAvailability}
                disabled={saving}
                className="bg-[#2F9E68] text-white px-6 py-3 rounded-lg hover:bg-[#268255] disabled:opacity-50 font-medium transition-colors"
              >
                {saving ? 'Saving…' : 'Save availability'}
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C67F1E]">
                Step 6 of 6
              </span>
              <h2 className="mt-3 font-serif text-4xl text-[#101B33]">Review your profile</h2>
              <p className="mt-3 text-[#5B6478] max-w-xl">
                Take one more look before you submit for approval.
              </p>
            </div>
            <div className="border border-[#E2E5EB] rounded-xl divide-y divide-[#E2E5EB]">
              <div className="p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9AA1B0] mb-4">
                  Professional information
                </h3>
                <dl className="space-y-3">
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="w-32 text-[#5B6478] font-medium text-sm">Full name</dt>
                    <dd className="text-[#12172B]">{data.fullName || '—'}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="w-32 text-[#5B6478] font-medium text-sm">Title</dt>
                    <dd className="text-[#12172B]">{data.title || '—'}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="w-32 text-[#5B6478] font-medium text-sm">Company</dt>
                    <dd className="text-[#12172B]">{data.company || '—'}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="w-32 text-[#5B6478] font-medium text-sm">Bio</dt>
                    <dd className="text-[#12172B]">{data.bio || '—'}</dd>
                  </div>
                </dl>
              </div>
              <div className="p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9AA1B0] mb-4">
                  Experience
                </h3>
                <p className="text-[#12172B] whitespace-pre-wrap">{data.experience || '—'}</p>
                <p className="text-[#5B6478] mt-3 text-sm">
                  <span className="font-medium text-[#12172B]">Areas of expertise: </span>
                  {data.areasOfExpertise.join(', ') || '—'}
                </p>
              </div>
              <div className="p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9AA1B0] mb-4">
                  Skills
                </h3>
                {data.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="bg-[#E8A33D]/10 text-[#C67F1E] border border-[#E8A33D]/30 px-4 py-1.5 rounded-full text-sm font-medium"
                      >
                        {skill.name} · {LEVEL_LABELS[skill.level] ?? skill.level}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#9AA1B0]">No skills added</p>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9AA1B0] mb-4">
                  Availability
                </h3>
                <p className="text-sm text-[#5B6478] mb-3">
                  Timezone: <span className="text-[#12172B] font-medium">{String(data.availability.timezone)}</span>
                </p>
                {Array.isArray(data.availability.slots) && (
                  <div className="flex flex-wrap gap-2">
                    {(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).map(
                      (slot, i) => (
                        <span
                          key={i}
                          className="bg-[#F5F6F8] border border-[#E2E5EB] px-3 py-1.5 rounded-lg text-sm text-[#12172B]"
                        >
                          {DAY_LABELS[slot.day] || slot.day} {slot.startTime}–{slot.endTime}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#101B33] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-[#E8A33D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-4xl text-[#101B33]">Onboarding complete</h2>
            <p className="text-[#5B6478] max-w-lg mx-auto text-lg leading-relaxed">
              Your mentor profile has been submitted for review. We&apos;ll notify you once it&apos;s
              approved. In the meantime, you can access your mentor dashboard.
            </p>
            <button
              onClick={() => {
                window.location.href = '/mentor/dashboard';
              }}
              className="bg-[#101B33] text-white px-8 py-3 rounded-lg hover:bg-[#1B2A4D] font-medium transition-colors"
            >
              Go to mentor dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <div className="flex items-center gap-3 text-[#5B6478]">
          <span className="w-5 h-5 rounded-full border-2 border-[#E2E5EB] border-t-[#E8A33D] animate-spin" />
          <span className="text-lg">Loading…</span>
        </div>
      </div>
    );
  }

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

      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,27,51,0.15)] overflow-hidden lg:flex border border-[#E2E5EB]">
          {currentStep < 7 && (
            <aside className="hidden lg:flex lg:w-72 flex-shrink-0 flex-col bg-[#101B33] px-8 py-10">
              <div className="mb-10">
                <span className="block text-[11px] uppercase tracking-[0.22em] text-[#E8A33D] font-semibold">
                  Mentor Onboarding
                </span>
                <h1 className="mt-2 font-serif text-2xl text-white">MentorAura</h1>
              </div>
              <ol className="space-y-7">
                {visibleSteps.map((step, idx) => {
                  const isActive = currentStep === step.id;
                  const isDone = currentStep > step.id;
                  return (
                    <li key={step.id} className="relative pl-11">
                      {idx < visibleSteps.length - 1 && (
                        <span
                          className={`absolute left-[15px] top-8 w-px h-9 ${
                            isDone ? 'bg-[#E8A33D]' : 'bg-white/15'
                          }`}
                        />
                      )}
                      <span
                        className={`absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold border ${
                          isActive
                            ? 'bg-[#E8A33D] border-[#E8A33D] text-[#101B33]'
                            : isDone
                            ? 'bg-[#E8A33D]/15 border-[#E8A33D] text-[#E8A33D]'
                            : 'border-white/25 text-white/45'
                        }`}
                      >
                        {isDone ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </span>
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : isDone ? 'text-white/75' : 'text-white/40'}`}>
                        {step.title}
                      </p>
                      {isActive && (
                        <p className="mt-1 text-xs text-white/50 leading-relaxed">{step.description}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </aside>
          )}

          <div className="flex-1 min-w-0 p-6 sm:p-10 lg:p-14">
            {/* Mobile step indicator */}
            {currentStep < 7 && (
              <div className="lg:hidden mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478]">
                    {STEPS.find((s) => s.id === currentStep)?.title}
                  </span>
                  <span className="text-[11px] font-semibold text-[#9AA1B0]">
                    {currentStep} / 6
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E2E5EB] overflow-hidden">
                  <div
                    className="h-full bg-[#E8A33D] rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-[#B3483F]/5 border border-[#B3483F]/30 text-[#8f3a33] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {renderStep()}

            {currentStep < 7 && (
              <div className="mt-12 flex justify-between items-center border-t border-[#E2E5EB] pt-8">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-[#E2E5EB] rounded-lg hover:bg-[#F5F6F8] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#12172B]"
                >
                  Previous
                </button>
                {currentStep === 6 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-[#101B33] text-white rounded-lg hover:bg-[#1B2A4D] disabled:opacity-50 font-medium transition-colors"
                  >
                    {loading ? 'Submitting…' : 'Submit onboarding'}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={currentStep === 3 && data.skills.length === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentStep === 3 && data.skills.length === 0
                        ? 'bg-[#E2E5EB] text-[#9AA1B0] cursor-not-allowed'
                        : 'bg-[#101B33] text-white hover:bg-[#1B2A4D]'
                    }`}
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}