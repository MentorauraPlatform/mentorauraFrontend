'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
  Search,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Users,
  Code2,
  Palette,
  Briefcase,
  Brain,
  Rocket,
  Building2,
  Gift,
  MessageSquare,
  Award,
  Zap,
  Filter,
} from 'lucide-react';

export default function Home() {
  const tNav = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tMentor = useTranslations('mentorCard');
  const tCat = useTranslations('categories');
  const tFeatured = useTranslations('featuredSection');
  const tHow = useTranslations('howItWorks');
  const tTeams = useTranslations('teams');

  const categories = [
    { name: tCat('softwareEngineering'), count: `180+ ${tCat('activeMentorsCount')}`, icon: Code2, path: '/mentors?category=engineering' },
    { name: tCat('productManagement'), count: `120+ ${tCat('activeMentorsCount')}`, icon: Briefcase, path: '/mentors?category=product' },
    { name: tCat('uxDesign'), count: `95+ ${tCat('activeMentorsCount')}`, icon: Palette, path: '/mentors?category=design' },
    { name: tCat('dataScience'), count: `75+ ${tCat('activeMentorsCount')}`, icon: Brain, path: '/mentors?category=ai' },
    { name: tCat('startups'), count: `60+ ${tCat('activeMentorsCount')}`, icon: Rocket, path: '/mentors?category=startup' },
    { name: tCat('leadership'), count: `50+ ${tCat('activeMentorsCount')}`, icon: Award, path: '/mentors?category=leadership' },
  ];

  const featuredMentors = [
    {
      name: 'Amina Mansoor',
      title: 'Senior Staff Engineer',
      company: 'TechCorp',
      rating: '4.9',
      reviews: 124,
      skills: ['System Architecture', 'Career Transition', 'Tech Leadership'],
      avatar: 'AM',
      price: '$120/mo',
    },
    {
      name: 'David Okafor',
      title: 'Principal PM',
      company: 'Global Scale',
      rating: '5.0',
      reviews: 98,
      skills: ['Product Strategy', 'Roadmapping', 'Executive Management'],
      avatar: 'DO',
      price: '$150/mo',
    },
    {
      name: 'Elena Rostova',
      title: 'Head of UX & Product Design',
      company: 'Studio Design',
      rating: '4.95',
      reviews: 86,
      skills: ['UI/UX Systems', 'Portfolio Reviews', 'Figma Mastery'],
      avatar: 'ER',
      price: '$110/mo',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans overflow-x-hidden text-[#172033]">
      <Navbar />

      <main id="main-content">
        {/* Hero Section */}
        <section aria-labelledby="hero-heading" className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#FFF7ED]/60 via-[#FFFCF9] to-white">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F97316]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-orange-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Content Column */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <Badge variant="orange" size="md" className="gap-2 shadow-xs inline-flex py-1.5 px-3">
                  <Sparkles className="w-4 h-4 text-[#F97316]" /> {tHero('badge')}
                </Badge>

                <h1 id="hero-heading" className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#172033] tracking-tight leading-[1.12]">
                  {tHero('titlePart1')}{' '}
                  <span className="text-[#F97316] relative inline-block">
                    {tHero('titleHighlight')}
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#F97316]/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                      <path d="M0,0 Q50,12 100,0" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  </span>
                </h1>

                <p className="text-base sm:text-xl text-[#475569] font-normal leading-relaxed max-w-2xl">
                  {tHero('subtitle')}
                </p>

                {/* Mentor Search Bar */}
                <div className="pt-2">
                  <form action="/mentors" method="GET" className="p-2 bg-white rounded-2xl shadow-xl border border-gray-200/80 flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                    <div className="flex items-center gap-2.5 px-3 py-2 w-full">
                      <Search className="w-5 h-5 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        name="q"
                        placeholder={tHero('searchPlaceholder')}
                        className="w-full text-sm sm:text-base text-[#172033] placeholder-gray-400 bg-transparent focus:outline-none"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto shrink-0 shadow-md">
                      {tHero('findMentorBtn')}
                    </Button>
                  </form>
                  <p className="text-xs text-[#64748B] mt-2.5 flex items-center justify-center lg:justify-start gap-4">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tHero('vettedMentors')}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tHero('flexibleSubscriptions')}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tHero('riskFreeTrial')}</span>
                  </p>
                </div>

                {/* Stats Bar */}
                <div className="pt-6 border-t border-[#E5E7EB] grid grid-cols-3 gap-4 text-center lg:text-left">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033]">500+</h2>
                    <p className="text-xs sm:text-sm text-[#64748B] font-semibold">{tHero('activeMentors')}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033]">20,000+</h2>
                    <p className="text-xs sm:text-sm text-[#64748B] font-semibold">{tHero('sessionsCompleted')}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#F97316]">99%</h2>
                    <p className="text-xs sm:text-sm text-[#64748B] font-semibold">{tHero('satisfactionRate')}</p>
                  </div>
                </div>
              </div>

              {/* Right Featured Mentor Card Column */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                <Card variant="default" padding="lg" className="shadow-2xl bg-white border-[#E5E7EB] relative z-10 space-y-5 p-6 rounded-3xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {tMentor('featuredBadge')}
                    </span>
                    <Badge variant="success" size="sm">{tMentor('availableNow')}</Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#172033] text-[#F97316] font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0 border-2 border-orange-100">
                      AM
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#172033]">Amina Mansoor</h3>
                      <p className="text-xs font-medium text-[#64748B]">Senior Staff Engineer @ TechCorp</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="text-xs font-bold text-[#172033]">4.9</span>
                        <span className="text-xs text-[#64748B]">(124 {tMentor('mentorshipSessions')})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="slate" size="sm">System Architecture</Badge>
                    <Badge variant="slate" size="sm">Career Transition</Badge>
                    <Badge variant="slate" size="sm">Tech Leadership</Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFF7ED]/70 border border-orange-100 text-xs text-[#172033] flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#F97316] shrink-0" />
                    <span className="font-semibold">{tMentor('includesNote')}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs text-gray-500 block">{tMentor('startingFrom')}</span>
                      <span className="text-xl font-black text-[#172033]">$120 <span className="text-xs font-normal text-gray-500">{tMentor('perMonth')}</span></span>
                    </div>
                    <Link href="/register">
                      <Button variant="primary" size="md" className="shadow-sm font-bold">
                        {tMentor('bookSession')}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* Category Browser Section (MentorCruise Style Grid) */}
        <section id="categories" aria-labelledby="categories-heading" className="py-16 sm:py-24 bg-white border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <Badge variant="navy" size="md" className="mb-2">{tCat('badge')}</Badge>
                <h2 id="categories-heading" className="text-2xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
                  {tCat('title')}
                </h2>
                <p className="text-[#64748B] text-sm sm:text-base mt-1">
                  {tCat('subtitle')}
                </p>
              </div>
              <Link href="/mentors" className="text-[#F97316] font-bold text-sm flex items-center gap-1 hover:underline">
                {tCat('viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <Link key={idx} href={cat.path} className="group">
                    <Card variant="hoverable" padding="lg" className="p-6 h-full flex items-center justify-between border-[#E5E7EB] group-hover:border-[#F97316] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold text-xl group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#172033] group-hover:text-[#F97316] transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-[#64748B] font-medium">{cat.count}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#F97316] transition-transform group-hover:translate-x-1" />
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Mentors Carousel/Grid Section */}
        <section id="mentors" aria-labelledby="mentors-heading" className="py-16 sm:py-24 bg-[#FFFCF9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="orange" size="md">{tFeatured('badge')}</Badge>
              <h2 id="mentors-heading" className="text-2xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
                {tFeatured('title')}
              </h2>
              <p className="text-[#64748B] text-sm sm:text-base">
                {tFeatured('subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {featuredMentors.map((m, idx) => (
                <Card key={idx} variant="hoverable" padding="lg" className="p-6 bg-white space-y-4 border-[#E5E7EB] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#172033] text-[#F97316] font-bold text-xl flex items-center justify-center shrink-0">
                        {m.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#172033]">{m.name}</h3>
                        <p className="text-xs text-[#64748B]">{m.title} @ <span className="font-semibold text-gray-800">{m.company}</span></p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-xs font-bold">{m.rating}</span>
                          <span className="text-xs text-gray-400">({m.reviews} {tFeatured('reviews')})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {m.skills.map((skill, sIdx) => (
                        <Badge key={sIdx} variant="slate" size="sm">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">{tFeatured('monthlyPlan')}</span>
                      <span className="text-lg font-black text-[#172033]">{m.price}</span>
                    </div>
                    <Link href="/register">
                      <Button variant="outline" size="sm" className="font-bold">
                        {tFeatured('applyNow')}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" aria-labelledby="how-heading" className="py-16 sm:py-24 bg-white border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="navy" size="md">{tHow('badge')}</Badge>
              <h2 id="how-heading" className="text-2xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
                {tHow('title')}
              </h2>
              <p className="text-[#64748B] text-sm sm:text-base">
                {tHow('subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card variant="hoverable" padding="lg" className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold text-xl">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#172033]">{tHow('step1Title')}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {tHow('step1Desc')}
                </p>
              </Card>

              <Card variant="hoverable" padding="lg" className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold text-xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#172033]">{tHow('step2Title')}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {tHow('step2Desc')}
                </p>
              </Card>

              <Card variant="hoverable" padding="lg" className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold text-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#172033]">{tHow('step3Title')}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {tHow('step3Desc')}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* MentorAura For Teams Section */}
        <section id="teams" aria-labelledby="teams-heading" className="py-16 sm:py-24 bg-[#172033] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <Badge variant="orange" size="md" className="bg-[#F97316] text-white border-none">
                  <Building2 className="w-4 h-4" /> {tTeams('badge')}
                </Badge>
                <h2 id="teams-heading" className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {tTeams('title')}
                </h2>
                <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                  {tTeams('subtitle')}
                </p>
              </div>
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="shadow-lg font-bold px-8 py-4 text-base">
                    {tTeams('demoBtn')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
