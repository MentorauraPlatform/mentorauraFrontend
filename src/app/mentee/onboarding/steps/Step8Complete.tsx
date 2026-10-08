'use client';

interface Props {
  onGoToDashboard: () => void;
}

export function Step8Complete({ onGoToDashboard }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 className="text-2xl font-extrabold text-[#172033] mb-3">You're all set!</h2>
      <p className="text-[#64748B] text-base max-w-md mb-8">
        Your mentee profile is complete. You can now browse mentors, explore plans, and start your mentorship journey.
      </p>
      <button
        onClick={onGoToDashboard}
        className="px-10 py-4 bg-[#F97316] text-white rounded-xl hover:bg-[#ea580c] font-bold text-base transition-colors flex items-center gap-3"
      >
        Go to Dashboard
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
