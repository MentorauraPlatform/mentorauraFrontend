'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Step1IntroProps {
  visibleSteps: Array<{ id: number; title: string; description: string }>;
}

export function Step1Intro({ visibleSteps }: Step1IntroProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#FFF7ED] border border-[#F97316]/20 mb-6">
          <Sparkles className="w-10 h-10 text-[#F97316]" />
        </div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
          {t('beforeYouBegin')}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
          {t('welcomeTitle')} <span className="text-[#F97316]">MentorAura</span>
        </h2>
        <p className="mt-4 text-xl text-[#475569] leading-relaxed max-w-2xl mx-auto">
          {t('welcomeDescription')}
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
              <span className="text-lg font-bold text-[#172033]">{t(step.title)}</span>
              <span className="ml-auto text-base text-[#64748B] hidden sm:block">
                {t(step.description)}
              </span>
            </div>
          ))}
      </div>
      <p className="text-center text-base text-[#64748B]">
        {t('takesAbout')}
      </p>
    </div>
  );
}
