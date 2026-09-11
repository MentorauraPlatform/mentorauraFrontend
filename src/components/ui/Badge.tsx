import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'navy' | 'slate' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'orange',
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  const variantStyles = {
    orange: 'bg-[#FFF7ED] text-[#F97316] border border-[#F97316]/20',
    navy: 'bg-[#172033] text-white',
    slate: 'bg-[#F1F5F9] text-[#64748B]',
    success: 'bg-emerald-50 text-[#16A34A] border border-[#16A34A]/20',
    warning: 'bg-amber-50 text-[#F59E0B] border border-[#F59E0B]/20',
    error: 'bg-red-50 text-[#DC2626] border border-[#DC2626]/20',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full transition-colors ${sizeStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
