'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Mail, Lock, User, AlertCircle, CheckCircle2, UserCheck, AcademicCapIcon } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'MENTEE' | 'MENTOR'>('MENTEE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Registration failed',
        );
      }

      // Store Tokens
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);

      // Redirect based on role
      if (role === 'MENTOR') {
        router.push('/mentor/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accent Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFF7ED] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-[#172033] flex items-center justify-center text-white font-bold text-2xl group-hover:bg-[#F97316] transition-colors shadow-md">
            M<span className="text-[#F97316] group-hover:text-white transition-colors">A</span>
          </div>
          <span className="text-2xl font-bold text-[#172033] tracking-tight">
            Mentor<span className="text-[#F97316]">Aura</span>
          </span>
        </Link>
        <Badge variant="orange" size="md" className="mb-3">
          Join MentorAura
        </Badge>
        <h2 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors">
            Log in here
          </Link>
        </p>
      </div>

      {/* Register Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card variant="default" padding="lg" className="shadow-lg animate-fade-in border-[#E5E7EB]">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector Cards */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F2937]">I am joining as a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('MENTEE')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between btn-transition ${
                    role === 'MENTEE'
                      ? 'border-[#F97316] bg-[#FFF7ED] text-[#172033]'
                      : 'border-[#E5E7EB] bg-white text-[#64748B] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className={`w-5 h-5 ${role === 'MENTEE' ? 'text-[#F97316]' : 'text-[#64748B]'}`} />
                    <span className="font-semibold text-sm">Mentee</span>
                  </div>
                  {role === 'MENTEE' && <CheckCircle2 className="w-4 h-4 text-[#F97316]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MENTOR')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between btn-transition ${
                    role === 'MENTOR'
                      ? 'border-[#F97316] bg-[#FFF7ED] text-[#172033]'
                      : 'border-[#E5E7EB] bg-white text-[#64748B] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 flex items-center justify-center font-bold text-xs rounded ${role === 'MENTOR' ? 'bg-[#F97316] text-white' : 'bg-slate-200 text-slate-700'}`}>M</div>
                    <span className="font-semibold text-sm">Mentor</span>
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
              leftIcon={<User className="w-4 h-4 text-[#64748B]" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4 text-[#64748B]" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              leftIcon={<Lock className="w-4 h-4 text-[#64748B]" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#64748B] leading-relaxed">
            By creating an account, you agree to MentorAura&apos;s{' '}
            <Link href="#" className="underline hover:text-[#172033]">Terms of Service</Link>{' '}
            and{' '}
            <Link href="#" className="underline hover:text-[#172033]">Privacy Policy</Link>.
          </p>
        </Card>
      </div>
    </div>
  );
}
