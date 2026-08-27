'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authApi, type LoginPayload } from '@/lib/api/client';
import { toast } from 'sonner';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: LoginPayload = { email, password };
      const res = await authApi.login(payload);
      const { accessToken, refreshToken } = res.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success('Welcome back');
      if (res.user.role === 'MENTOR') {
        window.location.href = '/mentor/onboarding';
      } else {
        window.location.href = '/mentee/dashboard';
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 border border-[#E2E5EB] rounded-lg px-4 text-[#12172B] placeholder:text-[#9AA1B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D] transition-colors';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478] mb-2';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] py-12 px-4">
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
          {/* Header - Same as Register */}
          <div className="bg-[#101B33] px-8 pt-10 pb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E8A33D] text-[#101B33] mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[#E8A33D] font-semibold">
              MentorAura
            </span>
            <h1 className="mt-2 font-serif text-3xl text-white">Welcome back</h1>
            <p className="mt-2 text-white/60 text-sm">Sign in to your account</p>
          </div>

          {/* Form Body */}
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-[#B3483F]/5 border border-[#B3483F]/30 text-[#8f3a33] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Password</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] font-medium text-[#C67F1E] hover:text-[#a8690f] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-12`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA1B0] hover:text-[#5B6478] transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#101B33] text-white py-3 rounded-lg hover:bg-[#1B2A4D] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors mt-2"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#5B6478]">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-[#C67F1E] hover:text-[#a8690f] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}