'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('pending');
      setMessage('Please check your email inbox for the verification link to activate your account.');
      return;
    }

    const verifyToken = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${API_URL}/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'An error occurred during email verification.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <Card variant="default" padding="lg" className="shadow-2xl bg-white border-[#E5E7EB] p-8 sm:p-10 rounded-3xl text-center space-y-6 max-w-md w-full">
      {status === 'loading' && (
        <div className="space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mx-auto animate-spin">
            <Loader2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#172033]">Verifying your email...</h2>
          <p className="text-sm text-[#64748B]">Please wait while we confirm your account details.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <Badge variant="orange" size="md" className="mx-auto">Email Verified</Badge>
          <h2 className="text-3xl font-extrabold text-[#172033]">Account Activated!</h2>
          <p className="text-base text-[#64748B] leading-relaxed">{message}</p>
          <div className="pt-4">
            <Link href="/auth?mode=login">
              <Button variant="primary" size="lg" className="w-full py-3.5 text-base font-bold shadow-md" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Continue to Login
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8" />
          </div>
          <Badge variant="orange" size="md" className="mx-auto">Check Your Email</Badge>
          <h2 className="text-3xl font-extrabold text-[#172033]">Verify Your Account</h2>
          <p className="text-base text-[#64748B] leading-relaxed">{message}</p>
          <div className="pt-4">
            <Link href="/auth?mode=login">
              <Button variant="primary" size="lg" className="w-full py-3.5 text-base font-bold shadow-md" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Continue to Login
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto">
            <AlertCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#172033]">Verification Failed</h2>
          <p className="text-sm text-red-600 font-medium bg-red-50 p-4 rounded-2xl border border-red-100">{message}</p>
          <div className="pt-4">
            <Link href="/auth?mode=register">
              <Button variant="outline" size="lg" className="w-full py-3.5 text-base font-bold">
                Back to Registration
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FFF7ED] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />

      <Suspense fallback={<Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
