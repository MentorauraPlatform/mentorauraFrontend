import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Star, ShieldCheck, ArrowRight, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MentorCardData } from '@/services/marketplace.service';

interface MentorCardProps {
  mentor: MentorCardData;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const t = useTranslations('marketplace');

  const formattedPrice = mentor.startingPrice
    ? t('fromPrice', {
        price: mentor.startingPrice.toLocaleString(),
        currency: mentor.currency,
      })
    : t('customPlans');

  return (
    <Card
      variant="hoverable"
      padding="lg"
      className="p-6 bg-white space-y-4 border-[#E5E7EB] flex flex-col justify-between h-full rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="space-y-4">
        {/* Header: Avatar, Name, Title, Verified Badge */}
        <div className="flex items-start gap-4">
          <Avatar name={mentor.fullName} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-lg font-bold text-[#172033] truncate">
                {mentor.fullName}
              </h3>
              {mentor.isVerified && (
                <span title={t('verifiedMentor')}>
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#64748B] flex items-center gap-1 mt-0.5 truncate">
              <Briefcase className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{mentor.title}</span>
              {mentor.company && <span>• {mentor.company}</span>}
            </p>
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <div className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{mentor.avgRating ? mentor.avgRating : '--'}</span>
          </div>
          <span>({t('reviews', { count: mentor.reviewCount })})</span>
        </div>

        {/* Bio excerpt if present */}
        {mentor.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {mentor.bio}
          </p>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {mentor.skills.slice(0, 3).map((skill) => (
            <Badge key={skill.id} variant="slate" size="sm" className="text-xs">
              {skill.name}
            </Badge>
          ))}
          {mentor.skills.length > 3 && (
            <span className="text-[11px] text-slate-400 font-medium self-center">
              {t('moreSkills', { count: mentor.skills.length - 3 })}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Price & CTA */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">
            {t('pricing')}
          </span>
          <span className="text-sm font-bold text-[#172033]">{formattedPrice}</span>
        </div>

        <Link href={`/mentors/${mentor.slug}`}>
          <Button variant="primary" size="sm" className="gap-1.5 font-semibold text-xs py-2 px-3">
            {t('viewProfile')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
