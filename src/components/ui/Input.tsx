import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-2 text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm sm:text-base font-semibold text-[#172033]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 pointer-events-none text-[#64748B] flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-white px-4 py-3 sm:py-3.5 text-base sm:text-base text-[#172033] placeholder-[#94A3B8] outline-none transition-all duration-200 shadow-xs ${
              leftIcon ? 'pl-11' : ''
            } ${rightIcon ? 'pr-11' : ''} ${
              error
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
                : 'border-[#D1D5DB] hover:border-gray-400 focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/15'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-[#64748B] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs sm:text-sm text-[#DC2626] font-semibold">{error}</span>}
        {!error && helperText && <span className="text-xs sm:text-sm text-[#64748B]">{helperText}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
