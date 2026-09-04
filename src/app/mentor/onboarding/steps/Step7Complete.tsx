'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Step7CompleteProps {
  onGoToDashboard: () => void;
}

export function Step7Complete({ onGoToDashboard }: Step7CompleteProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="text-center space-y-6 py-12 max-w-2xl mx-auto">
      <div className="mx-auto w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-600" />
      </div>
      <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
        {t('complete.heading')}
      </h2>
      <p className="text-xl text-[#475569] leading-relaxed">
        {t('complete.description')}
      </p>
      <button
        onClick={onGoToDashboard}
        className="bg-[#F97316] text-white px-10 py-4 rounded-xl hover:bg-[#ea580c] font-bold text-lg transition-colors flex items-center gap-3 mx-auto"
      >
        {t('complete.goToDashboard')}
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
}
