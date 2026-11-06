'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { reviewsApi } from '@/lib/api/client';
import type { PublicReview, ReviewStats } from '@/lib/api/reviews';

const PAGE_SIZE = 10;

type MentorReviewsSectionProps = {
  mentorId: string;
  mentorName: string;
};

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${
            n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
}

export function MentorReviewsSection({ mentorId, mentorName }: MentorReviewsSectionProps) {
  const t = useTranslations('marketplace');
  const [items, setItems] = useState<PublicReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    reviewsApi
      .getMentorReviews(mentorId, { page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setTotal(data.total);
        setStats({
          avgRating: data.avgRating,
          reviewCount: data.reviewCount,
          breakdown: data.breakdown,
        });
      })
      .catch((err: { message?: string | string[] }) => {
        if (cancelled) return;
        const message = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
        setError(message || 'Could not load reviews.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mentorId, page]);

  const reviewCount = stats?.reviewCount ?? 0;
  const avg = Number(stats?.avgRating ?? 0);

  return (
    <Card padding="lg" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <MessageSquare className="h-5 w-5 text-amber-500" />
        {t('menteeReviews', { count: reviewCount })}
      </h2>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {loading && items.length === 0 && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        </div>
      )}

      {!loading && !error && reviewCount === 0 && (
        <p className="py-2 text-xs italic text-slate-500">{t('noReviews', { name: mentorName })}</p>
      )}

      {stats && reviewCount > 0 && (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-center sm:w-32">
            <span className="text-4xl font-black text-slate-900">{avg.toFixed(1)}</span>
            <Stars value={avg} />
            <span className="mt-1 text-xs text-slate-500">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
          <div className="w-full flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.breakdown[String(star) as '1' | '2' | '3' | '4' | '5'] ?? 0;
              const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-6 shrink-0 font-semibold">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4 divide-y divide-slate-100">
          {items.map((rev) => (
            <div key={rev.id} className="space-y-2 pt-4 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {rev.reviewerAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rev.reviewerAvatarUrl}
                      alt={rev.reviewerName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                      {rev.reviewerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-800">{rev.reviewerName}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Mentee
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Stars value={rev.rating} className="h-3.5 w-3.5" />
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              {rev.comment && (
                <p className="whitespace-pre-line text-xs leading-normal text-slate-600">
                  {rev.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length < total && (
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Show more reviews'}
        </button>
      )}
    </Card>
  );
}
