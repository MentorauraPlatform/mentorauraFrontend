'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mentorApi, apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { MentorProfile, Skill, SkillLevel, UserSkill } from '@/lib/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Building2,
  Calendar,
  Globe,
  Zap,
  Target,
  TrendingUp,
  Users,
  Star,
  Shield
} from 'lucide-react';

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
  availability: {
    timezone: string;
    slots: Array<{
      day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
      startTime: string;
      endTime: string;
    }>;
  };
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

const LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};

const LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-200',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-200',
  EXPERT: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function MentorOnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const [saving, setSaving] = useState(false);
  const [rawAreas, setRawAreas] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const [profileRes, skillsRes] = await Promise.all([
          mentorApi.getMyProfile().catch(() => null),
          apiClient.get<Skill[]>('/mentor/applications/skills').catch(() => ({ data: [] })),
        ]);
        const skillsData = skillsRes.data;

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
            availability: (existing.availability as { timezone: string; slots: Array<{ day: string; startTime: string; endTime: string }> }) || initialData.availability,
          });
          setRawAreas((existing.areasOfExpertise || []).join(', '));
          if (existing.onboardingStatus === 'COMPLETE' || existing.onboardingStatus === 'PENDING') {
            setCurrentStep(7);
          }
        }

        setSkills(skillsData);
      } catch {
        // ignore initialization errors
      } finally {
        setLoading(false);
        setProfileLoaded(true);
      }
    })();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoaded || !user) return;

    if (!user.mentorProfile) {
      router.replace('/');
      return;
    }

    if (profile && (profile.onboardingStatus === 'COMPLETE' || profile.onboardingStatus === 'PENDING')) {
      router.replace('/mentor/dashboard');
    }
  }, [profileLoaded, user, profile, router]);

  if (authLoading || !profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#E5E7EB] border-t-[#F97316] animate-spin" />
          <span className="text-lg text-[#64748B] font-medium">Loading your profile…</span>
        </div>
      </div>
    );
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const parseAreas = (value: string) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const syncAreasFromRaw = () => {
    const areas = parseAreas(rawAreas);
    updateData({ areasOfExpertise: areas });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 2:
        return data.fullName.trim().length > 0 && data.title.trim().length > 0;
      case 3:
        return data.skills.length > 0;
      case 4:
        return data.experience.trim().length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    setError(null);
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
    if (!selectedSkillId) return;
    try {
      setSaving(true);
      setError(null);
      await mentorApi.addSkill({
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
      toast.success('Skill added successfully', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      setSaving(true);
      setError(null);
      await mentorApi.removeSkill(skillId);
      setData((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.id !== skillId),
      }));
      toast.success('Skill removed', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to remove skill');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSkillLevel = async (skillId: string, level: SkillLevel) => {
    const previous = data.skills;
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === skillId ? { ...s, level } : s)),
    }));
    try {
      setSaving(true);
      setError(null);
      await mentorApi.updateSkill(skillId, { level });
      toast.success('Skill level updated', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update skill level');
      setData((prev) => ({
        ...prev,
        skills: previous,
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvailability = async () => {
    try {
      setSaving(true);
      setError(null);
      await mentorApi.updateAvailability({ availability: data.availability });
      toast.success('Availability saved', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!profile) {
        await mentorApi.createProfile({
          fullName: data.fullName,
          title: data.title,
          company: data.company,
          bio: data.bio,
          experience: data.experience,
          areasOfExpertise: data.areasOfExpertise,
        });
      } else {
        await mentorApi.updateProfile({
          title: data.title,
          company: data.company,
          bio: data.bio,
          experience: data.experience,
          areasOfExpertise: data.areasOfExpertise,
        });
      }
      await mentorApi.updateAvailability({ availability: data.availability });
      await mentorApi.submitOnboarding({ confirmed: true });
      toast.success('Onboarding submitted for review!', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
      setCurrentStep(7);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to submit onboarding');
    } finally {
      setLoading(false);
    }
  };

  const visibleSteps = STEPS.filter((s) => s.id <= 6);

  const inputClass =
    'w-full h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200';
  const textareaClass =
    'w-full text-base border border-[#E5E7EB] rounded-xl px-5 py-4 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 resize-none';
  const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-10 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#FFF7ED] border border-[#F97316]/20 mb-6">
                <Sparkles className="w-10 h-10 text-[#F97316]" />
              </div>
              <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
                Before you begin
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
                Welcome to <span className="text-[#F97316]">MentorAura</span>
              </h2>
              <p className="mt-4 text-xl text-[#475569] leading-relaxed max-w-2xl mx-auto">
                Thank you for choosing to become a mentor. This process builds the profile
                mentees will see when they look for someone to learn from.
              </p>
            </div>
            <div className="bg-[#FFF7ED] border border-[#F97316]/20 rounded-2xl overflow-hidden">
              {visibleSteps
                .filter((s) => s.id > 1)
                .map((step, i, arr) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-5 px-7 py-5 ${
                      i < arr.length - 1 ? 'border-b border-[#F97316]/10' : ''
                    }`}
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F97316] text-white text-sm font-bold flex items-center justify-center">
                      {step.id - 1}
                    </span>
                    <span className="text-lg font-bold text-[#172033]">{step.title}</span>
                    <span className="ml-auto text-base text-[#64748B] hidden sm:block">
                      {step.description}
                    </span>
                  </div>
                ))}
            </div>
            <p className="text-center text-base text-[#64748B]">
              Takes about 5–10 minutes. Your progress is saved automatically.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
                Step 2 of 6
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
                Professional Information
              </h2>
              <p className="mt-3 text-xl text-[#475569]">Tell mentees who you are and what you do.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => updateData({ fullName: e.target.value })}
                    required
                    className={`${inputClass} pl-14`}
                    placeholder="e.g. Jane Doe"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Professional Title <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Briefcase className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => updateData({ title: e.target.value })}
                    required
                    className={`${inputClass} pl-14`}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Company</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Building2 className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => updateData({ company: e.target.value })}
                    className={`${inputClass} pl-14`}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  value={data.bio}
                  onChange={(e) => updateData({ bio: e.target.value })}
                  rows={6}
                  className={textareaClass}
                  placeholder="Tell us about yourself, your background, and what drives you..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
                Step 3 of 6
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
                Skills & Expertise
              </h2>
              <p className="mt-3 text-xl text-[#475569]">
                Add the skills you can mentor others in, and rate your proficiency in each.
              </p>
              {data.skills.length === 0 && (
                <div className="mt-4 p-5 bg-[#FFF7ED] border border-[#F97316]/30 rounded-xl">
                  <p className="text-base text-[#F97316] font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    Please add at least one skill to continue.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {data.skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`flex items-center justify-between bg-[#FFFCF9] rounded-xl px-6 py-5 border ${LEVEL_COLORS[skill.level]}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-[#172033]" />
                    </div>
                    <span className="text-lg font-bold text-[#172033] truncate">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <select
                      value={skill.level}
                      onChange={(e) => handleUpdateSkillLevel(skill.id, e.target.value as SkillLevel)}
                      className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
              {data.skills.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-[#E5E7EB] rounded-2xl">
                  <Award className="w-16 h-16 text-[#94A3B8] mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-[#64748B]">No skills added yet. Add your first skill below.</p>
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E7EB] pt-8">
              <label className={labelClass}>Add a skill</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="flex-1 h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
                >
                  <option value="">Select a skill...</option>
                  {skills
                    .filter((s) => !data.skills.some((sk) => sk.id === s.id))
                    .map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                </select>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
                  className="h-14 text-base border border-[#E5E7EB] rounded-xl px-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button
                  onClick={handleAddSkill}
                  disabled={!selectedSkillId || saving}
                  className="bg-[#F97316] text-white px-8 py-3.5 rounded-xl hover:bg-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {saving ? 'Adding…' : 'Add Skill'}
                </button>
              </div>
              {selectedSkillId && (
                <p className="mt-3 text-base text-emerald-600 font-medium">
                  ✓ Selected: {skills.find((s) => s.id === selectedSkillId)?.name}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
                Step 4 of 6
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
                Experience
              </h2>
              <p className="mt-3 text-xl text-[#475569]">Share your professional experience and areas of expertise.</p>
              {!data.experience.trim() && (
                <div className="mt-4 p-5 bg-[#FFF7ED] border border-[#F97316]/30 rounded-xl">
                  <p className="text-base text-[#F97316] font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    Please describe your professional experience to continue.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Professional Experience <span className="text-red-500">*</span></label>
                <textarea
                  value={data.experience}
                  onChange={(e) => updateData({ experience: e.target.value })}
                  rows={10}
                  className={`${textareaClass} ${
                    !data.experience.trim() ? 'border-[#F97316]' : 'border-[#E5E7EB]'
                  }`}
                  placeholder="Describe your professional experience, achievements, and background. Include relevant work history, projects, and accomplishments..."
                />
                <div className="mt-3 flex justify-between text-sm text-[#64748B]">
                  <span>{data.experience.length} characters</span>
                  <span>Minimum 10 characters recommended</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Areas of Expertise</label>
                <input
                  type="text"
                  value={rawAreas}
                  onChange={(e) => setRawAreas(e.target.value)}
                  onBlur={syncAreasFromRaw}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      syncAreasFromRaw();
                    }
                  }}
                  className={inputClass}
                  placeholder="e.g. Software Engineering, Leadership, Career Growth"
                />
                <p className="mt-2 text-sm text-[#64748B]">Separate multiple areas with commas.</p>
                {data.areasOfExpertise.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.areasOfExpertise.map((area) => (
                      <span
                        key={area}
                        className="bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/20 px-4 py-2 rounded-full text-sm font-medium"
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
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
                Step 5 of 6
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
                Availability
              </h2>
              <p className="mt-3 text-xl text-[#475569]">Specify when you're available for mentorship sessions.</p>
            </div>
            <div className="space-y-6">
              <div className="max-w-sm">
                <label className={labelClass}>Timezone <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Globe className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <select
                    value={data.availability.timezone as string}
                    onChange={(e) =>
                      updateData({
                        availability: { ...data.availability, timezone: e.target.value },
                      })
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
              <div>
                <label className={labelClass}>Time slots</label>
                {Array.isArray(data.availability.slots) && (
                  <div className="space-y-4">
                    {(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).map(
                      (slot, index) => (
                        <div
                          key={index}
                          className="flex flex-wrap gap-4 items-center bg-[#F8FAFC] p-5 rounded-xl border border-[#E5E7EB]"
                        >
                          <span className="flex-shrink-0 w-11 h-11 rounded-full bg-[#F97316] text-white text-sm font-bold flex items-center justify-center">
                            {DAY_LABELS[slot.day] || slot.day.slice(0, 3)}
                          </span>
                          <select
                            value={slot.day}
                            onChange={(e) => {
                              const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                              newSlots[index] = { ...newSlots[index], day: e.target.value };
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
                          >
                            {DAYS.map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => {
                              const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                              newSlots[index] = { ...newSlots[index], startTime: e.target.value };
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] w-32"
                          />
                          <span className="text-[#64748B] font-medium">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => {
                              const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                              newSlots[index] = { ...newSlots[index], endTime: e.target.value };
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] w-32"
                          />
                          <button
                            onClick={() => {
                              const newSlots = (data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).filter((_, i) => i !== index);
                              updateData({ availability: { ...data.availability, slots: newSlots } });
                            }}
                            className="ml-auto text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-6 h-6" />
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
                  className="mt-4 text-[#F97316] hover:text-[#ea580c] font-bold text-base flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add time slot
                </button>
              </div>
              <button
                onClick={handleUpdateAvailability}
                disabled={saving}
                className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold text-base transition-colors flex items-center gap-3"
              >
                <Clock className="w-5 h-5" />
                {saving ? 'Saving…' : 'Save Availability'}
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
                Step 6 of 6
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
                Review Your Profile
              </h2>
              <p className="mt-3 text-xl text-[#475569]">Take one more look before you submit for approval.</p>
            </div>
            <div className="border border-[#E5E7EB] rounded-2xl divide-y divide-[#E5E7EB]">
              <div className="p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
                  Professional Information
                </h3>
                <dl className="space-y-3 text-base">
                  <div className="flex flex-wrap gap-x-4">
                    <dt className="w-40 text-[#64748B] font-medium">Full Name</dt>
                    <dd className="text-[#172033] font-semibold">{data.fullName || '—'}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-4">
                    <dt className="w-40 text-[#64748B] font-medium">Title</dt>
                    <dd className="text-[#172033]">{data.title || '—'}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-4">
                    <dt className="w-40 text-[#64748B] font-medium">Company</dt>
                    <dd className="text-[#172033]">{data.company || '—'}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-4">
                    <dt className="w-40 text-[#64748B] font-medium">Bio</dt>
                    <dd className="text-[#172033]">{data.bio || '—'}</dd>
                  </div>
                </dl>
              </div>
              <div className="p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
                  Experience
                </h3>
                <p className="text-[#172033] whitespace-pre-wrap">{data.experience || '—'}</p>
                <p className="mt-4 text-base text-[#64748B]">
                  <span className="font-medium text-[#172033]">Areas of Expertise: </span>
                  {data.areasOfExpertise.join(', ') || '—'}
                </p>
              </div>
              <div className="p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
                  Skills
                </h3>
                {data.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {data.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={`px-5 py-2.5 rounded-full text-base font-medium border ${LEVEL_COLORS[skill.level]}`}
                      >
                        {skill.name} · {LEVEL_LABELS[skill.level]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#64748B]">No skills added</p>
                )}
              </div>
              <div className="p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
                  Availability
                </h3>
                <p className="text-base text-[#64748B] mb-3">
                  Timezone: <span className="text-[#172033] font-semibold">{String(data.availability.timezone)}</span>
                </p>
                {Array.isArray(data.availability.slots) && data.availability.slots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).map(
                      (slot, i) => (
                        <span
                          key={i}
                          className="bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-2 rounded-lg text-base text-[#172033]"
                        >
                          {DAY_LABELS[slot.day] || slot.day} {slot.startTime}–{slot.endTime}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-[#64748B]">No availability slots set</p>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-6 py-12 max-w-2xl mx-auto">
            <div className="mx-auto w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-600" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
              Onboarding Complete! 🎉
            </h2>
            <p className="text-xl text-[#475569] leading-relaxed">
              Your mentor profile has been submitted for review. We'll notify you once it's
              approved. In the meantime, you can access your mentor dashboard.
            </p>
            <button
              onClick={() => {
                window.location.href = '/mentor/dashboard';
              }}
              className="bg-[#F97316] text-white px-10 py-4 rounded-xl hover:bg-[#ea580c] font-bold text-lg transition-colors flex items-center gap-3 mx-auto"
            >
              Go to Mentor Dashboard
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#E5E7EB] border-t-[#F97316] animate-spin" />
          <span className="text-lg text-[#64748B] font-medium">Loading your profile…</span>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className="bg-[#172033] px-8 sm:px-10 py-8 sm:py-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentor Onboarding</h1>
                <p className="text-sm text-white/60 font-medium">
                  Step {currentStep} of 6: {STEPS[currentStep - 1]?.title}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {currentStep < 7 && (
            <div className="px-8 sm:px-10 pt-8 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-3">
                {visibleSteps.map((step, index) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  return (
                    <div key={step.id} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center gap-2 min-w-[56px] sm:min-w-[64px]">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 text-base font-bold ${
                            isActive
                              ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/40 scale-105'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#E5E7EB] text-[#64748B]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <span className={`text-xs sm:text-sm font-bold text-center ${
                          isActive ? 'text-[#F97316]' : isCompleted ? 'text-emerald-600' : 'text-[#64748B]'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      {index < visibleSteps.length - 1 && (
                        <div className={`w-8 sm:w-12 h-1 mx-2 rounded ${
                          isCompleted ? 'bg-emerald-600' : 'bg-[#E5E7EB]'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8 sm:p-10 lg:p-12">
            {error && (
              <div className="mb-8 bg-red-50/80 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-4 text-base">
                <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-500" />
                {error}
              </div>
            )}

            {renderStep()}

            {currentStep < 7 && (
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#E5E7EB] pt-10">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto px-8 py-4 border border-[#E5E7EB] rounded-xl hover:bg-[#FFFCF9] font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#172033] flex items-center justify-center gap-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
                {currentStep === 6 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-4 bg-[#F97316] text-white rounded-xl hover:bg-[#ea580c] disabled:opacity-50 font-bold text-base transition-colors flex items-center justify-center gap-3"
                  >
                    {loading ? 'Submitting…' : 'Submit Onboarding'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-3 ${
                      !isStepValid()
                        ? 'bg-[#E5E7EB] text-[#64748B] cursor-not-allowed'
                        : 'bg-[#F97316] text-white hover:bg-[#ea580c]'
                    }`}
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}