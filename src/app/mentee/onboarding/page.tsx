'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useMenteeOnboarding } from './hooks/useMenteeOnboarding';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2Skills } from './steps/Step2Skills';
import { Step3Interests } from './steps/Step3Interests';
import { Step4Goals } from './steps/Step4Goals';
import { Step5Experience } from './steps/Step5Experience';
import { Step6Availability } from './steps/Step6Availability';
import { Step7Review } from './steps/Step7Review';
import { Step8Complete } from './steps/Step8Complete';

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Skills' },
  { id: 3, title: 'Interests' },
  { id: 4, title: 'Goals' },
  { id: 5, title: 'Experience' },
  { id: 6, title: 'Availability' },
  { id: 7, title: 'Review' },
];

export default function MenteeOnboardingPage() {
  const onboarding = useMenteeOnboarding();
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    await onboarding.nextStep();
    setSaving(false);
  };

  if (onboarding.authLoading || !onboarding.profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#E5E7EB] border-t-[#F97316] animate-spin" />
          <span className="text-lg text-[#64748B] font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans text-[#172033]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className="bg-[#172033] px-8 sm:px-10 py-8 sm:py-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5"/></svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentee Onboarding</h1>
                {onboarding.currentStep <= 7 && (
                  <p className="text-sm text-white/60 font-medium">
                    Step {onboarding.currentStep} of 7: {STEPS[onboarding.currentStep - 1]?.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {onboarding.currentStep <= 7 && (
            <div className="px-8 sm:px-10 pt-8 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-3">
                {STEPS.map((step, index) => {
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
                          {step.title}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
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
                {onboarding.submitFailed && onboarding.currentStep === 7 && (
                  <button
                    onClick={onboarding.retrySubmit}
                    disabled={onboarding.loading}
                    className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold text-sm transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {onboarding.currentStep === 1 && (
              <Step1BasicInfo data={onboarding.data} updateData={onboarding.updateData} />
            )}
            {onboarding.currentStep === 2 && (
              <Step2Skills
                data={onboarding.data}
                skills={onboarding.skills}
                skillNameInput={onboarding.skillNameInput}
                setSkillNameInput={onboarding.setSkillNameInput}
                skillLevelInput={onboarding.skillLevelInput}
                setSkillLevelInput={onboarding.setSkillLevelInput}
                skillSaving={onboarding.skillSaving}
                onAddSkill={onboarding.addSkill}
                onRemoveSkill={onboarding.removeSkill}
                onUpdateSkillLevel={onboarding.updateSkillLevel}
                levelColors={onboarding.LEVEL_COLORS}
              />
            )}
            {onboarding.currentStep === 3 && (
              <Step3Interests
                data={onboarding.data}
                updateData={onboarding.updateData}
                options={onboarding.INTEREST_OPTIONS}
              />
            )}
            {onboarding.currentStep === 4 && (
              <Step4Goals
                data={onboarding.data}
                updateData={onboarding.updateData}
                options={onboarding.GOAL_OPTIONS}
              />
            )}
            {onboarding.currentStep === 5 && (
              <Step5Experience data={onboarding.data} updateData={onboarding.updateData} />
            )}
            {onboarding.currentStep === 6 && (
              <Step6Availability
                data={onboarding.data}
                onUpdateAvailability={(availability) => onboarding.updateData({ availability })}
              />
            )}
            {onboarding.currentStep === 7 && (
              <Step7Review data={onboarding.data} levelColors={onboarding.LEVEL_COLORS} />
            )}
            {onboarding.currentStep === 8 && (
              <Step8Complete onGoToDashboard={() => onboarding.router.push('/mentee/dashboard')} />
            )}

            {onboarding.currentStep <= 7 && (
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#E5E7EB] pt-10">
                <button
                  onClick={onboarding.prevStep}
                  disabled={onboarding.currentStep === 1}
                  className="w-full sm:w-auto px-8 py-4 border border-[#E5E7EB] rounded-xl hover:bg-[#FFFCF9] font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#172033] flex items-center justify-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  Previous
                </button>
                {onboarding.currentStep === 7 ? (
                  <button
                    onClick={onboarding.handleSubmit}
                    disabled={onboarding.loading}
                    className="w-full sm:w-auto px-10 py-4 bg-[#F97316] text-white rounded-xl hover:bg-[#ea580c] disabled:opacity-50 font-bold text-base transition-colors flex items-center justify-center gap-3"
                  >
                    {onboarding.loading ? 'Submitting...' : 'Complete Onboarding'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!onboarding.validateStep(onboarding.currentStep).valid || saving}
                    className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-3 ${
                      !onboarding.validateStep(onboarding.currentStep).valid || saving
                        ? 'bg-[#E5E7EB] text-[#64748B] cursor-not-allowed'
                        : 'bg-[#F97316] text-white hover:bg-[#ea580c]'
                    }`}
                  >
                    {saving ? 'Saving...' : 'Next'}
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
