'use client';

import { useEffect, useState } from 'react';
import { Star, CheckCircle2, X, Loader2 } from 'lucide-react';
import { reviewsApi } from '@/lib/api/client';
import type { Review } from '@/lib/api/reviews';

const TAGS = [
  'Clear Explanations',
  'Great Code Review',
  'Helpful Career Advice',
  'Prompt & Responsive',
];
const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const MAX_COMMENT = 1000;

type ReviewModalProps = {
  mentorshipId: string;
  mentorName: string;
  open: boolean;
  onClose: () => void;
  onSubmitted?: (review: Review) => void;
};

export function ReviewModal({
  mentorshipId,
  mentorName,
  open,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    if (!done) {
      setPopped(false);
      return;
    }
    const timer = setTimeout(() => setPopped(true), 30);
    return () => clearTimeout(timer);
  }, [done]);

  if (!open) return null;

  const activeStars = hover || rating;

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleClose() {
    if (submitting) return;
    onClose();
    // Reset after closing so the next open starts fresh
    setTimeout(() => {
      setRating(0);
      setHover(0);
      setTags([]);
      setComment('');
      setError(null);
      setDone(false);
    }, 200);
  }

  async function handleSubmit() {
    if (rating < 1) {
      setError('Please choose a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);

    // The backend stores rating + comment only, so selected tags are added to the comment text.
    const suffix = tags.length ? `\n\nTags: ${tags.join(', ')}` : '';
    const base = comment.trim().slice(0, MAX_COMMENT - suffix.length);
    const text = (base + suffix).trim();

    try {
      const res = await reviewsApi.createReview(mentorshipId, {
        rating,
        comment: text || undefined,
      });
      setDone(true);
      onSubmitted?.(res.data);
    } catch (err: unknown) {
      const apiError = err as { message?: string | string[]; statusCode?: number };
      const message = Array.isArray(apiError.message)
        ? apiError.message.join(', ')
        : apiError.message;
      setError(
        apiError.statusCode === 409
          ? 'You have already reviewed this mentorship.'
          : message || 'Could not submit your review. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Review ${mentorName}`}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="flex flex-col items-center space-y-3 py-8 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 transition-transform duration-500 ${
                popped ? 'scale-100' : 'scale-0'
              }`}
            >
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Thank you for your feedback!</h2>
            <p className="max-w-xs text-sm text-gray-600">
              Your review helps other mentees choose the right mentor and helps {mentorName} grow.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                How was your experience with {mentorName}?
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Your rating is shown on their public profile.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onClick={() => {
                      setRating(n);
                      setError(null);
                    }}
                    className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-9 w-9 ${
                        n <= activeStars
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm font-semibold text-amber-600">
                  {activeStars ? RATING_LABELS[activeStars - 1] : ''}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                What went well? (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => {
                  const selected = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        selected
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={MAX_COMMENT}
                rows={4}
                placeholder="Share more about your experience (optional)"
                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
              <p className="mt-1 text-right text-xs text-gray-500">
                {comment.length} / {MAX_COMMENT}
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || rating < 1}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
