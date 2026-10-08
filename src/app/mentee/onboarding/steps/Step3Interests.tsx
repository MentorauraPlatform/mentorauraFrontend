'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  options: string[];
}

export function Step3Interests({ data, updateData, options }: Props) {
  const toggleInterest = (interest: string) => {
    if (data.interests.includes(interest)) {
      updateData({ interests: data.interests.filter((i) => i !== interest) });
    } else {
      updateData({ interests: [...data.interests, interest] });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">What are you interested in?</h2>
        <p className="text-[#64748B] text-base">Select at least one area. This helps us match you with the right mentors.</p>
      </div>

      <div className="flex flex-wrap gap-3 max-w-2xl">
        {options.map((interest) => {
          const selected = data.interests.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-colors ${
                selected
                  ? 'bg-[#F97316] text-white border-[#F97316]'
                  : 'bg-white text-[#172033] border-[#E5E7EB] hover:border-[#F97316]'
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>

      {data.interests.length === 0 && (
        <p className="text-sm text-[#94A3B8]">Pick at least one interest to continue.</p>
      )}
    </div>
  );
}
