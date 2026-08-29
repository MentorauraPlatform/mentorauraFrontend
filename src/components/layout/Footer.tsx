'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const Footer: React.FC = () => {
  const tNav = useTranslations('nav');
  const tCat = useTranslations('categories');
  const tFooter = useTranslations('footer');

  return (
    <footer className="bg-[#172033] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Info */}
          <div className="space-y-4 col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                MA
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Mentor<span className="text-[#F97316]">Aura</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              MentorAura connects tech professionals, startups, and career switchers with top 1% industry mentors for 1-on-1 career coaching, code reviews, and strategic guidance.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-xs font-semibold text-orange-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                500+ {tCat('activeMentorsCount')}
              </span>
            </div>
          </div>

          {/* Platform / Browse */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 sm:mb-4">
              {tNav('categories')}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#94A3B8]">
              <li><Link href="/mentors?category=engineering" className="hover:text-white transition-colors">{tCat('softwareEngineering')}</Link></li>
              <li><Link href="/mentors?category=product" className="hover:text-white transition-colors">{tCat('productManagement')}</Link></li>
              <li><Link href="/mentors?category=design" className="hover:text-white transition-colors">{tCat('uxDesign')}</Link></li>
              <li><Link href="/mentors?category=data" className="hover:text-white transition-colors">{tCat('dataScience')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 sm:mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#94A3B8]">
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">{tNav('howItWorks')}</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">{tNav('pricing')}</Link></li>
            </ul>
          </div>

          {/* Become a Mentor & Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 sm:mb-4">
              Join & Support
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#94A3B8]">
              <li><Link href="/auth?mode=register" className="text-[#F97316] font-semibold hover:text-white transition-colors">{tNav('signup')}</Link></li>
              <li><Link href="#teams" className="hover:text-white transition-colors">{tNav('forTeams')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-[#94A3B8] gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} MentorAura. {tFooter('rights')}</p>
        </div>
      </div>
    </footer>
  );
};
