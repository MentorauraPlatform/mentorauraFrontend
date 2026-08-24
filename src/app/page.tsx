import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Target,
  Zap,
  ArrowRight,
  Star,
  ShieldCheck,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFF7ED] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <Badge variant="orange" size="md" className="gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Africa&apos;s #1 Mentorship Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight leading-[1.12]">
                Find the right mentor for your{' '}
                <span className="text-[#F97316]">growth journey.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#64748B] font-normal leading-relaxed max-w-2xl">
                Connect 1:1 with vetted industry leaders, tech experts, and executives across Africa. Accelerate your career with personalized guidance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Find a Mentor
                  </Button>
                </Link>
                <Link href="#mentors">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Become a Mentor
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-[#E5E7EB] grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">500+</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] font-medium">Vetted Mentors</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">10,000+</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] font-medium">Sessions Held</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F97316]">98%</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] font-medium">Satisfaction Rate</p>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Preview Column */}
            <div className="lg:col-span-5 relative">
              <Card variant="default" padding="lg" className="shadow-xl bg-white border-[#E5E7EB] relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Featured Mentor</span>
                  <Badge variant="success" size="sm">Available This Week</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#172033] text-[#F97316] font-bold text-2xl flex items-center justify-center shadow">
                    AM
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#172033]">Amina Mansoor</h3>
                    <p className="text-xs text-[#64748B]">Senior Staff Engineer @ TechCorp</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-xs font-semibold text-[#172033]">4.9</span>
                      <span className="text-xs text-[#64748B]">(124 reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="slate" size="sm">Software Architecture</Badge>
                  <Badge variant="slate" size="sm">Career Transition</Badge>
                  <Badge variant="slate" size="sm">Tech Leadership</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFCF9] border border-[#E5E7EB] text-xs text-[#64748B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F97316] shrink-0" />
                  <span>Verified Mentor • 100% Guaranteed 1:1 Booking</span>
                </div>

                <Link href="/register" className="block">
                  <Button variant="primary" size="md" className="w-full">
                    Book 1:1 Session
                  </Button>
                </Link>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-3">
            <Badge variant="navy" size="md">Simple & Transparent</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              How MentorAura Works
            </h2>
            <p className="text-[#64748B] text-base">
              Connecting with expert guidance takes less than 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="hoverable" padding="lg" className="text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Discover Mentors</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Filter by domain, experience, industry, and availability to find your perfect mentor match.
              </p>
            </Card>

            <Card variant="hoverable" padding="lg" className="text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Book 1:1 Sessions</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Schedule calendar-synced 1:1 calls with secure payments via Mobile Money or Card.
              </p>
            </Card>

            <Card variant="hoverable" padding="lg" className="text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Grow & Excel</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Receive actionable advice, strategic roadmap reviews, and continuous mentorship support.
              </p>
            </Card>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
