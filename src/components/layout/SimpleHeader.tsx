'use client';

import React from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface SimpleHeaderProps {
  rightElement?: React.ReactNode;
  showLanguageSwitcher?: boolean;
  className?: string;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  rightElement,
  showLanguageSwitcher = true,
  className = '',
}) => {
  return (
    <header className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between gap-3 ${className}`}>
      <BrandLogo />
      
      <div className="flex items-center gap-3">
        {showLanguageSwitcher && <LanguageSwitcher />}
        {rightElement}
      </div>
    </header>
  );
};
