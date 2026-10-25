'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Star,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageSquare,
  Award,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { applicationsApi, mentorshipsApi } from '@/lib/api/client';
import type { MentorshipApplication, Mentorship } from '@/lib/types';
import {
  marketplaceService,
  MentorDetailData,
} from '@/services/marketplace.service';

export default function PublicMentorProfilePage() {
  const t = useTranslations('marketplace');
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [mentor, setMentor] = useState<MentorDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    marketplaceService
      .getMentorProfile(id)
      .then((data) => setMentor(data))
      .catch((err) => {
        console.error('Failed to fetch mentor profile:', err);
        setError(err?.message || 'Mentor profile not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setMentorships([]);
      return;
    }

    let isMounted = true;
    void Promise.allSettled([
      applicationsApi.getMyApplications(),
      mentorshipsApi.getMenteeMentorships(),
    ]).then(([appsRes, mentorshipsRes]) => {
      if (!isMounted) return;
      if (appsRes.status === 'fulfilled') {
        const raw = appsRes.value.data as unknown;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
          : [];
        setApplications(list);
      }
      if (mentorshipsRes.status === 'fulfilled') {
        const raw = mentorshipsRes.value.data as unknown;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
          : [];
        setMentorships(list);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">{t('searching')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t('notFoundTitle')}</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('notFoundDesc')}
          </p>
          <Link href="/mentors">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('backToDirectory')}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if current user has any application or mentorship with this mentor
  const mentorPendingApp = applications.find(
    (a) => mentor && (a.mentorId === mentor.id || (mentor.plans || []).some((p) => p.id === a.planId)) && a.status === 'PENDING'
  );
  const mentorActiveOrIntro = mentorships.find(
    (m) =>
      mentor &&
      (m.mentorId === mentor.id || (mentor.plans || []).some((p) => p.id === m.planId)) &&
      ['INTRO', 'ACTIVE', 'PAUSED'].includes(m.status)
  );

  const getPlanStatus = (planId: string) => {
    // 1. Mentorship takes highest priority
    const userMentorship = mentorships.find(
      (m) =>
        (m.planId === planId || (mentor && m.mentorId === mentor.id)) &&
        ['INTRO', 'ACTIVE', 'PAUSED'].includes(m.status)
    );

    if (userMentorship) {
      return {
        type:
          userMentorship.status === 'INTRO'
            ? ('INTRO_MENTORSHIP' as const)
            : ('ACTIVE_MENTORSHIP' as const),
        mentorship: userMentorship,
      };
    }

    // 2. Pending application for this specific plan or this mentor
    const pendingApp = applications.find(
      (a) =>
        (a.planId === planId || (mentor && a.mentorId === mentor.id)) &&
        a.status === 'PENDING'
    );

    if (pendingApp) {
      return {
        type: 'PENDING_APPLICATION' as const,
        application: pendingApp,
      };
    }

    // 3. Accepted application
    const acceptedApp = applications.find(
      (a) =>
        (a.planId === planId || (mentor && a.mentorId === mentor.id)) &&
        a.status === 'ACCEPTED'
    );

    if (acceptedApp) {
      return {
        type: 'ACCEPTED_APPLICATION' as const,
        application: acceptedApp,
      };
    }

    return { type: 'NONE' as const };
  };

  // JSON-LD structured data for SEO rich snippets
  const jsonLd = mentor
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: mentor.fullName,
          jobTitle: mentor.title,
          worksFor: mentor.company ? { '@type': 'Organization', name: mentor.company } : undefined,
          description: mentor.bio || mentor.experience || `${mentor.title} offering 1-on-1 mentorship on MentorAura.`,
          knowsAbout: mentor.skills.map((s) => s.name),
          ...(mentor.avgRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: mentor.avgRating,
              reviewCount: Math.max(mentor.reviewCount, 1),
              bestRating: '5',
              worstRating: '1',
            },
          }),
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Back Link */}
        <Link href="/mentors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('backToDirectory')}
        </Link>

        {/* Hero Card */}
        <Card padding="lg" className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <Avatar
                name={mentor.fullName}
                size="xl"
                className="w-20 h-20 text-xl font-bold border-2 border-orange-100 shadow-sm"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {mentor.fullName}
                  </h1>
                  {mentor.isVerified && (
                    <Badge variant="success" size="md" className="gap-1 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {t('verifiedMentor')}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{mentor.title}</span>
                  {mentor.company && <span>• {mentor.company}</span>}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{mentor.avgRating ? mentor.avgRating : 'New'}</span>
                  </div>
                  <span>{t('reviews', { count: mentor.reviewCount })}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              {mentorPendingApp ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-bold text-emerald-700 border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 gap-2 shadow-sm"
                  onClick={() => router.push('/mentee/dashboard/mentorships')}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Application Pending
                </Button>
              ) : mentorActiveOrIntro ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-orange-500/10"
                  onClick={() => {
                    if (mentorActiveOrIntro.status === 'INTRO') {
                      router.push(`/mentee/dashboard/mentorships/${mentorActiveOrIntro.id}/checkout`);
                    } else {
                      router.push(`/mentee/dashboard/mentorships/${mentorActiveOrIntro.id}`);
                    }
                  }}
                >
                  {mentorActiveOrIntro.status === 'INTRO' ? 'Activate Mentorship' : 'View Mentorship'}
                </Button>
              ) : (
                <a href="#plans">
                  <Button variant="primary" size="lg" className="w-full font-bold shadow-md shadow-orange-500/10">
                    {t('bookMentorship')}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </Card>

        {/* Main Grid: Bio/Skills on left, Plans on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Bio, Skills, Areas of Expertise) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            {mentor.bio && (
              <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {t('about', { name: mentor.fullName.split(' ')[0] })}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {mentor.bio}
                </p>
              </Card>
            )}

            {/* Experience Section */}
            {mentor.experience && (
              <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
                <h2 className="text-lg font-bold text-slate-900">{t('backgroundExperience')}</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {mentor.experience}
                </p>
              </Card>
            )}

            {/* Skills & Level Badges */}
            {mentor.skills.length > 0 && (
              <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  {t('skillsProficiency')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mentor.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-sm font-semibold text-slate-800">{skill.name}</span>
                      <Badge variant="orange" size="sm" className="capitalize text-[11px]">
                        {skill.level.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Areas of Expertise */}
            {mentor.areasOfExpertise.length > 0 && (
              <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
                <h2 className="text-lg font-bold text-slate-900">{t('areasOfExpertise')}</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.areasOfExpertise.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200/60 rounded-xl text-xs font-semibold"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews Section */}
            <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                {t('menteeReviews', { count: mentor.reviewCount })}
              </h2>

              {mentor.reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  {t('noReviews', { name: mentor.fullName })}
                </p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {mentor.reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{rev.reviewerName}</span>
                        <div className="flex items-center gap-1 font-bold text-xs text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-slate-600 leading-normal">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Plans & Pricing */}
          <div id="plans" className="space-y-6">
            <div className="sticky top-6 space-y-4">
              <h2 className="text-xl font-black text-slate-900">{t('mentorshipPlans')}</h2>

              {mentor.plans.length === 0 ? (
                <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    {t('noPlansMentor')}
                  </p>
                </Card>
              ) : (
                mentor.plans.map((plan) => (
                  <Card
                    key={plan.id}
                    padding="lg"
                    className="p-6 bg-white border-2 border-slate-200 hover:border-orange-500 rounded-2xl shadow-sm space-y-4 transition-all duration-200"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{plan.title}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {t('perMonth', {
                            price: plan.priceAmount.toLocaleString(),
                            currency: plan.currency,
                          })}
                        </span>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {plan.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{t('sessionsPerMonthNote', { count: plan.sessionsPerMonth })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{t('messagingNote')}</span>
                      </div>
                    </div>

                    {(() => {
                      const planStatus = getPlanStatus(plan.id);

                      if (planStatus.type === 'PENDING_APPLICATION') {
                        return (
                          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                            <div className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs shadow-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Applied • Application Pending</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs font-semibold text-slate-700 hover:text-orange-600 border-slate-200 hover:bg-slate-50 transition-colors"
                              onClick={() => router.push('/mentee/dashboard/mentorships')}
                            >
                              View Application in Dashboard
                            </Button>
                          </div>
                        );
                      }

                      if (planStatus.type === 'INTRO_MENTORSHIP' || planStatus.type === 'ACCEPTED_APPLICATION') {
                        const mId = planStatus.type === 'INTRO_MENTORSHIP' ? planStatus.mentorship.id : null;
                        return (
                          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                            <div className="w-full py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-800 text-xs font-semibold">
                              Application Accepted!
                            </div>
                            <Button
                              variant="primary"
                              size="md"
                              className="w-full font-bold bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20"
                              onClick={() => {
                                if (mId) {
                                  router.push(`/mentee/dashboard/mentorships/${mId}/checkout`);
                                } else {
                                  router.push('/mentee/dashboard/mentorships');
                                }
                              }}
                            >
                              Activate Plan & Pay
                            </Button>
                          </div>
                        );
                      }

                      if (planStatus.type === 'ACTIVE_MENTORSHIP') {
                        return (
                          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                            <div className="w-full py-2 px-3 bg-green-50 border border-green-200 rounded-xl text-center text-green-800 text-xs font-semibold flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                              Active Mentorship
                            </div>
                            <Button
                              variant="outline"
                              size="md"
                              className="w-full font-bold text-slate-800 hover:text-orange-600"
                              onClick={() => router.push(`/mentee/dashboard/mentorships/${planStatus.mentorship.id}`)}
                            >
                              View Mentorship
                            </Button>
                          </div>
                        );
                      }

                      return (
                        <Button
                          variant="primary"
                          size="md"
                          className="w-full font-bold mt-2"
                          onClick={() => {
                            if (!user) {
                              router.push(`/auth?mode=login&redirect=/mentors/${mentor.id}`);
                              return;
                            }
                            router.push(`/mentee/dashboard/mentorships/apply?mentorId=${mentor.id}&planId=${plan.id}`);
                          }}
                        >
                          {t('applyForPlan')}
                        </Button>
                      );
                    })()}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
