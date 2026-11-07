'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { schedulingApi } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { MentorDashboardLayout } from '@/components/layout/MentorDashboardLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { toast } from 'sonner';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const TIMEZONES = [
  'Africa/Douala',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
];

export default function MentorAvailabilityPage() {
  const router = useRouter();
  const t = useTranslations('mentorSubpages');
  const { user, isLoading: authLoading } = useAuth();
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});
  const [timezone, setTimezone] = useState('UTC');
  const [blackouts, setBlackouts] = useState<Array<{ id: string; date: string; reason?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const isMentor = Boolean(
      (user as unknown as { isMentor?: boolean })?.isMentor ||
      String(user?.role ?? '').trim().toLowerCase() === 'mentor'
    );
    if (!user || !isMentor) {
      router.replace('/');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const availRes = await schedulingApi.getAvailability();
        const blackoutsRes = await schedulingApi.listBlackouts();
        const avail = (availRes.data as Record<string, unknown>) || {};
        if (typeof avail.timezone === 'string' && avail.timezone) {
          setTimezone(avail.timezone);
        }
        const parsedDays: Record<string, Array<{ start: string; end: string }>> = Object.fromEntries(
          DAYS.map((day) => [day, [] as Array<{ start: string; end: string }>]),
        );
        if (Array.isArray(avail.slots)) {
          for (const slot of avail.slots as Array<{ day?: string; startTime?: string; endTime?: string; start?: string; end?: string }>) {
            const dayKey = String(slot.day ?? '').toLowerCase();
            if (parsedDays[dayKey]) {
              parsedDays[dayKey].push({
                start: slot.startTime || slot.start || '09:00',
                end: slot.endTime || slot.end || '12:00',
              });
            }
          }
        } else {
          for (const day of DAYS) {
            if (Array.isArray(avail[day])) {
              parsedDays[day] = (avail[day] as Array<{ start?: string; end?: string; startTime?: string; endTime?: string }>).map((s) => ({
                start: s.start || s.startTime || '09:00',
                end: s.end || s.endTime || '12:00',
              }));
            }
          }
        }
        setAvailability(parsedDays);
        setBlackouts((blackoutsRes.data as Array<{ id: string; date: string; reason?: string }>).map((b) => ({ id: b.id, date: b.date, reason: b.reason })));
      } catch {
        toast.error(t('availabilitySaveErrorToast'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router, t]);

  const updateDaySlots = (day: string, slots: Array<{ start: string; end: string }>) => {
    setAvailability((prev) => ({ ...prev, [day]: slots }));
  };

  const addSlot = (day: string) => {
    updateDaySlots(day, [...(availability[day] ?? []), { start: '09:00', end: '12:00' }]);
  };

  const removeSlot = (day: string, index: number) => {
    updateDaySlots(day, (availability[day] ?? []).filter((_, i) => i !== index));
  };

  const updateSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const slots = [...(availability[day] ?? [])];
    slots[index] = { ...slots[index], [field]: value };
    updateDaySlots(day, slots);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const slots = DAYS.flatMap((day) =>
        (availability[day] ?? []).map((slot) => ({
          day: day.toUpperCase(),
          startTime: slot.start,
          endTime: slot.end,
        })),
      );
      const payload: Record<string, unknown> = { ...availability, timezone, slots };
      await schedulingApi.updateAvailability(payload);
      toast.success(t('availabilitySavedToast'));
    } catch {
      toast.error(t('availabilitySaveErrorToast'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlackout = async () => {
    const date = prompt(t('blackoutDatePrompt'));
    if (!date) return;
    const reason = prompt(t('blackoutReasonPrompt')) || undefined;
    try {
      const res = await schedulingApi.createBlackout({ date, reason });
      setBlackouts((prev) => [...prev, { id: res.data.id, date: res.data.date, reason: res.data.reason }]);
      toast.success(t('blackoutAddedToast'));
    } catch {
      toast.error(t('blackoutAddErrorToast'));
    }
  };

  const handleDeleteBlackout = async (id: string) => {
    try {
      await schedulingApi.deleteBlackout(id);
      setBlackouts((prev) => prev.filter((b) => b.id !== id));
      toast.success(t('blackoutRemovedToast'));
    } catch {
      toast.error(t('blackoutRemoveErrorToast'));
    }
  };

  return (
    <MentorDashboardLayout activeTab="availability" activeTabTitle={t('availabilityTitle')}>
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingState message={t('loadingAvailability')} />
        </div>
      ) : (
        <div className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t('availabilityTitle')}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('availabilitySubtitle')}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50 whitespace-nowrap flex-nowrap shrink-0 transition-all shadow-sm"
            >
              {saving ? t('savingBtn') : t('saveChangesBtn')}
            </button>
          </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-700">{t('timezoneLabel')}</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="h-10 px-3 border border-gray-200 rounded-xl text-xs bg-white">
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS.map((day) => (
              <div key={day} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 capitalize">{day}</h3>
                  <button onClick={() => addSlot(day)} className="text-xs font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap flex-nowrap shrink-0">
                    {t('addSlotBtn')}
                  </button>
                </div>
                <div className="space-y-2">
                  {(availability[day] ?? []).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="time" value={slot.start} onChange={(e) => updateSlot(day, idx, 'start', e.target.value)} className="h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                      <span className="text-xs text-gray-400">{t('to')}</span>
                      <input type="time" value={slot.end} onChange={(e) => updateSlot(day, idx, 'end', e.target.value)} className="h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                      <button onClick={() => removeSlot(day, idx)} className="text-xs text-red-600 font-medium whitespace-nowrap flex-nowrap shrink-0">
                        {t('removeBtn')}
                      </button>
                    </div>
                  ))}
                  {(availability[day] ?? []).length === 0 && <p className="text-[11px] text-gray-400">{t('noAvailabilitySet')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">{t('blackoutDatesTitle')}</h3>
            <button onClick={handleAddBlackout} className="text-xs font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap flex-nowrap shrink-0">
              {t('addBlackoutBtn')}
            </button>
          </div>
          <div className="space-y-2">
            {blackouts.map((b) => (
              <div key={b.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.date}</p>
                  {b.reason && <p className="text-xs text-gray-500">{b.reason}</p>}
                </div>
                <button onClick={() => handleDeleteBlackout(b.id)} className="text-xs text-red-600 font-medium whitespace-nowrap flex-nowrap shrink-0">
                  {t('removeBtn')}
                </button>
              </div>
            ))}
            {blackouts.length === 0 && <p className="text-xs text-gray-500">{t('noBlackouts')}</p>}
          </div>
        </div>
      </div>
      )}
    </MentorDashboardLayout>
  );
}
