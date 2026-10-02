'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    const userRole = String(user.role ?? '').trim().toLowerCase();

    if (userRole === 'admin' || userRole === 'super_admin') {
      router.replace('/admin');
      return;
    }

    const isMentor = Boolean(
      (user as unknown as { isMentor?: boolean })?.isMentor ||
        userRole === 'mentor'
    );

    if (isMentor) {
      router.replace('/mentor/dashboard');
    } else {
      router.replace('/mentee/dashboard/mentorships');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
      <div className="text-lg text-gray-600">Redirecting to your dashboard...</div>
    </div>
  );
}
