'use client';

import { useEffect, useState, useRef } from 'react';
import { authApi, mentorApi } from '@/lib/api/client';
import type { MeResponse, MentorProfile } from '@/lib/types';
import Link from 'next/link';
import { 
  FiStar, 
  FiUsers, 
  FiTrendingUp, 
  FiShield, 
  FiArrowRight,
  FiBookOpen,
  FiUserCheck,
  FiAward,
  FiBriefcase,
  FiGlobe,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';

export default function HomePage() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    authApi.getMe(token)
      .then(async (me) => {
        setUser(me);
        if (me.role === 'MENTOR') {
          try {
            const profile = await mentorApi.getMyProfile(token);
            setMentorProfile(profile.data);
          } catch {
            setMentorProfile(null);
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'MENTOR') {
        const status = mentorProfile?.onboardingStatus;
        if (status === 'COMPLETE' || status === 'PENDING') {
          window.location.href = '/mentor/dashboard';
        } else {
          window.location.href = '/mentor/onboarding';
        }
      } else {
        window.location.href = '/mentee/dashboard';
      }
    }
  }, [loading, user, mentorProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <div className="flex items-center gap-3 text-[#5B6478]">
          <span className="w-5 h-5 rounded-full border-2 border-[#E2E5EB] border-t-[#E8A33D] animate-spin" />
          <span className="text-lg">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] relative overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif {
          font-family: 'Fraunces', ui-serif, Georgia, serif;
        }
        body {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E8A33D]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#101B33]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E8A33D]/[0.02] rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMDFCMzMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 lg:py-20">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(16,27,51,0.15)] border border-[#E2E5EB] overflow-hidden">
          {/* Hero Section */}
          <div className="bg-[#101B33] px-8 pt-16 pb-14 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E8A33D] via-[#E8A33D]/60 to-[#E8A33D]" />
            
            {/* Decorative Blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E8A33D]/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#E8A33D]/5 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#E8A33D] flex items-center justify-center">
                  <FiStar className="w-7 h-7 text-[#101B33]" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#E8A33D] font-semibold">
                  MentorAura
                </span>
              </div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-3xl mx-auto">
                Connect with expert mentors to{' '}
                <span className="text-[#E8A33D]">accelerate your growth</span>
              </h1>
              
              <p className="mt-6 text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                Join a community of mentees and mentors across Africa. Get personalized guidance, 
                build valuable skills, and achieve your career goals.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="bg-[#E8A33D] text-[#101B33] px-8 py-3.5 rounded-lg hover:bg-[#d4902e] font-medium transition-colors flex items-center justify-center gap-2 group"
                >
                  Get started
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="border border-white/20 text-white px-8 py-3.5 rounded-lg hover:bg-white/5 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
                <span className="flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Secure platform
                </span>
                <span className="w-px h-4 bg-white/10" />
                <span className="flex items-center gap-2">
                  <FiUserCheck className="w-4 h-4" />
                  Vetted mentors
                </span>
                <span className="w-px h-4 bg-white/10" />
                <span className="flex items-center gap-2">
                  <FiGlobe className="w-4 h-4" />
                  Pan-African
                </span>
                <span className="w-px h-4 bg-white/10" />
                <span className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Flexible scheduling
                </span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E5EB]">
            <div className="px-6 py-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[#E8A33D] mb-2">
                <FiUsers className="w-5 h-5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478]">Mentors</span>
              </div>
              <p className="font-serif text-2xl font-semibold text-[#101B33]">150+</p>
              <p className="text-sm text-[#9AA1B0] mt-1">Active experts</p>
            </div>
            <div className="px-6 py-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[#E8A33D] mb-2">
                <FiBookOpen className="w-5 h-5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478]">Mentees</span>
              </div>
              <p className="font-serif text-2xl font-semibold text-[#101B33]">1,200+</p>
              <p className="text-sm text-[#9AA1B0] mt-1">Growing community</p>
            </div>
            <div className="px-6 py-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[#E8A33D] mb-2">
                <FiCheckCircle className="w-5 h-5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478]">Sessions</span>
              </div>
              <p className="font-serif text-2xl font-semibold text-[#101B33]">5,000+</p>
              <p className="text-sm text-[#9AA1B0] mt-1">Completed</p>
            </div>
            <div className="px-6 py-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[#E8A33D] mb-2">
                <FiStar className="w-5 h-5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B6478]">Rating</span>
              </div>
              <p className="font-serif text-2xl font-semibold text-[#101B33]">4.9★</p>
              <p className="text-sm text-[#9AA1B0] mt-1">Average rating</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="px-8 py-12 border-t border-[#E2E5EB]">
            <div className="text-center mb-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C67F1E]">
                Why MentorAura
              </span>
              <h2 className="mt-3 font-serif text-3xl text-[#101B33]">Built for African professionals</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#F5F6F8] rounded-xl p-6 border border-[#E2E5EB]">
                <div className="w-12 h-12 rounded-xl bg-[#101B33] flex items-center justify-center mb-4">
                  <FiUsers className="w-6 h-6 text-[#E8A33D]" />
                </div>
                <h3 className="font-semibold text-[#101B33] text-lg">Expert Mentors</h3>
                <p className="mt-2 text-[#5B6478] text-sm leading-relaxed">
                  Connect with vetted industry professionals across Africa who understand your context.
                </p>
              </div>
              <div className="bg-[#F5F6F8] rounded-xl p-6 border border-[#E2E5EB]">
                <div className="w-12 h-12 rounded-xl bg-[#101B33] flex items-center justify-center mb-4">
                  <FiBriefcase className="w-6 h-6 text-[#E8A33D]" />
                </div>
                <h3 className="font-semibold text-[#101B33] text-lg">Career Growth</h3>
                <p className="mt-2 text-[#5B6478] text-sm leading-relaxed">
                  Get personalized guidance to accelerate your career and achieve your professional goals.
                </p>
              </div>
              <div className="bg-[#F5F6F8] rounded-xl p-6 border border-[#E2E5EB]">
                <div className="w-12 h-12 rounded-xl bg-[#101B33] flex items-center justify-center mb-4">
                  <FiAward className="w-6 h-6 text-[#E8A33D]" />
                </div>
                <h3 className="font-semibold text-[#101B33] text-lg">Flexible Learning</h3>
                <p className="mt-2 text-[#5B6478] text-sm leading-relaxed">
                  Book sessions that fit your schedule. Learn at your own pace with personalized support.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-[#101B33] px-8 py-10 text-center">
            <h3 className="font-serif text-2xl text-white">Ready to start your journey?</h3>
            <p className="mt-2 text-white/60">Join thousands of professionals growing with MentorAura.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-[#E8A33D] text-[#101B33] px-6 py-3 rounded-lg hover:bg-[#d4902e] font-medium transition-colors flex items-center justify-center gap-2 group"
              >
                Create account
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/mentors"
                className="border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5 font-medium transition-colors"
              >
                Browse mentors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}