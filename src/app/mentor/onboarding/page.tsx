'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useMentorOnboarding } from './hooks/useMentorOnboarding';
import { useSkills } from './hooks/useSkills';
import { Step1Intro } from './steps/Step1Intro';
import { Step2Professional } from './steps/Step2Professional';
import { Step3Skills } from './steps/Step3Skills';
import { Step4Experience } from './steps/Step4Experience';
import { Step5Availability } from './steps/Step5Availability';
import { Step6Review } from './steps/Step6Review';
import { Step7Complete } from './steps/Step7Complete';
import type { OnboardingData } from './hooks/useMentorOnboarding';

const STEPS = [
  { id: 1, title: 'steps.intro.title', description: 'steps.intro.description' },
  { id: 2, title: 'steps.professional.title', description: 'steps.professional.description' },
  { id: 3, title: 'steps.skills.title', description: 'steps.skills.description' },
  { id: 4, title: 'steps.experience.title', description: 'steps.experience.description' },
  { id: 5, title: 'steps.availability.title', description: 'steps.availability.description' },
  { id: 6, title: 'steps.review.title', description: 'steps.review.description' },
  { id: 7, title: 'complete.heading', description: 'complete.description' },
];

const visibleSteps = STEPS.filter((s) => s.id <= 6);

export default function MentorOnboardingPage() {
  const onboarding = useMentorOnboarding();
  const [rawAreas, setRawAreas] = useState('');

  const skillsHook = useSkills(
    onboarding.skills,
    onboarding.data.skills,
    onboarding.updateData,
    onboarding.setError,
  );

  const parseAreas = (value: string) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const syncAreasFromRaw = () => {
    const areas = parseAreas(rawAreas);
    onboarding.updateData({ areasOfExpertise: areas });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      syncAreasFromRaw();
    }
  };

  if (onboarding.authLoading || !onboarding.profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#E5E7EB] border-t-[#F97316] animate-spin" />
          <span className="text-lg text-[#64748B] font-medium">{onboarding.t('loading.loadingProfile')}</span>
        </div>
      </div>
    );
  }

  if (onboarding.loading && !onboarding.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#E5E7EB] border-t-[#F97316] animate-spin" />
          <span className="text-lg text-[#64748B] font-medium">{onboarding.t('loading.loadingProfile')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans text-[#172033]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-serif {
          font-family: 'Fraunces', ui-serif, Georgia, serif;
        }
        body {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className="bg-[#172033] px-8 sm:px-10 py-8 sm:py-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentor Onboarding</h1>
                <p className="text-sm text-white/60 font-medium">
                  Step {onboarding.currentStep} of 6: {onboarding.t(STEPS[onboarding.currentStep - 1]?.title)}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {onboarding.currentStep < 7 && (
            <div className="px-8 sm:px-10 pt-8 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-3">
                {visibleSteps.map((step, index) => {
                  const isActive = onboarding.currentStep === step.id;
                  const isCompleted = onboarding.currentStep > step.id;
                  return (
                    <div key={step.id} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center gap-2 min-w-[56px] sm:min-w-[64px]">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 text-base font-bold ${
                            isActive
                              ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/40 scale-105'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#E5E7EB] text-[#64748B]'
                          }`}
                        >
                          {isCompleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          ) : (
                            step.id
                          )}
                        </div>
                        <span className={`text-xs sm:text-sm font-bold text-center ${
                          isActive ? 'text-[#F97316]' : isCompleted ? 'text-emerald-600' : 'text-[#64748B]'
                        }`}>
                          {onboarding.t(step.title)}
                        </span>
                      </div>
                      {index < visibleSteps.length - 1 && (
                        <div className={`w-8 sm:w-12 h-1 mx-2 rounded ${
                          isCompleted ? 'bg-emerald-600' : 'bg-[#E5E7EB]'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8 sm:p-10 lg:p-12">
            {onboarding.error && (
              <div className="mb-8 bg-red-50/80 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-4 text-base">
                <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-500" />
                {onboarding.error}
                {onboarding.submitFailed && onboarding.currentStep === 6 && (
                  <button
                    onClick={onboarding.retrySubmit}
                    disabled={onboarding.loading}
                    className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold text-sm transition-colors"
                  >
                    {onboarding.t('errors.retry')}
                  </button>
                )}
              </div>
            )}

            {onboarding.currentStep === 1 && (
              <Step1Intro visibleSteps={visibleSteps} />
            )}
            {onboarding.currentStep === 2 && (
              <Step2Professional data={onboarding.data} updateData={onboarding.updateData} />
            )}
            {onboarding.currentStep === 3 && (
              <Step3Skills
                data={onboarding.data}
                skills={onboarding.skills}
                selectedSkillId={skillsHook.selectedSkillId}
                selectedLevel={skillsHook.selectedLevel}
                saving={skillsHook.saving}
                onSelectSkillId={skillsHook.setSelectedSkillId}
                onSelectLevel={skillsHook.setSelectedLevel}
                onAddSkill={skillsHook.handleAddSkill}
                onRemoveSkill={skillsHook.handleRemoveSkill}
                onUpdateSkillLevel={skillsHook.handleUpdateSkillLevel}
              />
            )}
            {onboarding.currentStep === 4 && (
              <Step4Experience
                data={onboarding.data}
                rawAreas={rawAreas}
                onRawAreasChange={setRawAreas}
                onExperienceChange={(value) => onboarding.updateData({ experience: value })}
                onBlur={syncAreasFromRaw}
                onKeyDown={handleKeyDown}
              />
            )}
            {onboarding.currentStep === 5 && (
              <Step5Availability
                data={onboarding.data}
                saving={skillsHook.saving}
                onUpdateAvailability={(availability) => onboarding.updateData({ availability })}
              />
            )}
            {onboarding.currentStep === 6 && (
              <Step6Review
                data={onboarding.data}
                getSkillLevelLabel={(level) => {
                  switch (level) {
                    case 'BEGINNER':
                      return onboarding.t('skills.beginner');
                    case 'INTERMEDIATE':
                      return onboarding.t('skills.intermediate');
                    case 'ADVANCED':
                      return onboarding.t('skills.advanced');
                    case 'EXPERT':
                      return onboarding.t('skills.expert');
                  }
                }}
              />
            )}
            {onboarding.currentStep === 7 && (
              <Step7Complete onGoToDashboard={() => onboarding.router.push('/mentor/dashboard')} />
            )}

            {onboarding.currentStep < 7 && (
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#E5E7EB] pt-10">
                <button
                  onClick={onboarding.prevStep}
                  disabled={onboarding.currentStep === 1}
                  className="w-full sm:w-auto px-8 py-4 border border-[#E5E7EB] rounded-xl hover:bg-[#FFFCF9] font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#172033] flex items-center justify-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  {onboarding.t('buttons.previous')}
                </button>
                {onboarding.currentStep === 6 ? (
                  <button
                    onClick={onboarding.handleSubmit}
                    disabled={onboarding.loading}
                    className="w-full sm:w-auto px-10 py-4 bg-[#F97316] text-white rounded-xl hover:bg-[#ea580c] disabled:opacity-50 font-bold text-base transition-colors flex items-center justify-center gap-3"
                  >
                    {onboarding.loading ? onboarding.t('buttons.submitting') : onboarding.t('buttons.submitOnboarding')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                ) : (
                  <button
                    onClick={onboarding.nextStep}
                    disabled={!onboarding.validateStep(onboarding.currentStep).valid}
                    className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-3 ${
                      !onboarding.validateStep(onboarding.currentStep).valid
                        ? 'bg-[#E5E7EB] text-[#64748B] cursor-not-allowed'
                        : 'bg-[#F97316] text-white hover:bg-[#ea580c]'
                    }`}
                  >
                    {onboarding.t('buttons.next')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
