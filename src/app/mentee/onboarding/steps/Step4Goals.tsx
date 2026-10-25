'use client';

import { useState } from 'react';
import type { OnboardingData } from '../hooks/useMenteeOnboarding';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  options: string[];
}

export function Step4Goals({ data, updateData, options }: Props) {
  const [customInput, setCustomInput] = useState('');

  const toggleGoal = (goal: string) => {
    if (data.goals.includes(goal)) {
      updateData({ goals: data.goals.filter((g) => g !== goal) });
    } else {
      updateData({ goals: [...data.goals, goal] });
    }
  };

  const customGoals = data.goals.filter((goal) => !options.includes(goal));

  const addCustomGoal = () => {
    const trimmed = customInput.trim().slice(0, 50);

    if (!trimmed || data.goals.includes(trimmed)) return;

    updateData({ goals: [...data.goals, trimmed] });
    setCustomInput('');
  };

  const removeCustomGoal = (goal: string) => {
    updateData({ goals: data.goals.filter((g) => g !== goal) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomGoal();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">
          What do you want to achieve?
        </h2>
        <p className="text-[#64748B] text-base">
          Select the goals you&apos;re hoping mentorship will help with.
        </p>
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

        {customGoals.map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => removeCustomGoal(goal)}
            aria-label={`Remove custom goal ${goal}`}
            className="px-5 py-2.5 rounded-full text-sm font-bold border bg-[#F97316] text-white border-[#F97316] flex items-center gap-2"
          >
            {goal}
            <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-bold text-[#172033] mb-2">
          Don&apos;t see your goal? Add your own
        </label>

        <div className="flex gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={50}
            placeholder="e.g. Launch a side project"
            className="flex-1 px-4 py-3 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />

          <button
            type="button"
            onClick={addCustomGoal}
            disabled={!customInput.trim()}
            className="px-5 py-3 bg-[#172033] text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Add
          </button>
        </div>
      </div>

      {data.goals.length === 0 && (
        <p className="text-sm text-[#94A3B8]">
          Pick at least one goal to continue.
        </p>
      )}
    </div>
  );
}