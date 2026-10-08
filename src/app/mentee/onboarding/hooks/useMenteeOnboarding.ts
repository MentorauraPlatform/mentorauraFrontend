'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { menteeApi, apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { Availability, MenteeProfile, Skill, SkillLevel, UserSkillSummary } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface OnboardingData {
  fullName: string;
  avatarUrl: string;
  headline: string;
  skills: Array<{ id: string; name: string; level: SkillLevel }>;
  interests: string[];
  goals: string[];
  currentRole: string;
  educationBackground: string;
  yearsOfExperience: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | '';
  availability: Availability;
}

export const initialData: OnboardingData = {
  fullName: '',
  avatarUrl: '',
  headline: '',
  skills: [],
  interests: [],
  goals: [],
  currentRole: '',
  educationBackground: '',
  yearsOfExperience: '',
  experienceLevel: '',
  availability: {
    timezone: 'Africa/Douala',
    slots: [
      { day: 'MONDAY', startTime: '09:00', endTime: '12:00' },
      { day: 'WEDNESDAY', startTime: '14:00', endTime: '17:00' },
    ],
  },
};

export const INTEREST_OPTIONS = [
  'Technology', 'Business', 'Design', 'Data Science', 'Marketing',
  'Product Management', 'Entrepreneurship', 'Finance', 'Health & Wellness', 'Education',
];

export const GOAL_OPTIONS = [
  'Career Development', 'Technical Skill Development', 'Business/Entrepreneurship',
  'Academic Development', 'Personal/Professional Growth',
];

export const LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-200',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-200',
  EXPERT: 'bg-amber-100 text-amber-800 border-amber-200',
};

export function useMenteeOnboarding() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [profile, setProfile] = useState<MenteeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillNameInput, setSkillNameInput] = useState('');
  const [skillLevelInput, setSkillLevelInput] = useState<SkillLevel>('BEGINNER');
  const [skillSaving, setSkillSaving] = useState(false);

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
          menteeApi.getMyProfile().catch(() => null),
          apiClient.get<Skill[]>('/mentor/applications/skills').catch((err) => {
            console.error('Failed to fetch skills list:', err);
            return { data: [] as Skill[] };
          }),
        ]);

        if (profileRes) {
          const existing = profileRes.data;
          setProfile(existing);
          setData({
            fullName: existing.fullName || '',
            avatarUrl: existing.avatarUrl || '',
            headline: existing.headline || '',
            skills: (existing.user?.userSkills || []).map((us: UserSkillSummary) => ({
              id: us.skill.id,
              name: us.skill.name,
              level: us.level,
            })),
            interests: existing.interests || [],
            goals: existing.goals || [],
            currentRole: existing.currentRole || '',
            educationBackground: existing.educationBackground || '',
            yearsOfExperience: existing.yearsOfExperience != null ? String(existing.yearsOfExperience) : '',
            experienceLevel: (existing.experienceLevel as OnboardingData['experienceLevel']) || '',
            availability: existing.availability || initialData.availability,
          });
          if (existing.onboardingCompleted) {
            setCurrentStep(7);
          }
        }

        setSkills(skillsRes.data);
      } catch (err) {
        console.error('Mentee onboarding initialization error:', err);
      } finally {
        setLoading(false);
        setProfileLoaded(true);
      }
    })();
  }, [user, authLoading, router]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): { valid: boolean; message?: string } => {
    switch (step) {
      case 1:
        if (!data.fullName.trim()) {
          return { valid: false, message: 'Full name is required' };
        }
        return { valid: true };
      case 3:
        if (data.interests.length === 0) {
          return { valid: false, message: 'Select at least one interest' };
        }
        return { valid: true };
      case 4:
        if (data.goals.length === 0) {
          return { valid: false, message: 'Select at least one goal' };
        }
        return { valid: true };
      default:
        return { valid: true };
    }
  };

  const saveCurrentStep = async (step: Step): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      switch (step) {
        case 1: {
          if (!profile) {
            const res = await menteeApi.createProfile({
              fullName: data.fullName,
              avatarUrl: data.avatarUrl || undefined,
              headline: data.headline || undefined,
            });
            setProfile(res.data);
          } else {
            const res = await menteeApi.updateProfile({
              fullName: data.fullName,
              avatarUrl: data.avatarUrl || undefined,
              headline: data.headline || undefined,
            });
            setProfile(res.data);
          }
          return true;
        }
        case 3: {
          await menteeApi.updateInterests({ interests: data.interests });
          return true;
        }
        case 4: {
          await menteeApi.updateGoals({ goals: data.goals });
          return true;
        }
        case 5: {
          await menteeApi.updateExperience({
            experienceLevel: data.experienceLevel || undefined,
            currentRole: data.currentRole || undefined,
            educationBackground: data.educationBackground || undefined,
            yearsOfExperience: data.yearsOfExperience ? Number(data.yearsOfExperience) : undefined,
          });
          return true;
        }
        case 6: {
          await menteeApi.updateAvailability({ availability: data.availability });
          return true;
        }
        default:
          return true;
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to save. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const result = validateStep(currentStep);
    if (!result.valid) {
      setError(result.message ?? null);
      return;
    }
    setError(null);

    const saved = await saveCurrentStep(currentStep);
    if (!saved) return;

    setCurrentStep((prev) => Math.min(prev + 1, 8) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSubmitFailed(false);
      const res = await menteeApi.submitOnboarding({ confirmed: true });
      setProfile(res.data);
      toast.success('Onboarding complete!', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
      setCurrentStep(8);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to submit onboarding');
      setSubmitFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const retrySubmit = async () => {
    await handleSubmit();
  };

  const addSkill = async () => {
    if (!skillNameInput.trim()) return;
    try {
      setSkillSaving(true);
      setError(null);
      const res = await menteeApi.addSkill({ name: skillNameInput.trim(), level: skillLevelInput });
      updateData({ skills: [...data.skills, { id: res.data.skill.id, name: res.data.skill.name, level: res.data.level }] });
      setSkillNameInput('');
      setSkillLevelInput('BEGINNER');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to add skill');
    } finally {
      setSkillSaving(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      setSkillSaving(true);
      setError(null);
      await menteeApi.removeSkill(skillId);
      updateData({ skills: data.skills.filter((s) => s.id !== skillId) });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to remove skill');
    } finally {
      setSkillSaving(false);
    }
  };

  const updateSkillLevel = async (skillId: string, level: SkillLevel) => {
    try {
      setSkillSaving(true);
      setError(null);
      await menteeApi.updateSkill(skillId, { level });
      updateData({ skills: data.skills.map((s) => (s.id === skillId ? { ...s, level } : s)) });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update skill');
    } finally {
      setSkillSaving(false);
    }
  };

  return {
    currentStep,
    data,
    profile,
    loading,
    error,
    setError,
    profileLoaded,
    submitFailed,
    authLoading,
    router,
    skills,
    skillNameInput,
    setSkillNameInput,
    skillLevelInput,
    setSkillLevelInput,
    skillSaving,
    addSkill,
    removeSkill,
    updateSkillLevel,
    updateData,
    validateStep,
    nextStep,
    prevStep,
    handleSubmit,
    retrySubmit,
    LEVEL_COLORS,
    INTEREST_OPTIONS,
    GOAL_OPTIONS,
  };
}
