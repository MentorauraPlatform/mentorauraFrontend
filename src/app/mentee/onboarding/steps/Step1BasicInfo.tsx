'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function Step1BasicInfo({ data, updateData }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">Let's get to know you</h2>
        <p className="text-[#64748B] text-base">Tell us a bit about yourself to personalize your mentee experience.</p>
      </div>

      <div className="space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">
            Full Name <span className="text-[#F97316]">*</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="Jane Doe"
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">Headline</label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => updateData({ headline: e.target.value })}
            placeholder="Aspiring Software Engineer"
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
          <p className="mt-2 text-xs text-[#94A3B8]">A short line describing where you are in your journey.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#172033] mb-2">Avatar URL</label>
          <input
            type="text"
            value={data.avatarUrl}
            onChange={(e) => updateData({ avatarUrl: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
          <p className="mt-2 text-xs text-[#94A3B8]">Optional. Paste a link to your profile picture.</p>
        </div>
      </div>
    </div>
  );
}
