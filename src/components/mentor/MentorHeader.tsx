'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, Sparkles, Plus, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { MeResponse, MentorProfile } from '@/lib/types';

interface MentorHeaderProps {
  user: MeResponse | null;
  profile: MentorProfile | null;
  onToggleSidebar: () => void;
  activeTabTitle: string;
}

export const MentorHeader: React.FC<MentorHeaderProps> = ({
  user,
  profile,
  onToggleSidebar,
  activeTabTitle,
}) => {
  const mentorName =
    profile?.fullName ||
    user?.mentorProfile?.fullName ||
    user?.email?.split('@')[0] ||
    'Mentor';

  const isVerified = profile?.isVerified ?? user?.mentorProfile?.isVerified ?? false;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFCF9]/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between transition-all">
      {/* Left side: Hamburger toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
              {activeTabTitle}
            </h1>
            {isVerified ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Pending Verification
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Welcome back, <span className="font-semibold text-slate-800">{mentorName}</span>
          </p>
        </div>
      </div>

      {/* Right side: Search bar, Language Switcher, notifications & Quick action CTA */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications Button */}
        <button className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
        </button>

        {/* Manage Plans CTA Button */}
        <Link
          href="/mentor/plans"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all"
        >
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Manage Plans</span>
        </Link>
      </div>
    </header>
  );
};
