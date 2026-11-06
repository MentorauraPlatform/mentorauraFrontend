'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { adminApi } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  Lock,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchUser } = useAuth();
  const t = useTranslations('acceptInvitePage');

  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast.error(t('missingTokenError'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('passwordLengthError'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('passwordMismatchError'));
      return;
    }

    setLoading(true);
    try {
      await adminApi.acceptAdminInvite({
        token: token.trim(),
        password,
        fullName: fullName.trim() || undefined,
      });

      setSuccess(true);
      toast.success(t('activatedSuccessToast'));
      await refetchUser();

      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('acceptInviteError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-white">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-2">
            <BrandLogo size="md" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800">
              {t('badge')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xs text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        <Card padding="lg" className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-2xl">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-bold text-white">{t('welcomeTitle')}</h2>
              <p className="text-xs text-slate-400">
                {t('welcomeDesc')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">{t('tokenLabel')}</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t('tokenPlaceholder')}
                  required
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">{t('fullNameLabel')}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full text-xs pl-9 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">{t('newPasswordLabel')}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('newPasswordPlaceholder')}
                    required
                    className="w-full text-xs pl-9 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">{t('confirmPasswordLabel')}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPasswordPlaceholder')}
                    required
                    className="w-full text-xs pl-9 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full font-bold gap-2 mt-2 bg-orange-600 hover:bg-orange-700"
              >
                <ShieldAlert className="w-4 h-4" /> {t('completeSetup')}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-slate-500">
          {t('alreadyActivePrompt')}{' '}
          <Link href="/auth?mode=login" className="text-orange-400 font-bold hover:underline">
            {t('logInHere')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AcceptAdminInvitePage() {
  const t = useTranslations('acceptInvitePage');
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">{t('loadingInvitation')}</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
