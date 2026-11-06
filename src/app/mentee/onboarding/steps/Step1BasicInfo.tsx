'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';
import { useTranslations } from 'next-intl';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function Step1BasicInfo({ data, updateData }: Props) {
  const t = useTranslations('menteeOnboarding.step1');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">{t('heading')}</h2>
        <p className="text-[#64748B] text-base">{t('subheading')}</p>
      </div>

      <div className="space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">
            {t('fullNameLabel')} <span className="text-[#F97316]">*</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder={t('fullNamePlaceholder')}
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">{t('headlineLabel')}</label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => updateData({ headline: e.target.value })}
            placeholder={t('headlinePlaceholder')}
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
          <p className="mt-2 text-xs text-[#94A3B8]">{t('headlineHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">{t('avatarUrlLabel')}</label>
          <input
            type="text"
            value={data.avatarUrl}
            onChange={(e) => updateData({ avatarUrl: e.target.value })}
            placeholder={t('avatarUrlPlaceholder')}
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
          <p className="mt-2 text-xs text-[#94A3B8]">{t('avatarUrlHint')}</p>
        </div>
      </div>
    </div>
  );
}
