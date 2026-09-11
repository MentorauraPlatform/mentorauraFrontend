'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, Sparkles, Plus, Compass } from 'lucide-react';
import type { MeResponse } from '@/lib/types';

interface MenteeHeaderProps {
  user: MeResponse | null;
  onToggleSidebar: () => void;
  activeTabTitle: string;
}

export const MenteeHeader: React.FC<MenteeHeaderProps> = ({
  user,
  onToggleSidebar,
  activeTabTitle,
}) => {
  const menteeName = user?.menteeProfile?.fullName || user?.email?.split('@')[0] || 'Mentee';

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
          <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
            {activeTabTitle}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Welcome back, <span className="font-semibold text-slate-800">{menteeName}</span> 👋
          </p>
        </div>
      </div>

      {/* Right side: Search bar, notifications & Quick action CTA */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl w-64 shadow-xs focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search mentors or topics..."
            className="w-full text-xs text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Notifications Button */}
        <button className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
        </button>

        {/* Find Mentors CTA Button */}
        <Link
          href="/mentors"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all"
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">Browse Mentors</span>
        </Link>
      </div>
    </header>
  );
};
