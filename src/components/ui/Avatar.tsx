import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (fullName?: string | null) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const initials = getInitials(name);

  if (src) {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 border border-gray-200/80 shadow-xs ${sizeMap[size]} ${className}`}>
        <img
          src={src}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (initials) {
    return (
      <div
        className={`rounded-full bg-[#172033] text-white font-extrabold flex items-center justify-center shrink-0 border border-gray-200/80 shadow-xs select-none ${sizeMap[size]} ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-[#FFF7ED] text-[#F97316] flex items-center justify-center shrink-0 border border-orange-200/60 shadow-xs ${sizeMap[size]} ${className}`}
    >
      <User className="w-1/2 h-1/2" />
    </div>
  );
};
