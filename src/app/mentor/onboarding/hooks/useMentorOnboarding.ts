'use client';

import { useState, useEffect, useMemo } from 'react';
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
  headline: string;
  company: string;
  bio: string;
  experience: string;
  yearsOfExperience: string;
  linkedinUrl: string;
  githubUrl: string;
  cvUrl: string;
  idDocumentUrl: string;
  areasOfExpertise: string[];
  skills: Array<{ id: string; name: string; level: SkillLevel }>;
  availability: Availability;
}

export const initialData: OnboardingData = {
  fullName: '',
  title: '',
  headline: '',
  company: '',
  bio: '',
  experience: '',
  yearsOfExperience: '',
  linkedinUrl: '',
  githubUrl: '',
  cvUrl: '',
  idDocumentUrl: '',
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

function isValidUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

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

    const isUserMentor = Boolean(
      (user as unknown as { isMentor?: boolean }).isMentor ||
        String(user.role ?? '').trim().toLowerCase() === 'mentor'
    );

    if (!isUserMentor) {
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
            headline: existing.headline || '',
            company: existing.company || '',
            bio: existing.bio || '',
            experience: existing.experience || '',
            yearsOfExperience: existing.yearsOfExperience != null ? String(existing.yearsOfExperience) : '',
            linkedinUrl: existing.linkedinUrl || '',
            githubUrl: existing.githubUrl || '',
            cvUrl: existing.cvUrl || '',
            idDocumentUrl: existing.idDocumentUrl || '',
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

    if (profile && (profile.onboardingStatus === 'COMPLETE' || profile.onboardingStatus === 'PENDING')) {
      router.replace('/mentor/dashboard');
    }
  }, [profileLoaded, user, profile, router]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markFieldTouched = (field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const touchStep = (step: number) => {
    if (step === 2) {
      setTouched((prev) => ({
        ...prev,
        fullName: true,
        title: true,
        headline: true,
        company: true,
        linkedinUrl: true,
        githubUrl: true,
        bio: true,
      }));
    } else if (step === 4) {
      setTouched((prev) => ({
        ...prev,
        experience: true,
        yearsOfExperience: true,
        cvUrl: true,
        idDocumentUrl: true,
      }));
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const allErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Step 2
    if (!data.fullName.trim()) {
      errs.fullName = t('errors.nameRequired');
    } else if (data.fullName.trim().length > 100) {
      errs.fullName = t('errors.fullNameTooLong');
    }

    if (!data.title.trim()) {
      errs.title = t('errors.titleRequired');
    } else if (data.title.trim().length > 300) {
      errs.title = t('errors.titleTooLong');
    }

    if (data.headline && data.headline.trim().length > 255) {
      errs.headline = t('errors.headlineTooLong');
    }

    if (data.company && data.company.trim().length > 100) {
      errs.company = t('errors.companyTooLong');
    }

    if (data.bio && data.bio.length > 5000) {
      errs.bio = t('errors.bioTooLong');
    }

    if (data.linkedinUrl && data.linkedinUrl.trim()) {
      const trimmed = data.linkedinUrl.trim();
      if (trimmed.length > 512 || !isValidUrl(trimmed)) {
        errs.linkedinUrl = t('errors.invalidUrl');
      }
    }

    if (data.githubUrl && data.githubUrl.trim()) {
      const trimmed = data.githubUrl.trim();
      if (trimmed.length > 512 || !isValidUrl(trimmed)) {
        errs.githubUrl = t('errors.invalidUrl');
      }
    }

    // Step 4
    if (!data.experience.trim()) {
      errs.experience = t('errors.experienceRequired');
    } else if (data.experience.length > 5000) {
      errs.experience = t('errors.experienceTooLong');
    }

    if (data.yearsOfExperience && data.yearsOfExperience.trim() !== '') {
      const years = Number(data.yearsOfExperience);
      if (isNaN(years) || !Number.isInteger(years) || years < 0 || years > 60) {
        errs.yearsOfExperience = t('errors.invalidYearsOfExperience');
      }
    }

    if (data.cvUrl && data.cvUrl.trim()) {
      const trimmed = data.cvUrl.trim();
      if (trimmed.length > 512 || !isValidUrl(trimmed)) {
        errs.cvUrl = t('errors.invalidUrl');
      }
    }

    if (data.idDocumentUrl && data.idDocumentUrl.trim()) {
      const trimmed = data.idDocumentUrl.trim();
      if (trimmed.length > 512 || !isValidUrl(trimmed)) {
        errs.idDocumentUrl = t('errors.invalidUrl');
      }
    }

    return errs;
  }, [data, t]);

  const visibleErrors = useMemo(() => {
    const visible: Record<string, string> = {};
    for (const [key, errorMsg] of Object.entries(allErrors)) {
      const val = (data as unknown as Record<string, unknown>)[key];
      const hasValue = typeof val === 'string' ? val.length > 0 : val != null;
      const isTouched = Boolean(touched[key]);

      if (key === 'fullName' || key === 'title' || key === 'experience') {
        if (isTouched) {
          visible[key] = errorMsg;
        }
      } else {
        if (hasValue || isTouched) {
          visible[key] = errorMsg;
        }
      }
    }
    return visible;
  }, [allErrors, data, touched]);

  const validateStep = (step: number): { valid: boolean; message?: string } => {
    switch (step) {
      case 2: {
        const step2Keys = ['fullName', 'title', 'headline', 'company', 'bio', 'linkedinUrl', 'githubUrl'];
        const firstErrorKey = step2Keys.find((k) => allErrors[k]);
        if (firstErrorKey) {
          return { valid: false, message: allErrors[firstErrorKey] };
        }
        return { valid: true };
      }
      case 3:
        if (data.skills.length === 0) {
          return { valid: false, message: t('errors.skillRequired') };
        }
        return { valid: true };
      case 4: {
        const step4Keys = ['experience', 'yearsOfExperience', 'cvUrl', 'idDocumentUrl'];
        const firstErrorKey = step4Keys.find((k) => allErrors[k]);
        if (firstErrorKey) {
          return { valid: false, message: allErrors[firstErrorKey] };
        }
        return { valid: true };
      }
      case 5: {
        if (!data.availability || !Array.isArray(data.availability.slots)) {
          return { valid: false, message: t('errors.failedToUpdateAvailability') };
        }
        return { valid: true };
      }
      default:
        return { valid: true };
    }
  };

  const nextStep = async () => {
    touchStep(currentStep);
    const result = validateStep(currentStep);
    if (!result.valid) {
      setError(result.message ?? null);
      return;
    }
    setError(null);

    if (currentStep === 2) {
      try {
        setLoading(true);
        const payload = {
          fullName: data.fullName.trim(),
          title: data.title.trim(),
          headline: data.headline.trim() || undefined,
          company: data.company.trim() || undefined,
          bio: data.bio.trim() || undefined,
          linkedinUrl: data.linkedinUrl.trim() || undefined,
          githubUrl: data.githubUrl.trim() || undefined,
        };
        if (!profile) {
          const res = await mentorApi.createProfile(payload);
          setProfile(res.data);
        } else {
          const res = await mentorApi.updateProfile(payload);
          setProfile(res.data);
        }
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'Failed to save profile details.');
        return;
      } finally {
        setLoading(false);
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

  const handleSubmit = async () => {
    // Touch all steps and validate before sending any requests
    touchStep(2);
    touchStep(4);
    for (const step of [2, 3, 4, 5]) {
      const result = validateStep(step);
      if (!result.valid) {
        setError(result.message ?? null);
        setCurrentStep(step as Step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      setSubmitFailed(false);
      const parsedYears =
        data.yearsOfExperience && data.yearsOfExperience.trim() !== ''
          ? Number(data.yearsOfExperience)
          : undefined;

      const payload = {
        fullName: data.fullName.trim(),
        title: data.title.trim(),
        headline: data.headline.trim() || undefined,
        company: data.company.trim() || undefined,
        bio: data.bio.trim() || undefined,
        experience: data.experience.trim() || undefined,
        yearsOfExperience: parsedYears,
        linkedinUrl: data.linkedinUrl.trim() || undefined,
        githubUrl: data.githubUrl.trim() || undefined,
        cvUrl: data.cvUrl.trim() || undefined,
        idDocumentUrl: data.idDocumentUrl.trim() || undefined,
        areasOfExpertise: data.areasOfExpertise,
      };

      if (!profile) {
        await mentorApi.createProfile(payload);
      } else {
        await mentorApi.updateProfile(payload);
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
    allErrors,
    visibleErrors,
    touched,
    markFieldTouched,
    touchStep,
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
