'use client';

import type { SkillLevel } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OnboardingData } from '../hooks/useMentorOnboarding';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

const LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-200',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-200',
  EXPERT: 'bg-amber-100 text-amber-800 border-amber-200',
};

interface Step6ReviewProps {
  data: OnboardingData;
  getSkillLevelLabel: (level: SkillLevel) => string;
}

export function Step6Review({ data, getSkillLevelLabel }: Step6ReviewProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
          {t('buttons.stepOf6', { step: 6 })}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
          {t('review.heading')}
        </h2>
        <p className="mt-3 text-xl text-[#475569]">{t('review.subheading')}</p>
      </div>
      <div className="border border-[#E5E7EB] rounded-2xl divide-y divide-[#E5E7EB]">
        <div className="p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
            {t('review.professionalInformation')}
          </h3>
          <dl className="space-y-3 text-base">
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-40 text-[#64748B] font-medium">{t('review.fullNameLabel')}</dt>
              <dd className="text-[#172033] font-semibold">{data.fullName || '—'}</dd>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-40 text-[#64748B] font-medium">{t('review.titleLabel')}</dt>
              <dd className="text-[#172033]">{data.title || '—'}</dd>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-40 text-[#64748B] font-medium">{t('review.companyLabel')}</dt>
              <dd className="text-[#172033]">{data.company || '—'}</dd>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-40 text-[#64748B] font-medium">{t('review.bioLabel')}</dt>
              <dd className="text-[#172033]">{data.bio || '—'}</dd>
            </div>
          </dl>
        </div>
        <div className="p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
            {t('review.experienceLabel')}
          </h3>
          <p className="text-[#172033] whitespace-pre-wrap">{data.experience || '—'}</p>
          <p className="mt-4 text-base text-[#64748B]">
            <span className="font-medium text-[#172033]">{t('review.areasOfExpertiseLabel')}</span>
            {data.areasOfExpertise.join(', ') || '—'}
          </p>
        </div>
        <div className="p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
            {t('review.skillsSection')}
          </h3>
          {data.skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`px-5 py-2.5 rounded-full text-base font-medium border ${LEVEL_COLORS[skill.level]}`}
                >
                  {skill.name} · {getSkillLevelLabel(skill.level)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[#64748B]">{t('skills.noSkillsAdded')}</p>
          )}
        </div>
        <div className="p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">
            {t('review.availabilitySection')}
          </h3>
          <p className="text-base text-[#64748B] mb-3">
            {t('review.timezoneLabel')} <span className="text-[#172033] font-semibold">{String(data.availability.timezone)}</span>
          </p>
          {Array.isArray(data.availability.slots) && data.availability.slots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.availability.slots.map((slot, i) => (
                <span
                  key={i}
                  className="bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-2 rounded-lg text-base text-[#172033]"
                >
                  {DAY_LABELS[slot.day] || slot.day} {slot.startTime}–{slot.endTime}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[#64748B]">{t('review.noAvailabilitySlotsSet')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
