'use client';

import type { Skill, SkillLevel } from '@/lib/types';
import { Award, AlertCircle, X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OnboardingData } from '../hooks/useMentorOnboarding';

const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';

const LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-200',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-200',
  EXPERT: 'bg-amber-100 text-amber-800 border-amber-200',
};

interface Step3SkillsProps {
  data: OnboardingData;
  skills: Skill[];
  selectedSkillId: string;
  selectedLevel: SkillLevel;
  saving: boolean;
  onSelectSkillId: (id: string) => void;
  onSelectLevel: (level: SkillLevel) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skillId: string) => void;
  onUpdateSkillLevel: (skillId: string, level: SkillLevel) => void;
}

export function Step3Skills({
  data,
  skills,
  selectedSkillId,
  selectedLevel,
  saving,
  onSelectSkillId,
  onSelectLevel,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkillLevel,
}: Step3SkillsProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-4 py-1.5 rounded-full mb-4">
          {t('buttons.stepOf6', { step: 3 })}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
          {t('skills.heading')}
        </h2>
        <p className="mt-3 text-xl text-[#475569]">
          {t('skills.subheading')}
        </p>
        {data.skills.length === 0 && (
          <div className="mt-4 p-5 bg-[#FFF7ED] border border-[#F97316]/30 rounded-xl">
            <p className="text-base text-[#F97316] font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {t('skills.pleaseAddAtLeastOneSkill')}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {data.skills.map((skill) => (
          <div
            key={skill.id}
            className={`flex items-center justify-between bg-[#FFFCF9] rounded-xl px-6 py-5 border ${LEVEL_COLORS[skill.level]}`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-[#172033]" />
              </div>
              <span className="text-lg font-bold text-[#172033] truncate">{skill.name}</span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <select
                value={skill.level}
                onChange={(e) => onUpdateSkillLevel(skill.id, e.target.value as SkillLevel)}
                className="border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
              >
                <option value="BEGINNER">{t('skills.beginner')}</option>
                <option value="INTERMEDIATE">{t('skills.intermediate')}</option>
                <option value="ADVANCED">{t('skills.advanced')}</option>
                <option value="EXPERT">{t('skills.expert')}</option>
              </select>
              <button
                onClick={() => onRemoveSkill(skill.id)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
        {data.skills.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-[#E5E7EB] rounded-2xl">
            <Award className="w-16 h-16 text-[#94A3B8] mx-auto mb-4 opacity-50" />
            <p className="text-lg text-[#64748B]">{t('skills.noSkillsAddedYet')}</p>
          </div>
        )}
      </div>

      <div className="border-t border-[#E5E7EB] pt-8">
        <label className={labelClass}>{t('skills.addASkill')}</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedSkillId}
            onChange={(e) => onSelectSkillId(e.target.value)}
            className="flex-1 h-14 text-base border border-[#E5E7EB] rounded-xl px-5 text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
          >
            <option value="">{t('skills.selectSkillPlaceholder')}</option>
            {skills
              .filter((s) => !data.skills.some((sk) => sk.id === s.id))
              .map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => onSelectLevel(e.target.value as SkillLevel)}
            className="h-14 text-base border border-[#E5E7EB] rounded-xl px-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316]"
          >
            <option value="BEGINNER">{t('skills.beginner')}</option>
            <option value="INTERMEDIATE">{t('skills.intermediate')}</option>
            <option value="ADVANCED">{t('skills.advanced')}</option>
            <option value="EXPERT">{t('skills.expert')}</option>
          </select>
          <button
            onClick={onAddSkill}
            disabled={!selectedSkillId || saving}
            className="bg-[#F97316] text-white px-8 py-3.5 rounded-xl hover:bg-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {saving ? t('skills.adding') : t('skills.addSkill')}
          </button>
        </div>
        {selectedSkillId && (
            <p className="mt-3 text-base text-emerald-600 font-medium">
              {t('skills.selected', { name: skills.find((s) => s.id === selectedSkillId)?.name ?? '' })}
            </p>
          )}
      </div>
    </div>
  );
}
