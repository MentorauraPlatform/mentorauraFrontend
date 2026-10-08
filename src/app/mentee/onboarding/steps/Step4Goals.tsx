'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  options: string[];
}

export function Step4Goals({ data, updateData, options }: Props) {
  const toggleGoal = (goal: string) => {
    if (data.goals.includes(goal)) {
      updateData({ goals: data.goals.filter((g) => g !== goal) });
    } else {
      updateData({ goals: [...data.goals, goal] });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">What do you want to achieve?</h2>
        <p className="text-[#64748B] text-base">Select the goals you're hoping mentorship will help with.</p>
      </div>

      <div className="flex flex-wrap gap-3 max-w-2xl">
        {options.map((goal) => {
          const selected = data.goals.includes(goal);
          return (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-colors ${
                selected
                  ? 'bg-[#F97316] text-white border-[#F97316]'
                  : 'bg-white text-[#172033] border-[#E5E7EB] hover:border-[#F97316]'
              }`}
            >
              {goal}
            </button>
          );
        })}
      </div>

      {data.goals.length === 0 && (
        <p className="text-sm text-[#94A3B8]">Pick at least one goal to continue.</p>
      )}
    </div>
  );
}
