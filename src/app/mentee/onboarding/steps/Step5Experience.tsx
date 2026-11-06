'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';
import { useTranslations } from 'next-intl';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function Step5Experience({ data, updateData }: Props) {
  const t = useTranslations('menteeOnboarding.step5');

  const LEVELS: Array<{ value: OnboardingData['experienceLevel']; label: string }> = [
    { value: 'BEGINNER', label: t('levelBeginner') },
    { value: 'INTERMEDIATE', label: t('levelIntermediate') },
    { value: 'ADVANCED', label: t('levelAdvanced') },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">{t('heading')}</h2>
        <p className="text-[#64748B] text-base">{t('subheading')}</p>
      </div>

      <div className="space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">{t('experienceLevelLabel')}</label>
          <div className="flex flex-wrap gap-3">
            {LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => updateData({ experienceLevel: level.value })}
                className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-colors ${
                  data.experienceLevel === level.value
                    ? 'bg-[#F97316] text-white border-[#F97316]'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:border-[#F97316]'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">{t('currentRoleLabel')}</label>
          <input
            type="text"
            value={data.currentRole}
            onChange={(e) => updateData({ currentRole: e.target.value })}
            placeholder={t('currentRolePlaceholder')}
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">{t('educationLabel')}</label>
          <input
            type="text"
            value={data.educationBackground}
            onChange={(e) => updateData({ educationBackground: e.target.value })}
            placeholder={t('educationPlaceholder')}
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">{t('yearsLabel')}</label>
          <input
            type="number"
            min="0"
            value={data.yearsOfExperience}
            onChange={(e) => updateData({ yearsOfExperience: e.target.value })}
            placeholder="0"
            className="w-full sm:w-40 px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
        </div>
      </div>
    </div>
  );
}
