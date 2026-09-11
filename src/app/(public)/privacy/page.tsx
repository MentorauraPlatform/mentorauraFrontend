import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | MentorAura',
  description: 'Learn how MentorAura protects and manages your personal data and privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans text-[#172033]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
        <div>
          <Badge variant="orange" size="md" className="gap-1.5 mb-3">
            <Lock className="w-4 h-4" /> Data Protection
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#172033]">
            Privacy Policy
          </h1>
          <p className="text-[#64748B] text-sm sm:text-base mt-2">
            Last updated: August 27, 2026
          </p>
        </div>

        <article className="prose prose-slate max-w-none bg-white p-6 sm:p-10 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6 text-sm sm:text-base text-[#475569] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, including your full name, email address, user role, and communication preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">2. How We Use Information</h2>
            <p>
              Your personal data is used to match you with compatible mentors, schedule 1-on-1 sessions, process subscription payments, and send essential platform notifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">3. Data Security & Storage</h2>
            <p>
              We implement 256-bit SSL encryption and strict access controls to safeguard your personal information against unauthorized access or disclosure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">4. Third-Party Sharing</h2>
            <p>
              We do not sell your personal data. We only share information with trusted third-party providers required to operate our service (e.g. payment processors and calendar scheduling tools).
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>GDPR & Data Protection Compliant</span>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
