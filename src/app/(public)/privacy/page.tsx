'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans text-[#172033]">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 space-y-8">
        <div>
          <Badge variant="orange" size="md" className="gap-1.5 mb-3">
            <Lock className="w-4 h-4" /> {t('badge')}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#172033]">
            {t('title')}
          </h1>
          <p className="text-[#64748B] text-sm sm:text-base mt-2">
            {t('lastUpdated')}
          </p>
        </div>

        <article className="prose prose-slate max-w-none bg-white p-6 sm:p-10 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6 text-sm sm:text-base text-[#475569] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">{t('s1Title')}</h2>
            <p>{t('s1Body')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">{t('s2Title')}</h2>
            <p>{t('s2Body')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">{t('s3Title')}</h2>
            <p>{t('s3Body')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">{t('s4Title')}</h2>
            <p>{t('s4Body')}</p>
          </section>

          <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('complianceFooter')}</span>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
