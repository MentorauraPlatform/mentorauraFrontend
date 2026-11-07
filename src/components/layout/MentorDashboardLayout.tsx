'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MentorSidebar, MentorTab } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { messagingApi } from '@/lib/api/messaging';
import { mentorApi } from '@/lib/api/client';
import type { MentorProfile } from '@/lib/types';
import { useTranslations } from 'next-intl';

export interface MentorDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: MentorTab;
  setActiveTab?: (tab: MentorTab) => void;
  activeTabTitle?: string;
  hidePadding?: boolean;
}

export function MentorDashboardLayout({
  children,
  activeTab = 'overview',
  setActiveTab,
  activeTabTitle,
  hidePadding = false,
}: MentorDashboardLayoutProps) {
  const router = useRouter();
  const t = useTranslations('mentorDashboard');
  const tSidebar = useTranslations('mentorSidebar');
  const tCommon = useTranslations('common');
  const { user, isLoading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?mode=login');
      return;
    }

    if (!authLoading && user) {
      const isMentor = Boolean(
        (user as unknown as { isMentor?: boolean })?.isMentor ||
        String(user?.role ?? '').trim().toLowerCase() === 'mentor'
      );
      if (!isMentor) {
        router.push('/mentee/dashboard');
        return;
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      mentorApi
        .getMyProfile()
        .then((res) => {
          setProfile(res.data || null);
        })
        .catch(() => {});

      messagingApi
        .getUnreadCount()
        .then((res) => {
          setUnreadMessagesCount(res.data?.unreadCount ?? 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleTabChange = (tab: MentorTab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      if (tab === 'mentees') {
        router.push('/mentor/mentees');
      } else if (tab === 'plans') {
        router.push('/mentor/plans');
      } else if (tab === 'availability') {
        router.push('/mentor/availability');
      } else if (tab === 'messages') {
        router.push('/mentor/dashboard/messages');
      } else {
        router.push(`/mentor/dashboard?tab=${tab}`);
      }
    }
  };

  const tabTitles: Record<MentorTab, string> = {
    overview: t('tabOverview'),
    profile: t('tabProfile'),
    skills: t('tabSkills'),
    availability: t('tabAvailability'),
    plans: t('tabPlans'),
    bookings: t('tabBookings'),
    messages: t('tabMessages'),
    mentees: tSidebar('menteesApplications') || 'Mentees & Applications',
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
      {/* Responsive Mentor Sidebar */}
      <MentorSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        profile={profile}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        <MentorHeader
          user={user}
          profile={profile}
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
