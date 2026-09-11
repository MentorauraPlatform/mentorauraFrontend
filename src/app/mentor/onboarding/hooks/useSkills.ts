'use client';

import { useState, useCallback } from 'react';
import { mentorApi } from '@/lib/api/client';
import { toast } from 'sonner';
import type { Skill, SkillLevel } from '@/lib/types';
import { useTranslations } from 'next-intl';

export function useSkills(
  skills: Skill[],
  dataSkills: Array<{ id: string; name: string; level: SkillLevel }>,
  updateData: (updates: { skills: Array<{ id: string; name: string; level: SkillLevel }> }) => void,
  setError: (message: string | null) => void,
) {
  const t = useTranslations('onboarding');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const [saving, setSaving] = useState(false);

  const handleAddSkill = useCallback(async () => {
    if (!selectedSkillId) return;
    try {
      setSaving(true);
      setError(null);
      await mentorApi.addSkill({
        skillId: selectedSkillId,
        level: selectedLevel,
      });
      const skill = skills.find((s) => s.id === selectedSkillId);
      if (skill) {
        updateData({
          skills: [...dataSkills, { id: skill.id, name: skill.name, level: selectedLevel }],
        });
      }
      setSelectedSkillId('');
      toast.success('Skill added successfully', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || t('errors.failedToAddSkill'));
    } finally {
      setSaving(false);
    }
  }, [selectedSkillId, selectedLevel, skills, dataSkills, updateData, setError, t]);

  const handleRemoveSkill = useCallback(async (skillId: string) => {
    try {
      setSaving(true);
      setError(null);
      await mentorApi.removeSkill(skillId);
      updateData({
        skills: dataSkills.filter((s) => s.id !== skillId),
      });
      toast.success('Skill removed', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || t('errors.failedToRemoveSkill'));
    } finally {
      setSaving(false);
    }
  }, [dataSkills, updateData, setError, t]);

  const handleUpdateSkillLevel = useCallback(async (skillId: string, level: SkillLevel) => {
    const previous = dataSkills;
    updateData({
      skills: dataSkills.map((s) => (s.id === skillId ? { ...s, level } : s)),
    });
    try {
      setSaving(true);
      setError(null);
      await mentorApi.updateSkill(skillId, { level });
      toast.success('Skill level updated', {
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || t('errors.failedToUpdateSkillLevel'));
      updateData({ skills: previous });
    } finally {
      setSaving(false);
    }
  }, [dataSkills, updateData, setError, t]);

  return {
    selectedSkillId,
    setSelectedSkillId,
    selectedLevel,
    setSelectedLevel,
    saving,
    handleAddSkill,
    handleRemoveSkill,
    handleUpdateSkillLevel,
  };
}
