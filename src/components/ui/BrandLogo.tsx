'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8 rounded-lg text-base',
      text: 'text-lg',
    },
    md: {
      box: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-lg sm:text-xl',
      text: 'text-xl sm:text-2xl',
    },
    lg: {
      box: 'w-11 h-11 rounded-2xl text-2xl',
      text: 'text-2xl sm:text-3xl',
    },
  };

  return (
    <Link
      href="/"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      aria-label="MentorAura Home"
    >
      <div
        className={`${sizeMap[size].box} bg-[#172033] flex items-center justify-center text-white font-black group-hover:bg-[#F97316] transition-colors shadow-xs shrink-0`}
      >
        M<span className="text-[#F97316] group-hover:text-white transition-colors">A</span>
      </div>
      <span className={`${sizeMap[size].text} font-black text-[#172033] tracking-tight`}>
        Mentor<span className="text-[#F97316]">Aura</span>
      </span>
    </Link>
  );
};
