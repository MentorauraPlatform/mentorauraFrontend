'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { mentorApi, apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { Availability, MentorProfile, Skill, SkillLevel, UserSkill } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OnboardingData {
  fullName: string;
  title: string;
  company: string;
  bio: string;
  experience: string;
  areasOfExpertise: string[];
  skills: Array<{ id: string; name: string; level: SkillLevel }>;
  availability: Availability;
}

export const initialData: OnboardingData = {
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

export const LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-200',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-200',
  EXPERT: 'bg-amber-100 text-amber-800 border-amber-200',
};

export function useMentorOnboarding() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations('onboarding');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    if (user.role !== 'mentor') {
      router.replace('/');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const [profileRes, skillsRes] = await Promise.all([
          mentorApi.getMyProfile().catch(() => null),
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
            availability: existing.availability || initialData.availability,
          });
          if (existing.onboardingStatus === 'COMPLETE' || existing.onboardingStatus === 'PENDING') {
            setCurrentStep(7);
          }
        }

        setSkills(skillsRes.data);
        console.log('Fetched skills count:', skillsRes.data?.length ?? 0);
      } catch (err) {
        console.error('Onboarding initialization error:', err);
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

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): { valid: boolean; message?: string } => {
    switch (step) {
      case 2:
        if (!data.fullName.trim() || !data.title.trim()) {
          return { valid: false, message: t('errors.nameAndTitleRequired') };
        }
        return { valid: true };
      case 3:
        if (data.skills.length === 0) {
          return { valid: false, message: t('errors.skillRequired') };
        }
        return { valid: true };
      case 4:
        if (!data.experience.trim()) {
          return { valid: false, message: t('errors.experienceRequired') };
        }
        return { valid: true };
      default:
        return { valid: true };
    }
  };

  const nextStep = () => {
    const result = validateStep(currentStep);
    if (!result.valid) {
      setError(result.message ?? null);
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 7) as Step);
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
      const message = apiError.message || t('errors.failedToSubmitOnboarding');
      setError(message);
      setSubmitFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const retrySubmit = async () => {
    await handleSubmit();
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
    updateData,
    validateStep,
    nextStep,
    prevStep,
    handleSubmit,
    retrySubmit,
    DAYS,
    DAY_LABELS,
    LEVEL_COLORS,
    t,
  };
}
