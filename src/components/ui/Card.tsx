import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'hoverable';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantMap = {
    default: 'bg-white border border-[#E5E7EB] shadow-sm',
    flat: 'bg-white border border-[#E5E7EB]',
    hoverable: 'bg-white border border-[#E5E7EB] shadow-sm card-hover hover:border-[#F97316]/30',
  };

  return (
    <div
      className={`rounded-2xl ${paddingMap[padding]} ${variantMap[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
