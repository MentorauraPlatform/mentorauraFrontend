'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Settings,
  LayoutDashboard,
  LogOut,
  DollarSign,
  Wallet,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Mentor Applications', href: '/admin/applications', icon: ShieldCheck },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Financial Reporting', href: '/admin/finance', icon: DollarSign },
    { label: 'Payout Management', href: '/admin/payouts', icon: Wallet },
    { label: 'Dispute Resolution', href: '/admin/disputes', icon: AlertTriangle },
    { label: 'Content Moderation', href: '/admin/moderation', icon: Flag },
    { label: 'Platform Settings', href: '/admin/configuration', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#172033] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-slate-800 shrink-0">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <BrandLogo size="sm" />
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60">
            Admin
          </span>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`admin-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={logout}
          id="admin-sidebar-exit-btn"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit Portal</span>
        </button>
      </div>
    </aside>
  );
};
