'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { MentorDashboardLayout } from '@/components/layout/MentorDashboardLayout';
import { ChatView } from '@/components/messaging/ChatView';
import { useTranslations } from 'next-intl';

export default function MentorMessagesPage() {
  const t = useTranslations('mentorSidebar');
  const { user } = useAuth();

  return (
    <MentorDashboardLayout activeTab="messages" activeTabTitle={t('messages')}>
      <div className="w-full h-[calc(100vh-140px)]">
        {user && <ChatView currentUserId={user.id} userRole="MENTOR" />}
      </div>
    </MentorDashboardLayout>
  );
}
