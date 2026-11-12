'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MentorDashboardLayout } from '@/components/layout/MentorDashboardLayout';
import { ChatView } from '@/components/messaging/ChatView';
import { useTranslations } from 'next-intl';

function MentorMessagesContent() {
  const t = useTranslations('mentorSidebar');
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  return (
    <MentorDashboardLayout activeTab="messages" activeTabTitle={t('messages')}>
      <div className="w-full h-[calc(100vh-140px)]">
        {user && (
          <ChatView
            currentUserId={user.id}
            initialConversationId={conversationId}
            userRole="MENTOR"
          />
        )}
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading messages...</div>}>
      <MentorMessagesContent />
    </Suspense>
  );
}
