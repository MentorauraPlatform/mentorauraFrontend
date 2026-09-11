'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  Award,
  Clock,
  Package,
  LogOut,
  Sparkles,
  X,
  Compass,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
} from 'lucide-react';
import type { MeResponse, MentorProfile } from '@/lib/types';

export type MentorTab = 'overview' | 'profile' | 'skills' | 'availability' | 'plans';

interface MentorSidebarProps {
  activeTab: MentorTab;
  setActiveTab: (tab: MentorTab) => void;
  user: MeResponse | null;
  profile: MentorProfile | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MentorSidebar: React.FC<MentorSidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  profile,
  onLogout,
  isOpen,
  onClose,
}) => {
  const mentorName =
    profile?.fullName ||
    user?.mentorProfile?.fullName ||
    user?.email?.split('@')[0] ||
    'Mentor';

  const mentorInitial = mentorName.charAt(0).toUpperCase();
  const isVerified = profile?.isVerified ?? user?.mentorProfile?.isVerified ?? false;

  const navItems = [
    {
      id: 'overview' as MentorTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'profile' as MentorTab,
      label: 'Profile & Bio',
      icon: User,
      badge: undefined,
    },
    {
      id: 'skills' as MentorTab,
      label: 'Skills & Expertise',
      icon: Award,
      badge: profile?.user?.userSkills?.length ? `${profile.user.userSkills.length}` : undefined,
    },
    {
      id: 'availability' as MentorTab,
      label: 'Availability Slots',
      icon: Clock,
      badge: undefined,
    },
    {
      id: 'plans' as MentorTab,
      label: 'Mentorship Plans',
      icon: Package,
      badge: 'Manage',
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
                <span className="text-[10px] font-semibold tracking-wider text-orange-400 uppercase">
                  Mentor Portal
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
              Mentor Controls
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
              Quick Shortcuts
            </div>
            <Link
              href="/mentor/plans"
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Pricing Plans</span>
              </div>
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            </Link>
          </nav>
        </div>

        {/* Bottom Status Banner & Profile Card */}
        <div className="p-4 space-y-4">
          {/* Verification Badge Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/60 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold mb-1">
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Verified Mentor</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Application Pending</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isVerified
                ? 'Your profile is live on the public directory.'
                : 'Under admin review. We will notify you once approved.'}
            </p>
          </div>

          {/* User Profile Footer */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
                {mentorInitial}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-white truncate">
                  {mentorName}
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
