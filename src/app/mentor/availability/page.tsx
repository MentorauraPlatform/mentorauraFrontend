'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { schedulingApi } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
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
  const { user, isLoading: authLoading } = useAuth();
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});
  const [timezone, setTimezone] = useState('UTC');
  const [blackouts, setBlackouts] = useState<Array<{ id: string; date: string; reason?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'mentor') {
      router.replace('/');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const [availRes, blackoutsRes] = await Promise.all([
          schedulingApi.getAvailability(),
          schedulingApi.listBlackouts(),
        ]);
        const avail = (availRes.data as Record<string, unknown>) || {};
        setAvailability(
          Object.fromEntries(
            DAYS.map((day) => [day, Array.isArray((avail as Record<string, unknown>)[day]) ? (avail as Record<string, unknown>)[day] as Array<{ start: string; end: string }> : []]),
          ) as Record<string, Array<{ start: string; end: string }>>,
        );
        setBlackouts((blackoutsRes.data.data ?? []).map((b) => ({ id: b.id, date: b.date, reason: b.reason })));
      } catch {
        toast.error('Failed to load availability');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, router]);

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
      const payload: Record<string, unknown> = { ...availability, timezone };
      await schedulingApi.updateAvailability(payload);
      toast.success('Availability saved');
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlackout = async () => {
    const date = prompt('Blackout date (YYYY-MM-DD)');
    if (!date) return;
    const reason = prompt('Reason (optional)') || undefined;
    try {
      const res = await schedulingApi.createBlackout({ date, reason });
      setBlackouts((prev) => [...prev, { id: res.data.id, date: res.data.date, reason: res.data.reason }]);
      toast.success('Blackout date added');
    } catch {
      toast.error('Failed to add blackout date');
    }
  };

  const handleDeleteBlackout = async (id: string) => {
    try {
      await schedulingApi.deleteBlackout(id);
      setBlackouts((prev) => prev.filter((b) => b.id !== id));
      toast.success('Blackout date removed');
    } catch {
      toast.error('Failed to remove blackout date');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="text-sm text-gray-600">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Availability & Schedule</h1>
            <p className="text-sm text-gray-600">Manage your weekly recurring hours and blackout dates.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-700">Timezone</label>
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
                  <button onClick={() => addSlot(day)} className="text-xs font-bold text-orange-600 hover:text-orange-700">+ Add slot</button>
                </div>
                <div className="space-y-2">
                  {(availability[day] ?? []).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="time" value={slot.start} onChange={(e) => updateSlot(day, idx, 'start', e.target.value)} className="h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                      <span className="text-xs text-gray-400">to</span>
                      <input type="time" value={slot.end} onChange={(e) => updateSlot(day, idx, 'end', e.target.value)} className="h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                      <button onClick={() => removeSlot(day, idx)} className="text-xs text-red-600 font-medium">Remove</button>
                    </div>
                  ))}
                  {(availability[day] ?? []).length === 0 && <p className="text-[11px] text-gray-400">No availability set</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Blackout Dates</h3>
            <button onClick={handleAddBlackout} className="text-xs font-bold text-orange-600 hover:text-orange-700">+ Add blackout</button>
          </div>
          <div className="space-y-2">
            {blackouts.map((b) => (
              <div key={b.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.date}</p>
                  {b.reason && <p className="text-xs text-gray-500">{b.reason}</p>}
                </div>
                <button onClick={() => handleDeleteBlackout(b.id)} className="text-xs text-red-600 font-medium">Remove</button>
              </div>
            ))}
            {blackouts.length === 0 && <p className="text-xs text-gray-500">No blackout dates.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
