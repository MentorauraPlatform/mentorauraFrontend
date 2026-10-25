'use client';

import { useState } from 'react';
import type { OnboardingData } from '../hooks/useMenteeOnboarding';

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  options: string[];
}

export function Step3Interests({ data, updateData, options }: Props) {
  const [customInput, setCustomInput] = useState('');

  const toggleInterest = (interest: string) => {
    if (data.interests.includes(interest)) {
      updateData({ interests: data.interests.filter((i) => i !== interest) });
    } else {
      updateData({ interests: [...data.interests, interest] });
    }
  };

  const customInterests = data.interests.filter((i) => !options.includes(i));

  const addCustomInterest = () => {
    const trimmed = customInput.trim().slice(0, 50);
    if (!trimmed || data.interests.includes(trimmed)) return;
    updateData({ interests: [...data.interests, trimmed] });
    setCustomInput('');
  };

  const removeCustomInterest = (interest: string) => {
    updateData({ interests: data.interests.filter((i) => i !== interest) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
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
        {customInterests.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => removeCustomInterest(interest)}
            className="px-5 py-2.5 rounded-full text-sm font-bold border bg-[#F97316] text-white border-[#F97316] flex items-center gap-2"
          >
            {interest}
            <span aria-hidden="true">x</span>
          </button>
        ))}
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-bold text-[#172033] mb-2">Don&apos;t see your interest? Add your own</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={50}
            placeholder="e.g. Blockchain, UX Research"
            className="flex-1 px-4 py-3 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
          <button
            type="button"
            onClick={addCustomInterest}
            disabled={!customInput.trim()}
            className="px-5 py-3 bg-[#172033] text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Add
          </button>
        </div>
      </div>

      {data.interests.length === 0 && (
        <p className="text-sm text-[#94A3B8]">Pick at least one interest to continue.</p>
      )}
    </div>
  );
}
