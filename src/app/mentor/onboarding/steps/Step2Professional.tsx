'use client';

import type { SkillLevel } from '@/lib/types';
import { User, Briefcase, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OnboardingData } from '../hooks/useMentorOnboarding';

const inputClass =
  'w-full h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200';
const textareaClass =
  'w-full text-base border border-[#E5E7EB] rounded-xl px-5 py-4 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200 resize-none';
const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';

interface Step2ProfessionalProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function Step2Professional({ data, updateData }: Step2ProfessionalProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
          {t('buttons.stepOf6', { step: 2 })}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
          {t('professional.heading')}
        </h2>
        <p className="mt-3 text-xl text-[#475569]">{t('professional.subheading')}</p>
      </div>
      <div className="space-y-6">
        <div>
          <label className={labelClass}>{t('professional.fullNameRequired')} <span className="text-red-500">*</span></label>
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
              placeholder={t('professional.fullNamePlaceholder')}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>{t('professional.titleRequired')} <span className="text-red-500">*</span></label>
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
              placeholder={t('professional.titlePlaceholder')}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>{t('professional.company')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Building2 className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <input
              type="text"
              value={data.company}
              onChange={(e) => updateData({ company: e.target.value })}
              className={`${inputClass} pl-14`}
              placeholder={t('professional.companyPlaceholder')}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>{t('professional.bio')}</label>
          <textarea
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            rows={6}
            className={textareaClass}
            placeholder={t('professional.bioPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}
