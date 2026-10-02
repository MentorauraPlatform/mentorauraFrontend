'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

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

type Slot = {
  slotUtc: string;
  displayTime: string;
};

type Props = {
  mentorId: string;
  onSelectSlot?: (slot: Slot) => void;
  selectedSlotUtc?: string | null;
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function TimeSlotPicker({ mentorId, onSelectSlot, selectedSlotUtc }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const loadSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/mentors/${mentorId}/slots?from=${formatDate(weekStart)}&to=${formatDate(weekEnd)}&timezone=${encodeURIComponent(timezone)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Failed to load slots');
      }
      const json = await res.json();
      setSlots(json.data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load slots';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSlots();
  }, [mentorId, weekStart, weekEnd, timezone]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const utcDate = new Date(slot.slotUtc);
      const dayName = utcDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }).toLowerCase();
      const list = map.get(dayName) ?? [];
      list.push(slot);
      map.set(dayName, list);
    }
    return map;
  }, [slots, timezone]);

  const todayLabel = useMemo(() => {
    const today = new Date();
    const todayStart = startOfWeek(today);
    const isCurrent = todayStart.getUTCDate() === weekStart.getUTCDate() && todayStart.getUTCMonth() === weekStart.getUTCMonth();
    return isCurrent ? ' (This week)' : '';
  }, [weekStart]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Available Slots</h3>
          <p className="text-xs text-gray-500">
            {weekStart.toLocaleDateString()} – {weekEnd.toLocaleDateString()}{todayLabel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 bg-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekStart((prev) => addDays(prev, -7))}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="px-3 py-2 text-xs font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => setWeekStart((prev) => addDays(prev, 7))}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">Loading slots...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const daySlots = groupedByDay.get(day) ?? [];
            const dateObj = addDays(weekStart, DAYS.indexOf(day));
            const isToday = dateObj.toDateString() === new Date().toDateString();

            return (
              <div key={day} className={`rounded-xl border p-3 ${isToday ? 'border-orange-300 bg-orange-50/40' : 'border-gray-200 bg-gray-50/40'}`}>
                <div className="text-center mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day.slice(0, 3)}</p>
                  <p className={`text-sm font-black ${isToday ? 'text-orange-600' : 'text-gray-900'}`}>{dateObj.getUTCDate()}</p>
                </div>

                <div className="space-y-2">
                  {daySlots.length === 0 && (
                    <p className="text-[10px] text-gray-400 text-center">No slots</p>
                  )}
                  {daySlots.map((slot) => {
                    const isSelected = slot.slotUtc === selectedSlotUtc;
                    return (
                      <button
                        key={slot.slotUtc}
                        onClick={() => onSelectSlot?.(slot)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg border text-[11px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-700'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {slot.displayTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
