'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MenteeSidebar, MenteeTab } from '@/components/mentee/MenteeSidebar';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { messagingApi } from '@/lib/api/messaging';
import { useTranslations } from 'next-intl';

export interface MenteeDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: MenteeTab;
  setActiveTab?: (tab: MenteeTab) => void;
  activeTabTitle?: string;
  hidePadding?: boolean;
}

let globalMenteeUnreadCount: number = 0;
let lastMenteeUnreadFetch = 0;
const UNREAD_CACHE_TTL = 30 * 1000; // 30s TTL

export function MenteeDashboardLayout({
  children,
  activeTab = 'overview',
  setActiveTab,
  activeTabTitle,
  hidePadding = false,
}: MenteeDashboardLayoutProps) {
  const router = useRouter();
  const t = useTranslations('menteeDashboard');
  const tCommon = useTranslations('common');
  const { user, isLoading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(globalMenteeUnreadCount);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?mode=login');
      return;
    }

    if (!authLoading && user) {
      const userRole = String(user.role ?? '').trim().toLowerCase();
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin');
        return;
      }

      // If mentee onboarding is incomplete, redirect to onboarding wizard
      if (
        !user.isMentor &&
        (!user.menteeProfile || !user.menteeProfile.onboardingCompleted)
      ) {
        router.push('/mentee/onboarding');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const now = Date.now();
    if (now - lastMenteeUnreadFetch < UNREAD_CACHE_TTL) {
      setUnreadMessagesCount(globalMenteeUnreadCount);
      return;
    }

    messagingApi
      .getUnreadCount()
      .then((res) => {
        const count = res.data?.unreadCount ?? 0;
        globalMenteeUnreadCount = count;
        lastMenteeUnreadFetch = Date.now();
        setUnreadMessagesCount(count);
      })
      .catch(() => {});
  }, [user]);

  const handleTabChange = (tab: MenteeTab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      if (tab === 'messages') {
        router.push('/mentee/dashboard/messages');
      } else if (tab === 'mentors') {
        router.push('/mentee/dashboard/mentorships');
      } else {
        router.push(`/mentee/dashboard?tab=${tab}`);
      }
    }
  };

  const tabTitles: Record<MenteeTab, string> = {
    overview: t('tabOverview'),
    sessions: t('tabSessions'),
    mentors: t('tabMentors'),
    messages: t('tabMessages'),
    goals: t('tabGoals'),
    settings: t('tabSettings'),
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <LoadingState message={tCommon('loading')} />
      </div>
    );
  }

  const resolvedTitle = activeTabTitle || tabTitles[activeTab] || t('tabOverview');

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans antialiased text-[#172033]">
      {/* Responsive Mentee Sidebar */}
      <MenteeSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        <MenteeHeader
          user={user}
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTabTitle={resolvedTitle}
        />

        <main className={`flex-1 w-full ${hidePadding ? '' : 'p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
