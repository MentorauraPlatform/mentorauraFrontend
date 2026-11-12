'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MenteeDashboardLayout } from '@/components/layout/MenteeDashboardLayout';
import { ChatView } from '@/components/messaging/ChatView';
import { useTranslations } from 'next-intl';

function MenteeMessagesContent() {
  const t = useTranslations('menteeDashboard');
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  return (
    <MenteeDashboardLayout activeTab="messages" activeTabTitle={t('tabMessages')}>
      <div className="w-full h-[calc(100vh-140px)]">
        {user && (
          <ChatView
            currentUserId={user.id}
            initialConversationId={conversationId}
            userRole="MENTEE"
          />
        )}
      </div>
    </MenteeDashboardLayout>
  );
}

export default function MenteeMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading messages...</div>}>
      <MenteeMessagesContent />
    </Suspense>
  );
}
