'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi, AdminUserItem } from '@/lib/api/client';
import {
  Search,
  UserPlus,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const t = useTranslations('admin.users');
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminApi
      .getUsers({ role: roleFilter || undefined, q: search })
      .then((res) => {
        const raw = res as unknown;
        let list: AdminUserItem[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).data)) {
          list = (res.data as any).data;
        } else if (Array.isArray(raw)) {
          list = raw as AdminUserItem[];
        }
        setUsers(list);
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        toast.error(t('loading'));
      })
      .finally(() => setLoading(false));
  }, [roleFilter, search, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error(t('emailLabel'));
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.inviteAdmin({ email: inviteEmail, role: inviteRole });
      toast.success(t('inviteSentSuccess'));
      setInviteModalOpen(false);
      setInviteEmail('');
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('inviteSentSuccess');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user: AdminUserItem) => {
    const nextState = !user.isActive;
    try {
      await adminApi.toggleUserActive(user.id, nextState);
      toast.success(`User '${user.email}' ${nextState ? 'activated' : 'suspended'}.`);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user active status';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2 font-bold shadow-md shrink-0 whitespace-nowrap flex-nowrap"
          onClick={() => setInviteModalOpen(true)}
        >
          <UserPlus className="w-4 h-4 shrink-0" /> <span>{t('inviteAdminBtn')}</span>
        </Button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto shrink-0">
          {['', 'MENTEE', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize whitespace-nowrap flex-nowrap shrink-0 ${
                roleFilter === r
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === '' ? t('allRoles') : r.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-10 pr-3 h-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow transition-all flex items-center justify-center shrink-0 active:scale-[0.98] whitespace-nowrap flex-nowrap"
          >
            {t('userCol')}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <Card padding="lg" className="p-0 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin shrink-0" />
            <p className="text-xs font-semibold text-slate-500">{t('loading')}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto shrink-0" />
            <p className="text-sm font-bold text-slate-800">{t('allRoles')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">{t('userCol')}</th>
                  <th className="p-4">{t('roleCol')}</th>
                  <th className="p-4">{t('statusCol')}</th>
                  <th className="p-4">{t('joinedCol')}</th>
                  <th className="p-4 text-right">{t('actionsCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const displayName =
                    u.menteeProfile?.fullName || u.mentorProfile?.fullName || u.email.split('@')[0];

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {displayName[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{displayName}</p>
                            <p className="text-slate-500 text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
                              ? 'orange'
                              : u.role === 'MENTOR'
                              ? 'navy'
                              : 'slate'
                          }
                          size="sm"
                          className="capitalize font-bold whitespace-nowrap flex-nowrap shrink-0"
                        >
                          {u.role.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {u.isActive ? (
                          <Badge variant="success" size="sm" className="gap-1 font-semibold whitespace-nowrap flex-nowrap shrink-0">
                            <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" /> {t('active')}
                          </Badge>
                        ) : (
                          <Badge variant="error" size="sm" className="gap-1 font-semibold whitespace-nowrap flex-nowrap shrink-0">
                            <UserX className="w-3 h-3 text-rose-600 shrink-0" /> {t('suspended')}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={u.isActive ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleActive(u)}
                          className={`text-xs font-semibold whitespace-nowrap flex-nowrap shrink-0 ${
                            u.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600'
                          }`}
                        >
                          {u.isActive ? t('suspendBtn') : t('reactivateBtn')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Admin Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleInviteSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <h3 className="text-lg font-bold text-slate-900">{t('inviteModalTitle')}</h3>
            <p className="text-xs text-slate-500">
              {t('subtitle')}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('emailLabel')}</label>
                <input
                  type="email"
                  required
                  placeholder="admin@mentoraura.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('roleLabel')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN')}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInviteModalOpen(false)}
                className="whitespace-nowrap flex-nowrap shrink-0"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                className="font-bold whitespace-nowrap flex-nowrap shrink-0"
              >
                {actionLoading ? t('sending') : t('sendInvite')}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
