'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth?mode=login');
      } else if (user?.role !== 'admin' && user?.role !== 'super_admin' && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  const isAdminRole =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';

  if (!isAuthenticated || !isAdminRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-500 border border-rose-800 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">403 — Access Denied</h2>
        <p className="text-sm text-slate-400 max-w-md">
          You do not have administrative permissions to view this portal.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
