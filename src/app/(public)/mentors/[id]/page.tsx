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
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  marketplaceService,
  MentorDetailData,
} from '@/services/marketplace.service';

export default function PublicMentorProfilePage() {
  const t = useTranslations('marketplace');
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [mentor, setMentor] = useState<MentorDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
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
              <a href="#plans">
                <Button variant="primary" size="lg" className="w-full font-bold shadow-md shadow-orange-500/10">
                  {t('bookMentorship')}
                </Button>
              </a>
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

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full font-bold mt-2"
                      onClick={() => {
                        router.push(`/mentee/dashboard/mentorships/apply?mentorId=${mentor.id}&planId=${plan.id}`);
                      }}
                    >
                      {t('applyForPlan')}
                    </Button>
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
