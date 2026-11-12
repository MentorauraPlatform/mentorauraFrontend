'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { OnboardingData } from '../hooks/useMentorOnboarding';

const labelClass = 'block text-sm font-bold uppercase tracking-wider text-[#64748B] mb-2';

const getInputClasses = (hasError: boolean, extraClasses = '') =>
  `w-full h-14 text-base border rounded-xl px-5 text-[#172033] placeholder:text-[#94A3B8] focus:outline-none transition-all duration-200 ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 bg-red-50/10'
      : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] bg-white'
  } ${extraClasses}`;

const getTextareaClasses = (hasError: boolean, extraClasses = '') =>
  `w-full text-base border rounded-xl px-5 py-4 text-[#172033] placeholder:text-[#94A3B8] focus:outline-none transition-all duration-200 resize-none ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 bg-red-50/10'
      : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#F97316]/40 focus:border-[#F97316] bg-white'
  } ${extraClasses}`;

interface Step4ExperienceProps {
  data: OnboardingData;
  rawAreas: string;
  onRawAreasChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onUpdateData?: (updates: Partial<OnboardingData>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
  setTouched?: (field: string) => void;
}

export function Step4Experience({
  data,
  rawAreas,
  onRawAreasChange,
  onExperienceChange,
  onUpdateData,
  onBlur,
  onKeyDown,
  errors,
  setTouched,
}: Step4ExperienceProps) {
  const t = useTranslations('onboarding');

  const handleFieldChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData?.({ [field]: value });
    setTouched?.(field);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
          {t('buttons.stepOf6', { step: 4 })}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
          {t('experience.heading')}
        </h2>
        <p className="mt-3 text-xl text-[#475569]">{t('experience.subheading')}</p>
      </div>

      <div className="space-y-6">
        {/* Experience description */}
        <div>
          <label className={labelClass}>
            {t('experience.experienceRequired')} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={data.experience}
            onChange={(e) => {
              onExperienceChange(e.target.value);
              setTouched?.('experience');
            }}
            onBlur={() => setTouched?.('experience')}
            rows={10}
            maxLength={5000}
            className={getTextareaClasses(Boolean(errors?.experience))}
            placeholder={t('experience.experiencePlaceholder')}
          />
          <div className="mt-2 flex justify-between items-center text-xs">
            {errors?.experience ? (
              <p className="text-red-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.experience}</span>
              </p>
            ) : (
              <span className="text-[#64748B]">{t('experience.experienceHint')}</span>
            )}
            <span className={data.experience.length > 5000 ? 'text-red-600 font-bold' : 'text-[#64748B]'}>
              {data.experience.length} / 5000
            </span>
          </div>
        </div>

        {/* Areas of Expertise */}
        <div>
          <label className={labelClass}>{t('experience.areasOfExpertise')}</label>
          <input
            type="text"
            value={rawAreas}
            onChange={(e) => onRawAreasChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className={getInputClasses(false)}
            placeholder={t('experience.areasPlaceholder')}
          />
          <p className="mt-2 text-sm text-[#64748B]">{t('experience.areasHint')}</p>
          {data.areasOfExpertise.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.areasOfExpertise.map((area) => (
                <span
                  key={area}
                  className="bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/20 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Additional credentials */}
        {onUpdateData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>{t('experience.yearsOfExperience')}</label>
              <input
                type="number"
                min={0}
                max={60}
                value={data.yearsOfExperience}
                onChange={(e) => handleFieldChange('yearsOfExperience', e.target.value)}
                onBlur={() => setTouched?.('yearsOfExperience')}
                className={getInputClasses(Boolean(errors?.yearsOfExperience))}
                placeholder={t('experience.yearsPlaceholder')}
              />
              {errors?.yearsOfExperience && (
                <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.yearsOfExperience}</span>
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>{t('experience.cvUrl')}</label>
              <input
                type="url"
                value={data.cvUrl}
                onChange={(e) => handleFieldChange('cvUrl', e.target.value)}
                onBlur={() => setTouched?.('cvUrl')}
                maxLength={512}
                className={getInputClasses(Boolean(errors?.cvUrl))}
                placeholder={t('experience.cvPlaceholder')}
              />
              {errors?.cvUrl && (
                <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.cvUrl}</span>
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>{t('experience.idDocUrl')}</label>
              <input
                type="url"
                value={data.idDocumentUrl}
                onChange={(e) => handleFieldChange('idDocumentUrl', e.target.value)}
                onBlur={() => setTouched?.('idDocumentUrl')}
                maxLength={512}
                className={getInputClasses(Boolean(errors?.idDocumentUrl))}
                placeholder={t('experience.idDocPlaceholder')}
              />
              {errors?.idDocumentUrl && (
                <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.idDocumentUrl}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
