'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { notificationsApi, NotificationItem } from '@/lib/api/notifications';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

export const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      // Ignore background polling errors
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications({ limit: 15 });
      const items = Array.isArray(res.data) ? res.data : [];
      setNotifications(items);
      const metaUnread = (res.meta as { unreadCount?: number } | undefined)?.unreadCount;
      if (typeof metaUnread === 'number') {
        setUnreadCount(metaUnread);
      } else {
        setUnreadCount(items.filter((n) => !n.isRead).length);
      }
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void fetchUnreadCount();
    const timer = setInterval(() => {
      void fetchUnreadCount();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      void fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore error
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore error
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t('notifications')}
        className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-[#172033] uppercase tracking-wider">
                {t('notifications')}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF6B00]">
                  {t('newCount', { count: unreadCount })}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-10 flex items-center justify-center text-slate-400 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF6B00]" />
                <span>{t('loadingNotifications')}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center text-xs text-slate-400">
                {t('noNotifications')}
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isRead) void handleMarkAsRead(item.id);
                  }}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-orange-50/40 hover:bg-orange-50/70'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FF6B00] shrink-0" />
                      )}
                      <p className="text-xs font-bold text-[#172033] truncate">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleMarkAsRead(item.id);
                      }}
                      title={t('markAsRead')}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
