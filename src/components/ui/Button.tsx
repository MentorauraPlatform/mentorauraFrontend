import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl btn-transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none';

    // Size variations
    const sizeMap = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
    };

    // Palette & Variant variations
    let variantStyles = '';
    switch (variant) {
      case 'primary':
        variantStyles =
          'bg-[#F97316] text-white hover:bg-[#EA580C] focus:ring-[#F97316] shadow-sm hover:shadow';
        break;
      case 'secondary':
        variantStyles =
          'bg-[#172033] text-white hover:bg-[#0F172A] focus:ring-[#172033] shadow-sm';
        break;
      case 'outline':
        variantStyles =
          'border border-[#E5E7EB] text-[#1F2937] bg-white hover:bg-[#FFFCF9] hover:border-[#F97316] hover:text-[#F97316] focus:ring-[#F97316]';
        break;
      case 'ghost':
        variantStyles =
          'text-[#64748B] hover:text-[#172033] hover:bg-[#FFF7ED] focus:ring-[#F97316]';
        break;
      case 'danger':
        variantStyles =
          'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626]';
        break;
    }

    const combinedClassName = `${baseStyles} ${sizeMap[size]} ${variantStyles} ${className}`.trim();

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
