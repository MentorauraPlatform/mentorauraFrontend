'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslations } from 'next-intl';

export default function SitemapPage() {
  const t = useTranslations('sitemap');

  const publicRoutes = [
    { name: t('home'), path: '/' },
    { name: t('browseMentors'), path: '/mentors' },
    { name: t('authentication'), path: '/auth?mode=login' },
    { name: t('forgotPassword'), path: '/auth/forgot-password' },
    { name: t('privacyPolicy'), path: '/privacy' },
    { name: t('termsOfService'), path: '/terms' },
  ];

  const portalRoutes = [
    { name: t('menteeDashboard'), path: '/mentee/dashboard' },
    { name: t('menteeOnboarding'), path: '/mentee/onboarding' },
    { name: t('mentorDashboard'), path: '/mentor/dashboard' },
    { name: t('mentorOnboarding'), path: '/mentor/onboarding' },
    { name: t('mentorPlans'), path: '/mentor/plans' },
    { name: t('adminPortal'), path: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans text-[#172033]">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <h1 className="text-3xl font-extrabold text-[#172033] mb-4">{t('title')}</h1>
        <p className="text-[#64748B] mb-8">{t('subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h2 className="text-xl font-bold text-[#172033] mb-4">{t('publicPages')}</h2>
            <ul className="space-y-2.5">
              {publicRoutes.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="text-[#F97316] font-medium hover:underline">
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h2 className="text-xl font-bold text-[#172033] mb-4">{t('portals')}</h2>
            <ul className="space-y-2.5">
              {portalRoutes.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="text-[#172033] hover:text-[#F97316] font-medium">
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
