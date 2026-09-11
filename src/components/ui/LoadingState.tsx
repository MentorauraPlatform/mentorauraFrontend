'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullScreen = true,
  className = '',
}) => {
  return (
    <div
      className={`${
        fullScreen ? 'min-h-screen' : 'py-12'
      } bg-[#FFFCF9] flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFA048] animate-spin flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
        M
      </div>
      <p className="text-sm font-semibold text-slate-600 animate-pulse">{message}</p>
    </div>
  );
};
