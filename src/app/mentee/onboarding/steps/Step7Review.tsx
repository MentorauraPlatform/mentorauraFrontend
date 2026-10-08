'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';
import type { SkillLevel } from '@/lib/types';

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
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">Review your information</h2>
        <p className="text-[#64748B] text-base">Make sure everything looks right before completing your onboarding.</p>
      </div>

      <div className="max-w-2xl space-y-6 bg-[#FFFCF9] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8">
        <Section title="Basic Info">
          <p className="text-base font-bold text-[#172033]">{data.fullName || '—'}</p>
          {data.headline && <p className="text-sm text-[#64748B] mt-1">{data.headline}</p>}
        </Section>

        <Section title="Skills">
          {data.skills.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No skills added.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${levelColors[skill.level]}`}
                >
                  {skill.name} · {skill.level.charAt(0) + skill.level.slice(1).toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="Interests">
          {data.interests.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">None selected.</p>
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

        <Section title="Goals">
          {data.goals.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">None selected.</p>
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

        <Section title="Experience">
          <div className="text-sm text-[#172033] space-y-1">
            <p><span className="font-bold">Level:</span> {data.experienceLevel ? data.experienceLevel.charAt(0) + data.experienceLevel.slice(1).toLowerCase() : '—'}</p>
            <p><span className="font-bold">Role:</span> {data.currentRole || '—'}</p>
            <p><span className="font-bold">Education:</span> {data.educationBackground || '—'}</p>
            <p><span className="font-bold">Years of experience:</span> {data.yearsOfExperience || '0'}</p>
          </div>
        </Section>

        <Section title="Availability">
          <p className="text-sm text-[#172033] mb-2"><span className="font-bold">Timezone:</span> {data.availability.timezone}</p>
          <div className="space-y-1">
            {data.availability.slots.map((slot, index) => (
              <p key={index} className="text-sm text-[#64748B]">
                {slot.day.charAt(0) + slot.day.slice(1).toLowerCase()}: {slot.startTime} – {slot.endTime}
              </p>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
