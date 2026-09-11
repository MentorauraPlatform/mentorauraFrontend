'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  X,
  Compass,
  Award,
} from 'lucide-react';
import type { MeResponse } from '@/lib/types';

export type MenteeTab = 'overview' | 'sessions' | 'mentors' | 'goals' | 'settings';

interface MenteeSidebarProps {
  activeTab: MenteeTab;
  setActiveTab: (tab: MenteeTab) => void;
  user: MeResponse | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MenteeSidebar: React.FC<MenteeSidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isOpen,
  onClose,
}) => {
  const menteeName = user?.menteeProfile?.fullName || user?.email?.split('@')[0] || 'Mentee';
  const menteeInitial = menteeName.charAt(0).toUpperCase();

  const navItems = [
    {
      id: 'overview' as MenteeTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'sessions' as MenteeTab,
      label: 'My Sessions',
      icon: Calendar,
      badge: '2 Upcoming',
    },
    {
      id: 'mentors' as MenteeTab,
      label: 'My Mentors',
      icon: Users,
      badge: undefined,
    },
    {
      id: 'goals' as MenteeTab,
      label: 'Learning Goals',
      icon: Target,
      badge: '3 Active',
    },
    {
      id: 'settings' as MenteeTab,
      label: 'Profile & Settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#172033] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#FFA048] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-500/20">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-white flex items-center gap-1">
                  Mentor<span className="text-[#FF6B00]">Aura</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Mentee Hub
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white shadow-md shadow-orange-500/20 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110 text-white' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-orange-400 border border-orange-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Explore & Connect
            </div>
            <Link
              href="/mentors"
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Find Mentors</span>
              </div>
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            </Link>
          </nav>
        </div>

        {/* Bottom Banner & Profile Card */}
        <div className="p-4 space-y-4">
          {/* Pro Upgrade Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/60 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
              <Award className="w-4 h-4" />
              <span>Career Growth</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Book 1-on-1 calls with top tech leaders to accelerate your goals.
            </p>
            <Link
              href="/mentors"
              className="block w-full text-center py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg transition-colors border border-white/10"
            >
              Explore Directory
            </Link>
          </div>

          {/* User Profile Footer */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
                {menteeInitial}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-white truncate">
                  {menteeName}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
