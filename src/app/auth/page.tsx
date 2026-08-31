'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Check,
  X,
  UserCheck,
  Star,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
} from 'lucide-react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/auth.service';
import { mentorApi } from '@/lib/api/client';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tAuth = useTranslations('auth');
  const { refetchUser } = useAuth();
  const { showToast } = useToast();

  // Mode state: 'register' or 'login'
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    const modeParam = searchParams.get('mode');
    return modeParam === 'login' ? 'login' : 'register';
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'MENTEE' | 'MENTOR'>('MENTEE');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Mask email helper: e.g. ngwafranklin29@gmail.com -> ng**************@gmail.com
  const maskEmail = (rawEmail: string) => {
    if (!rawEmail || !rawEmail.includes('@')) return rawEmail;
    const [name, domain] = rawEmail.split('@');
    if (name.length <= 2) {
      return `${name}***@${domain}`;
    }
    const visiblePart = name.slice(0, 2);
    const maskedPart = '*'.repeat(name.length - 2);
    return `${visiblePart}${maskedPart}@${domain}`;
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage(null);
    setError(null);

    try {
      await authService.resendVerification(email);
      setResendMessage('Verification email resent successfully!');
      showToast('Verification email sent!', 'info');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while resending.');
    } finally {
      setResendLoading(false);
    }
  };

  // Real-time password requirement checks
  const passwordChecks = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumberOrSymbol: /[\d\W]/.test(password),
    isMatching: password.length > 0 && password === confirmPassword,
    get allValid() {
      return (
        this.hasMinLength &&
        this.hasUppercase &&
        this.hasLowercase &&
        this.hasNumberOrSymbol &&
        this.isMatching
      );
    },
  };

  // Sync mode with URL or props if query param exists
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      // Defer state update to avoid synchronous setState inside effect which can
      // cause cascading renders. Use a microtask to schedule the update.
      Promise.resolve().then(() => setMode('register'));
    } else if (modeParam === 'login') {
      Promise.resolve().then(() => setMode('login'));
    }
  }, [searchParams]);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      const { accessToken, refreshToken } = res.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      await refetchUser();
      showToast('Logged in successfully!', 'success');

      if (res.user?.isMentor) {
        const mentorRes = await mentorApi.getMyProfile(accessToken).catch(() => null);
        const status = mentorRes?.data?.onboardingStatus;
        if (status === 'COMPLETE' || status === 'PENDING') {
          router.push('/mentor/dashboard');
        } else {
          router.push('/mentor/onboarding');
        }
      } else {
        router.push('/mentee/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Password validation rules check
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!passwordRegex.test(password)) {
      setError(
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character.',
      );
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        fullName,
        email,
        password,
        isMentor: role === 'MENTOR',
        role,
      });

      showToast('Account created!', 'success');
      router.push('/verify-email');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setError(null);
    setMode(newMode);
    window.history.pushState(null, '', `?mode=${newMode}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Decorative Accent Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FFF7ED] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />

      {/* Reusable Simple Header */}
      <SimpleHeader
        className="z-20"
        rightElement={
          <div className="text-xs sm:text-sm font-semibold text-[#64748B] text-center sm:text-right">
            {mode === 'login' ? (
              <>
                <span>{tAuth('noAccount')} </span>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#F97316] hover:underline font-bold focus:outline-none inline-block ml-1"
                >
                  {tAuth('signUpFree')}
                </button>
              </>
            ) : (
              <>
                <span>{tAuth('alreadyRegistered')} </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#F97316] hover:underline font-bold focus:outline-none inline-block ml-1"
                >
                  {tAuth('loginHere')}
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Main Container - Split Layout on Desktop */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SECTION (Desktop App Details & Branding Showcase) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
            <Badge variant="orange" size="md" className="gap-2 shadow-xs inline-flex py-1.5 px-3.5 w-fit">
              <Sparkles className="w-4 h-4 text-[#F97316]" /> World-Class 1-on-1 Mentorship
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-[#172033] tracking-tight leading-[1.15]">
                Accelerate your career with{' '}
                <span className="text-[#F97316]">top-tier experts.</span>
              </h1>
              <p className="text-lg text-[#64748B] leading-relaxed max-w-lg">
                Join thousands of software engineers, product managers, and leaders receiving personalized 1-on-1 coaching, code reviews, and career roadmaps.
              </p>
            </div>

            {/* Platform Feature Cards */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold shrink-0">
                  <Star className="w-5 h-5 fill-[#F97316]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#172033]">Vetted 1% Tech Mentors</h3>
                  <p className="text-sm text-[#64748B]">Learn directly from senior staff engineers and heads of product at top tech companies.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#172033]">Structured 1-on-1 Sessions</h3>
                  <p className="text-sm text-[#64748B]">Weekly video calls, async code reviews, and continuous guidance tailored to your goals.</p>
                </div>
              </div>
            </div>

            {/* Social Proof Footer */}
            <div className="pt-4 flex items-center gap-6 border-t border-[#E5E7EB]">
              <div>
                <div className="text-2xl font-black text-[#172033]">500+</div>
                <div className="text-xs text-[#64748B] font-semibold">Active Mentors</div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <div className="text-2xl font-black text-[#172033]">20,000+</div>
                <div className="text-xs text-[#64748B] font-semibold">Sessions Held</div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <div className="text-2xl font-black text-[#F97316]">99%</div>
                <div className="text-xs text-[#64748B] font-semibold">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (Animated Login / Signup Forms) */}
          <div className="w-full lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-2xl relative overflow-hidden">
              
              {/* Tab Switch Buttons */}
              <div className="flex bg-[#F8FAFC] p-1.5 rounded-2xl mb-6 border border-gray-100">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                    mode === 'login'
                      ? 'bg-white text-[#172033] shadow-sm'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                    mode === 'register'
                      ? 'bg-white text-[#172033] shadow-sm'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Animated Forms Container */}
              <div className="relative min-h-[400px]">
                
                {/* LOGIN FORM */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    mode === 'login'
                      ? 'opacity-100 translate-x-0 pointer-events-auto relative z-10'
                      : 'opacity-0 -translate-x-8 pointer-events-none absolute inset-0 z-0'
                  }`}
                >
                  <div className="space-y-2 mb-6 text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
                      Welcome back
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      Enter your credentials to access your mentorship portal.
                    </p>
                  </div>

                  {error && mode === 'login' && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm font-semibold">
                      <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
                      window.location.href = `${API_URL}/auth/google`;
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-[#D1D5DB] bg-white hover:bg-gray-50 text-[#172033] font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-xs mb-5 group"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-gray-200 w-full" />
                    <span className="bg-white px-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider absolute">
                      or
                    </span>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      leftIcon={<Mail className="w-5 h-5 text-[#64748B]" />}
                    />

                    <div className="space-y-1.5">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        leftIcon={<Lock className="w-5 h-5 text-[#64748B]" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 hover:text-[#172033] focus:outline-none transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        }
                      />
                      <div className="flex justify-end pt-1">
                        <Link
                          href="/forgot-password"
                          className="text-xs sm:text-sm font-semibold text-[#64748B] hover:text-[#F97316] transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full py-3.5 text-base font-bold shadow-md"
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Sign In
                    </Button>
                  </form>
                </div>

                {/* SIGNUP / REGISTER FORM */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    mode === 'register'
                      ? 'opacity-100 translate-x-0 pointer-events-auto relative z-10'
                      : 'opacity-0 translate-x-8 pointer-events-none absolute inset-0 z-0'
                  }`}
                >
                  {isSuccess ? (
                    <div className="py-6 text-center space-y-5">
                      <div className="w-16 h-16 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto text-[#F97316]">
                        <Mail className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black text-[#172033]">
                          Check your email!
                        </h2>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                          We sent a verification link to{' '}
                          <strong className="text-[#172033]">{maskEmail(email)}</strong>. Please check your inbox and click the link to activate your account.
                        </p>
                      </div>

                      {resendMessage && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{resendMessage}</span>
                        </div>
                      )}

                      {error && (
                        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 text-left font-semibold flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Note:</strong> You must verify your email before logging in. If you don&apos;t see it, check your spam or junk folder.
                        </span>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="md"
                          className="w-full font-bold flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                          onClick={handleResendVerification}
                          isLoading={resendLoading}
                        >
                          <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                          Resend Verification Email
                        </Button>

                        <Button
                          type="button"
                          variant="primary"
                          size="md"
                          className="w-full font-bold"
                          onClick={() => {
                            setIsSuccess(false);
                            switchMode('login');
                          }}
                        >
                          Proceed to Login
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-6 text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
                      Create your account
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      Join MentorAura to start learning or teaching.
                    </p>
                  </div>

                  {error && mode === 'register' && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm font-semibold">
                      <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
                      window.location.href = `${API_URL}/auth/google`;
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-[#D1D5DB] bg-white hover:bg-gray-50 text-[#172033] font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-xs mb-5 group"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-gray-200 w-full" />
                    <span className="bg-white px-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider absolute">
                      or
                    </span>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-5">
                    {/* Role Selector */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-sm font-semibold text-[#172033]">
                        I am joining as a:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('MENTEE')}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                            role === 'MENTEE'
                              ? 'border-[#F97316] bg-[#FFF7ED] text-[#172033] ring-2 ring-[#F97316]/20'
                              : 'border-[#D1D5DB] bg-white text-[#64748B] hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className={`w-4 h-4 ${role === 'MENTEE' ? 'text-[#F97316]' : 'text-[#64748B]'}`} />
                            <span className="font-bold text-sm">Mentee</span>
                          </div>
                          {role === 'MENTEE' && <CheckCircle2 className="w-4 h-4 text-[#F97316]" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('MENTOR')}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                            role === 'MENTOR'
                              ? 'border-[#F97316] bg-[#FFF7ED] text-[#172033] ring-2 ring-[#F97316]/20'
                              : 'border-[#D1D5DB] bg-white text-[#64748B] hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 flex items-center justify-center font-bold text-xs rounded ${role === 'MENTOR' ? 'bg-[#F97316] text-white' : 'bg-slate-200 text-slate-700'}`}>M</div>
                            <span className="font-bold text-sm">Mentor</span>
                          </div>
                          {role === 'MENTOR' && <CheckCircle2 className="w-4 h-4 text-[#F97316]" />}
                        </button>
                      </div>
                    </div>

                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      leftIcon={<User className="w-5 h-5 text-[#64748B]" />}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      leftIcon={<Mail className="w-5 h-5 text-[#64748B]" />}
                    />

                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      leftIcon={<Lock className="w-5 h-5 text-[#64748B]" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 hover:text-[#172033] focus:outline-none transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                    />

                    {/* Real-time Password Strength Checklist */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs font-semibold">
                      <div className="text-[#64748B] font-bold mb-1">Password must contain:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.hasMinLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                          {passwordChecks.hasMinLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-300" />}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.hasUppercase ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                          {passwordChecks.hasUppercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-300" />}
                          <span>1 Uppercase letter (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.hasLowercase ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                          {passwordChecks.hasLowercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-300" />}
                          <span>1 Lowercase letter (a-z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.hasNumberOrSymbol ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                          {passwordChecks.hasNumberOrSymbol ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-300" />}
                          <span>1 Number or symbol</span>
                        </div>
                        <div className={`col-span-1 sm:col-span-2 flex items-center gap-1.5 transition-colors ${passwordChecks.isMatching ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                          {passwordChecks.isMatching ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-gray-300" />}
                          <span>Passwords match</span>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      leftIcon={<Lock className="w-5 h-5 text-[#64748B]" />}
                    />

                    {/* Mandatory Terms & Policy Checkbox */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="terms-checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        required
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer"
                      />
                      <label htmlFor="terms-checkbox" className="text-xs sm:text-sm text-[#64748B] leading-snug cursor-pointer select-none">
                        I agree to MentorAura&apos;s{' '}
                        <Link href="/terms" target="_blank" className="font-bold text-[#F97316] underline hover:text-[#EA580C]">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" target="_blank" className="font-bold text-[#F97316] underline hover:text-[#EA580C]">
                          Privacy Policy
                        </Link>.
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full py-3.5 text-base font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      isLoading={isLoading}
                      disabled={!acceptedTerms || !passwordChecks.allValid}
                    >
                      Create Account
                    </Button>
                  </form>
                    </>
                  )}
                </div>

              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Secure 256-bit encrypted authentication</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-gray-400 font-medium">
        © {new Date().getFullYear()} MentorAura Inc. All rights reserved.
      </footer>
    </div>
  );
}
