'use client';

import type { OnboardingData } from '../hooks/useMenteeOnboarding';
import type { Skill, SkillLevel } from '@/lib/types';

interface Props {
  data: OnboardingData;
  skills: Skill[];
  skillNameInput: string;
  setSkillNameInput: (value: string) => void;
  skillLevelInput: SkillLevel;
  setSkillLevelInput: (value: SkillLevel) => void;
  skillSaving: boolean;
  onAddSkill: () => void;
  onRemoveSkill: (skillId: string) => void;
  onUpdateSkillLevel: (skillId: string, level: SkillLevel) => void;
  levelColors: Record<SkillLevel, string>;
}

const LEVELS: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export function Step2Skills({
  data,
  skills,
  skillNameInput,
  setSkillNameInput,
  skillLevelInput,
  setSkillLevelInput,
  skillSaving,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkillLevel,
  levelColors,
}: Props) {
  const existingNames = new Set(data.skills.map((s) => s.name.toLowerCase()));
  const suggestions = skills
    .filter((s) => !existingNames.has(s.name.toLowerCase()))
    .filter((s) => s.name.toLowerCase().includes(skillNameInput.toLowerCase()))
    .slice(0, 6);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddSkill();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">What are you learning?</h2>
        <p className="text-[#64748B] text-base">Add the skills you're building, and your current level in each.</p>
      </div>

      <div className="max-w-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={skillNameInput}
              onChange={(e) => setSkillNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Python, JavaScript, PostgreSQL"
              className="w-full px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
            />
            {skillNameInput.trim().length > 0 && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSkillNameInput(s.name)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#172033] hover:bg-[#FFF7ED]"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select
            value={skillLevelInput}
            onChange={(e) => setSkillLevelInput(e.target.value as SkillLevel)}
            className="px-4 py-3.5 bg-[#FFFCF9] border border-[#E5E7EB] rounded-xl text-base text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddSkill}
            disabled={!skillNameInput.trim() || skillSaving}
            className="px-6 py-3.5 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#ea580c] disabled:opacity-50 transition-colors"
          >
            {skillSaving ? 'Adding...' : 'Add'}
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {data.skills.length === 0 && (
            <p className="text-sm text-[#94A3B8]">No skills added yet.</p>
          )}
          {data.skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl"
            >
              <span className="font-semibold text-[#172033]">{skill.name}</span>
              <div className="flex items-center gap-2">
                <select
                  value={skill.level}
                  onChange={(e) => onUpdateSkillLevel(skill.id, e.target.value as SkillLevel)}
                  disabled={skillSaving}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${levelColors[skill.level]}`}
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill.id)}
                  disabled={skillSaving}
                  className="text-[#94A3B8] hover:text-red-500 disabled:opacity-50 text-sm font-bold px-2"
                  aria-label={`Remove ${skill.name}`}
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
