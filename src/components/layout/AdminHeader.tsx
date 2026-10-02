'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { ShieldAlert } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-orange-600" />
        <span className="text-sm font-bold text-slate-800 tracking-tight">
          MentorAura Administrative Panel
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-bold text-slate-900">{user?.email}</p>
          <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            {user?.role || 'ADMIN'}
          </span>
        </div>
        <Avatar name={user?.email || 'Admin'} size="sm" />
      </div>
    </header>
  );
};
