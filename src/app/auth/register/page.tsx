'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authApi, type RegisterPayload } from '@/lib/api/client';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'MENTEE' | 'MENTOR'>('MENTEE');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: RegisterPayload = { email, password, fullName, role };
      const res = await authApi.register(payload);
      const { accessToken, refreshToken } = res.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success('Account created');
      if (res.user.role === 'MENTOR') {
        window.location.href = '/mentor/onboarding';
      } else {
        window.location.href = '/mentee/dashboard';
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 border border-[#E2E5EB] rounded-lg px-4 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478] mb-2';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] py-12 px-4">
      {/* Optional: move this @import to next/font/google in your app's layout for production. */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif {
          font-family: 'Fraunces', ui-serif, Georgia, serif;
        }
        body {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-[26rem]">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,27,51,0.15)] border border-[#E2E5EB] overflow-hidden">
          <div className="bg-[#101B33] px-8 pt-10 pb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E8A33D] text-[#101B33] mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a1 1 0 01-1-1v-1a3 3 0 013-3h10a3 3 0 013 3v1a1 1 0 01-1 1" />
              </svg>
            </div>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[#E8A33D] font-semibold">
              MentorAura
            </span>
            <h1 className="mt-2 font-serif text-3xl text-white">Create your account</h1>
            <p className="mt-2 text-white/60 text-sm">Join as a mentee or a mentor</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-[#B3483F]/5 border border-[#B3483F]/30 text-[#8f3a33] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className={labelClass}>I want to join as</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['MENTEE', 'MENTOR'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      aria-pressed={role === option}
                      className={`h-12 rounded-lg border text-sm font-medium transition-colors ${
                        role === option
                          ? 'bg-[#101B33] border-[#101B33] text-white'
                          : 'bg-white border-[#E2E5EB] text-[#5B6478] hover:border-[#101B33]/30'
                      }`}
                    >
                      {option === 'MENTEE' ? 'Mentee' : 'Mentor'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#101B33] text-white py-3 rounded-lg hover:bg-[#1B2A4D] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors mt-2"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#5B6478]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#C67F1E] hover:text-[#a8690f] font-medium">mmm 
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}