'use client';

import type { SkillLevel } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OnboardingData } from '../hooks/useMentorOnboarding';

const inputClass =
  'w-full h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200';
const textareaClass =
  'w-full text-base border border-[#E5E7EB] rounded-xl px-5 py-4 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 resize-none';
const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';

interface Step4ExperienceProps {
  data: OnboardingData;
  rawAreas: string;
  onRawAreasChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function Step4Experience({ data, rawAreas, onRawAreasChange, onBlur, onKeyDown }: Step4ExperienceProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
          {t('buttons.stepOf6', { step: 4 })}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
          {t('experience.heading')}
        </h2>
        <p className="mt-3 text-xl text-[#475569]">{t('experience.subheading')}</p>
        {!data.experience.trim() && (
          <div className="mt-4 p-5 bg-[#FFF7ED] border border-[#F97316]/30 rounded-xl">
            <p className="text-base text-[#F97316] font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {t('experience.experienceRequiredMessage')}
            </p>
          </div>
        )}
      </div>
      <div className="space-y-6">
        <div>
          <label className={labelClass}>{t('experience.experienceRequired')} <span className="text-red-500">*</span></label>
          <textarea
            value={data.experience}
            onChange={(e) => onRawAreasChange(e.target.value)}
            rows={10}
            className={`${textareaClass} ${
              !data.experience.trim() ? 'border-[#F97316]' : 'border-[#E5E7EB]'
            }`}
            placeholder={t('experience.experiencePlaceholder')}
          />
          <div className="mt-3 flex justify-between text-sm text-[#64748B]">
            <span>{data.experience.length} characters</span>
            <span>{t('experience.experienceHint')}</span>
          </div>
        </div>
        <div>
          <label className={labelClass}>{t('experience.areasOfExpertise')}</label>
          <input
            type="text"
            value={rawAreas}
            onChange={(e) => onRawAreasChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className={inputClass}
            placeholder={t('experience.areasPlaceholder')}
          />
          <p className="mt-2 text-sm text-[#64748B]">{t('experience.areasHint')}</p>
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
}
