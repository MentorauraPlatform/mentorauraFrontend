'use client';

import { User, Briefcase, Building2, AlertCircle } from 'lucide-react';
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

interface Step2ProfessionalProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  errors?: Record<string, string>;
  setTouched?: (field: string) => void;
}

export function Step2Professional({ data, updateData, errors, setTouched }: Step2ProfessionalProps) {
  const t = useTranslations('onboarding');

  const handleFieldChange = (field: keyof OnboardingData, value: string) => {
    updateData({ [field]: value });
    setTouched?.(field);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#172033] bg-[#E5E7EB] px-4 py-1.5 rounded-full mb-4">
          {t('buttons.stepOf6', { step: 2 })}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#172033] tracking-tight">
          {t('professional.heading')}
        </h2>
        <p className="mt-3 text-xl text-[#475569]">{t('professional.subheading')}</p>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className={labelClass}>
            {t('professional.fullNameRequired')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className={`w-6 h-6 ${errors?.fullName ? 'text-red-500' : 'text-[#94A3B8]'}`} />
            </div>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              onBlur={() => setTouched?.('fullName')}
              required
              maxLength={100}
              className={getInputClasses(Boolean(errors?.fullName), 'pl-14')}
              placeholder={t('professional.fullNamePlaceholder')}
            />
          </div>
          {errors?.fullName && (
            <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Professional Title */}
        <div>
          <label className={labelClass}>
            {t('professional.titleRequired')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Briefcase className={`w-6 h-6 ${errors?.title ? 'text-red-500' : 'text-[#94A3B8]'}`} />
            </div>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              onBlur={() => setTouched?.('title')}
              required
              maxLength={300}
              className={getInputClasses(Boolean(errors?.title), 'pl-14')}
              placeholder={t('professional.titlePlaceholder')}
            />
          </div>
          {errors?.title && (
            <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Headline */}
        <div>
          <label className={labelClass}>{t('professional.headline')}</label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => handleFieldChange('headline', e.target.value)}
            onBlur={() => setTouched?.('headline')}
            maxLength={255}
            className={getInputClasses(Boolean(errors?.headline))}
            placeholder={t('professional.headlinePlaceholder')}
          />
          {errors?.headline && (
            <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.headline}</span>
            </p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className={labelClass}>{t('professional.company')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Building2 className={`w-6 h-6 ${errors?.company ? 'text-red-500' : 'text-[#94A3B8]'}`} />
            </div>
            <input
              type="text"
              value={data.company}
              onChange={(e) => handleFieldChange('company', e.target.value)}
              onBlur={() => setTouched?.('company')}
              maxLength={100}
              className={getInputClasses(Boolean(errors?.company), 'pl-14')}
              placeholder={t('professional.companyPlaceholder')}
            />
          </div>
          {errors?.company && (
            <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.company}</span>
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('professional.linkedinUrl')}</label>
            <input
              type="url"
              value={data.linkedinUrl}
              onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
              onBlur={() => setTouched?.('linkedinUrl')}
              maxLength={512}
              className={getInputClasses(Boolean(errors?.linkedinUrl))}
              placeholder={t('professional.linkedinPlaceholder')}
            />
            {errors?.linkedinUrl && (
              <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.linkedinUrl}</span>
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>{t('professional.githubUrl')}</label>
            <input
              type="url"
              value={data.githubUrl}
              onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
              onBlur={() => setTouched?.('githubUrl')}
              maxLength={512}
              className={getInputClasses(Boolean(errors?.githubUrl))}
              placeholder={t('professional.githubPlaceholder')}
            />
            {errors?.githubUrl && (
              <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.githubUrl}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={labelClass}>{t('professional.bio')}</label>
          <textarea
            value={data.bio}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            onBlur={() => setTouched?.('bio')}
            rows={6}
            maxLength={5000}
            className={getTextareaClasses(Boolean(errors?.bio))}
            placeholder={t('professional.bioPlaceholder')}
          />
          <div className="mt-2 flex justify-between items-center text-xs">
            {errors?.bio ? (
              <p className="text-red-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.bio}</span>
              </p>
            ) : <div />}
            <span className={data.bio.length > 5000 ? 'text-red-600 font-bold' : 'text-[#64748B]'}>
              {data.bio.length} / 5000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
