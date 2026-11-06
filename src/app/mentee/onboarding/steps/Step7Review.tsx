'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';
import type { SkillLevel } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface Props {
  data: OnboardingData;
  levelColors: Record<SkillLevel, string>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E5E7EB] pb-6 last:border-b-0 last:pb-0">
      <h3 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function Step7Review({ data, levelColors }: Props) {
  const t = useTranslations('menteeOnboarding.step7');
  const tStep2 = useTranslations('menteeOnboarding.step2');
  const tCommon = useTranslations('common');

  const getLevelLabel = (level: SkillLevel | '') => {
    switch (level) {
      case 'BEGINNER':
        return tStep2('beginner');
      case 'INTERMEDIATE':
        return tStep2('intermediate');
      case 'ADVANCED':
        return tStep2('advanced');
      case 'EXPERT':
        return tStep2('expert');
      default:
        return '—';
    }
  };

  const getDayLabel = (day?: string) => {
    if (!day) return t('dayNotSet');
    const cap = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    return tCommon(cap);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">{t('heading')}</h2>
        <p className="text-[#64748B] text-base">{t('subheading')}</p>
      </div>

      <div className="max-w-2xl space-y-6 bg-[#FFFCF9] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8">
        <Section title={t('basicInfo')}>
          <p className="text-base font-bold text-[#172033]">{data.fullName || '—'}</p>
          {data.headline && <p className="text-sm text-[#64748B] mt-1">{data.headline}</p>}
        </Section>

        <Section title={t('skills')}>
          {data.skills.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">{t('noSkillsAdded')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${levelColors[skill.level]}`}
                >
                  {skill.name} · {getLevelLabel(skill.level)}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title={t('interests')}>
          {data.interests.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">{t('noneSelected')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest) => (
                <span key={interest} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#172033]">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title={t('goals')}>
          {data.goals.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">{t('noneSelected')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.goals.map((goal) => (
                <span key={goal} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#172033]">
                  {goal}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title={t('experience')}>
          <div className="text-sm text-[#172033] space-y-1">
            <p><span className="font-bold">{t('level')}</span> {getLevelLabel(data.experienceLevel)}</p>
            <p><span className="font-bold">{t('role')}</span> {data.currentRole || '—'}</p>
            <p><span className="font-bold">{t('education')}</span> {data.educationBackground || '—'}</p>
            <p><span className="font-bold">{t('yearsOfExperience')}</span> {data.yearsOfExperience || '0'}</p>
          </div>
        </Section>

        <Section title={t('availability')}>
          <p className="text-sm text-[#172033] mb-2"><span className="font-bold">{t('timezone')}</span> {data.availability.timezone}</p>
          <div className="space-y-1">
            {data.availability.slots.map((slot, index) => (
              <p key={index} className="text-sm text-[#64748B]">
                {getDayLabel(slot.day)}: {slot.startTime || '--'} - {slot.endTime || '--'}
              </p>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
