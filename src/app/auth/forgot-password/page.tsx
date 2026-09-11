'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { authService } from '@/services/auth.service';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('EMAIL');

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes OTP countdown
  const [canResend, setCanResend] = useState(false);

  // Focus references for the 6-digit OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const parseErrorMessage = (err: unknown): string => {
    if (!err) return 'An unexpected error occurred.';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    const apiErr = err as { message?: string | string[] };
    if (Array.isArray(apiErr?.message)) return apiErr.message.join(', ');
    if (typeof apiErr?.message === 'string') return apiErr.message;
    return 'An unexpected error occurred.';
  };

  // ── STEP 1: Submit Email for OTP ─────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.requestForgotPasswordOtp(email.trim());
      toast.success(res.message || 'OTP verification code sent!');
      setStep('OTP');
      setTimerSeconds(600);
      setCanResend(false);
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP PIN Input Handlers ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take last entered character if multiple typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input field if digit entered
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // ── STEP 2: Verify OTP ───────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyOtp(email.trim(), fullOtp);
      toast.success('OTP code verified successfully!');
      setStep('NEW_PASSWORD');
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.requestForgotPasswordOtp(email.trim());
      toast.success(res.message || 'New OTP verification code sent!');
      setTimerSeconds(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── STEP 3: Reset Password ───────────────────────────────────────────────────
  const passwordChecks = {
    hasMinLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumberOrSymbol: /[\d\W]/.test(newPassword),
    isMatching: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (
      !passwordChecks.hasMinLength ||
      !passwordChecks.hasUppercase ||
      !passwordChecks.hasLowercase ||
      !passwordChecks.hasNumberOrSymbol
    ) {
      setError('Please fulfill all password security requirements.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullOtp = otp.join('');
      const res = await authService.resetPassword(email.trim(), fullOtp, newPassword);
      toast.success(res.message || 'Password reset successfully!');
      setStep('SUCCESS');
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Decorative gradient blur background elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <SimpleHeader />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header Progress Indicators */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-xs border border-orange-100">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#172033] tracking-tight">
              {step === 'EMAIL' && 'Forgot Password?'}
              {step === 'OTP' && 'Verify 6-Digit OTP'}
              {step === 'NEW_PASSWORD' && 'Set New Password'}
              {step === 'SUCCESS' && 'Password Reset Complete!'}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {step === 'EMAIL' &&
                'Enter your email address below and we will send you a 6-digit OTP code.'}
              {step === 'OTP' && (
                <>
                  We sent a 6-digit verification code to{' '}
                  <span className="font-bold text-slate-800">{email}</span>
                </>
              )}
              {step === 'NEW_PASSWORD' &&
                'Create a strong new password meeting all security standards.'}
              {step === 'SUCCESS' &&
                'Your password has been updated successfully. You can now log in.'}
            </p>
          </div>

          {/* Error Feedback Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: EMAIL FORM ────────────────────────────────────────────── */}
          {step === 'EMAIL' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending OTP Code...
                  </>
                ) : (
                  <>
                    Send OTP Verification Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/auth?mode=login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* ── STEP 2: OTP PIN FORM ──────────────────────────────────────────── */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center font-black text-lg sm:text-xl text-[#172033] bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-xs"
                  />
                ))}
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>Expires in: {formatTimer(timerSeconds)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className={`font-bold transition-colors ${
                    canResend
                      ? 'text-orange-600 hover:underline cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change email address
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: SET NEW PASSWORD FORM ─────────────────────────────────── */}
          {step === 'NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Password strength checklist */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-700 block mb-1">Password Requirements:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      passwordChecks.hasMinLength ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <span className={passwordChecks.hasMinLength ? 'text-slate-800' : 'text-slate-400'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      passwordChecks.hasUppercase ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <span className={passwordChecks.hasUppercase ? 'text-slate-800' : 'text-slate-400'}>
                    At least 1 uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      passwordChecks.hasLowercase ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <span className={passwordChecks.hasLowercase ? 'text-slate-800' : 'text-slate-400'}>
                    At least 1 lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      passwordChecks.hasNumberOrSymbol ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <span
                    className={
                      passwordChecks.hasNumberOrSymbol ? 'text-slate-800' : 'text-slate-400'
                    }
                  >
                    At least 1 number or special character
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 4: SUCCESS BANNER ────────────────────────────────────────── */}
          {step === 'SUCCESS' && (
            <div className="text-center space-y-4 pt-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your password has been changed successfully. You can now log into your MentorAura account with your new credentials.
              </p>
              <button
                onClick={() => router.push('/auth?mode=login')}
                className="w-full py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all"
              >
                Proceed to Login
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
