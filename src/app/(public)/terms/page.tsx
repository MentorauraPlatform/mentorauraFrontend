import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, FileText, Lock } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | MentorAura',
  description: 'Read the terms of service and conditions for using MentorAura mentorship services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans text-[#172033]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
        <div>
          <Badge variant="orange" size="md" className="gap-1.5 mb-3">
            <FileText className="w-4 h-4" /> Legal Agreement
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#172033]">
            Terms of Service
          </h1>
          <p className="text-[#64748B] text-sm sm:text-base mt-2">
            Last updated: August 27, 2026
          </p>
        </div>

        <article className="prose prose-slate max-w-none bg-white p-6 sm:p-10 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6 text-sm sm:text-base text-[#475569] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">1. Acceptance of Terms</h2>
            <p>
              By creating an account or accessing MentorAura platform services, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not access or use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">2. Mentorship Sessions & Conduct</h2>
            <p>
              Mentors and mentees must maintain a professional and respectful environment during all 1-on-1 video calls, async chat messaging, and code reviews. Harassment, discrimination, or abusive conduct will result in immediate suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">3. Subscription & Payments</h2>
            <p>
              Mentor subscriptions are billed periodically based on your selected mentor tier. Cancellations can be requested at any time prior to your next billing renewal cycle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">4. Intellectual Property</h2>
            <p>
              Mentees retain full ownership of code and projects shared for review. Mentors agree not to distribute or commercialize mentee work without explicit written approval.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-[#F97316]" />
            <span>MentorAura Official Policy Document</span>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
