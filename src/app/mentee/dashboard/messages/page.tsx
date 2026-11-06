'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MenteeSidebar } from '@/components/mentee/MenteeSidebar';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { ChatView } from '@/components/messaging/ChatView';
import { messagingApi } from '@/lib/api/messaging';
import { LoadingState } from '@/components/ui/LoadingState';
import { useTranslations } from 'next-intl';

export default function MenteeMessagesPage() {
  const router = useRouter();
  const t = useTranslations('menteeDashboard');
  const { user, isLoading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      messagingApi
        .getUnreadCount()
        .then((res) => {
          setUnreadCount(res.data?.unreadCount ?? 0);
        })
        .catch(() => {});
    }
  }, [user]);

  if (authLoading || !user) {
    return <LoadingState message={t('loadingDashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans antialiased text-[#172033]">
      <MenteeSidebar
        activeTab="messages"
        setActiveTab={(tab) => {
          if (tab !== 'messages') {
            router.push('/mentee/dashboard');
          }
        }}
        user={user}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadMessagesCount={unreadCount}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        <MenteeHeader
          user={user}
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTabTitle={t('tabMessages')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full">
          <ChatView currentUserId={user.id} userRole="MENTEE" />
        </main>
      </div>
    </div>
  );
}
