'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { MenteeDashboardLayout } from '@/components/layout/MenteeDashboardLayout';
import { ChatView } from '@/components/messaging/ChatView';
import { useTranslations } from 'next-intl';

export default function MenteeMessagesPage() {
  const t = useTranslations('menteeDashboard');
  const { user } = useAuth();

  return (
    <MenteeDashboardLayout activeTab="messages" activeTabTitle={t('tabMessages')}>
      <div className="w-full h-[calc(100vh-140px)]">
        {user && <ChatView currentUserId={user.id} userRole="MENTEE" />}
      </div>
    </MenteeDashboardLayout>
  );
}
