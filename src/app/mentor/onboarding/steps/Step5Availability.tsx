'use client';

import type { SkillLevel, TimeSlot } from '@/lib/types';
import { Globe, Plus, X, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OnboardingData } from '../hooks/useMentorOnboarding';

const inputClass =
  'w-full h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] placeholder:text-[#94A3B8] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] transition-all duration-200';
const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

interface Step5AvailabilityProps {
  data: OnboardingData;
  saving: boolean;
  onUpdateAvailability: (availability: OnboardingData['availability']) => void;
}

export function Step5Availability({ data, saving, onUpdateAvailability }: Step5AvailabilityProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
          {t('buttons.stepOf6', { step: 5 })}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
          {t('availability.heading')}
        </h2>
        <p className="mt-3 text-xl text-[#475569]">{t('availability.subheading')}</p>
      </div>
      <div className="space-y-6">
        <div className="max-w-sm">
          <label className={labelClass}>{t('availability.timezoneRequired')} <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Globe className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <select
              value={data.availability.timezone}
              onChange={(e) =>
                onUpdateAvailability({ ...data.availability, timezone: e.target.value })
              }
              className={`${inputClass} pl-14 appearance-none`}
            >
              <option value="Africa/Douala">Africa/Douala</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="Africa/Nairobi">Africa/Nairobi</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Asia/Shanghai">Asia/Shanghai</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>{t('availability.timeSlots')}</label>
          {Array.isArray(data.availability.slots) && (
            <div className="space-y-4">
              {data.availability.slots.map((slot, index) => (
                <div
                  key={index}
                  className="flex flex-wrap gap-4 items-center bg-[#F8FAFC] p-5 rounded-xl border border-[#E5E7EB]"
                >
                  <span className="flex-shrink-0 w-11 h-11 rounded-full bg-[#F97316] text-white text-sm font-bold flex items-center justify-center">
                    {DAY_LABELS[slot.day as keyof typeof DAY_LABELS] || slot.day.slice(0, 3)}
                  </span>
                  <select
                    value={slot.day}
                    onChange={(e) => {
                      const newSlots: TimeSlot[] = [...data.availability.slots];
                      newSlots[index] = { ...newSlots[index], day: e.target.value as TimeSlot['day'] };
                      onUpdateAvailability({ ...data.availability, slots: newSlots });
                    }}
                    className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => {
                      const newSlots = [...data.availability.slots];
                      newSlots[index] = { ...newSlots[index], startTime: e.target.value };
                      onUpdateAvailability({ ...data.availability, slots: newSlots });
                    }}
                    className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] w-32"
                  />
                  <span className="text-[#64748B] font-medium">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => {
                      const newSlots = [...data.availability.slots];
                      newSlots[index] = { ...newSlots[index], endTime: e.target.value };
                      onUpdateAvailability({ ...data.availability, slots: newSlots });
                    }}
                    className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] w-32"
                  />
                  <button
                    onClick={() => {
                      const newSlots = data.availability.slots.filter((_, i) => i !== index);
                      onUpdateAvailability({ ...data.availability, slots: newSlots });
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              const newSlots = [
                ...data.availability.slots,
                { day: 'MONDAY', startTime: '09:00', endTime: '12:00' } as TimeSlot,
              ];
              onUpdateAvailability({ ...data.availability, slots: newSlots });
            }}
            className="mt-4 text-[#F97316] hover:text-[#ea580c] font-bold text-base flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('availability.addTimeSlot')}
          </button>
        </div>
        <button
          onClick={() => onUpdateAvailability(data.availability)}
          disabled={saving}
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold text-base transition-colors flex items-center gap-3"
        >
          <Clock className="w-5 h-5" />
          {saving ? t('availability.saving') : t('availability.saveAvailability')}
        </button>
      </div>
    </div>
  );
}
