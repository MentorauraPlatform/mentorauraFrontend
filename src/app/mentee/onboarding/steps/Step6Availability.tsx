'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';
import type { Availability, TimeSlot } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface Props {
  data: OnboardingData;
  onUpdateAvailability: (availability: Availability) => void;
}

const DAYS: TimeSlot['day'][] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const TIMEZONES = [
  'Africa/Douala',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
];

export function Step6Availability({ data, onUpdateAvailability }: Props) {
  const availability = data.availability;
  const t = useTranslations('menteeOnboarding.step6');
  const tCommon = useTranslations('common');

  const getDayLabel = (day: string) => {
    const cap = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    return tCommon(cap);
  };

  const updateSlot = (index: number, updates: Partial<TimeSlot>) => {
    const slots = availability.slots.map((slot, i) => (i === index ? { ...slot, ...updates } : slot));
    onUpdateAvailability({ ...availability, slots });
  };

  const addSlot = () => {
    onUpdateAvailability({
      ...availability,
      slots: [...availability.slots, { day: 'MONDAY', startTime: '09:00', endTime: '10:00' }],
    });
  };

  const removeSlot = (index: number) => {
    onUpdateAvailability({
      ...availability,
      slots: availability.slots.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">{t('heading')}</h2>
        <p className="text-[#64748B] text-base">{t('subheading')}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">{t('timezoneLabel')}</label>
          <select
            value={availability.timezone}
            onChange={(e) => onUpdateAvailability({ ...availability, timezone: e.target.value })}
            className="w-full sm:w-72 px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-3">{t('availableSlotsLabel')}</label>
          <div className="space-y-3">
            {availability.slots.map((slot, index) => (
              <div key={index} className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl">
                <select
                  value={slot.day}
                  onChange={(e) => updateSlot(index, { day: e.target.value as TimeSlot['day'] })}
                  className="px-3 py-2 bg-[#FFFCF9] border border-[#E5E7EB] rounded-lg text-sm text-[#172033]"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{getDayLabel(day)}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(index, { startTime: e.target.value })}
                  className="px-3 py-2 bg-[#FFFCF9] border border-[#E5E7EB] rounded-lg text-sm text-[#172033]"
                />
                <span className="text-[#94A3B8] text-sm">{t('to')}</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(index, { endTime: e.target.value })}
                  className="px-3 py-2 bg-[#FFFCF9] border border-[#E5E7EB] rounded-lg text-sm text-[#172033]"
                />
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="ml-auto text-[#94A3B8] hover:text-red-500 text-sm font-bold px-2"
                  aria-label={t('removeSlotAria')}
                >
                  x
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="mt-3 text-sm font-bold text-[#F97316] hover:text-[#ea580c]"
          >
            {t('addAnotherSlot')}
          </button>
        </div>
      </div>
    </div>
  );
}
