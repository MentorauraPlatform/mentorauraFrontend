'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ChatView } from '@/components/messaging/ChatView';
import { messagingApi } from '@/lib/api/messaging';
import { mentorApi } from '@/lib/api/client';
import { LoadingState } from '@/components/ui/LoadingState';
import type { MentorProfile } from '@/lib/types';

export default function MentorMessagesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
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
          setUnreadCount(res.data?.unreadCount ?? 0);
        })
        .catch(() => {});
    }
  }, [user]);

  if (authLoading || !user) {
    return <LoadingState message="Loading messages..." />;
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans antialiased text-[#172033]">
      <MentorSidebar
        activeTab="messages"
        setActiveTab={(tab) => {
          if (tab !== 'messages') {
            router.push('/mentor/dashboard');
          }
        }}
        user={user}
        profile={profile}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadMessagesCount={unreadCount}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        <MentorHeader
          user={user}
          profile={profile}
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTabTitle="Direct Messaging"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ChatView currentUserId={user.id} userRole="MENTOR" />
        </main>
      </div>
    </div>
  );
}
