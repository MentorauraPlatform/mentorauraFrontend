'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MentorCard } from '@/components/mentor/MentorCard';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  marketplaceService,
  MentorCardData,
  CategoryItem,
} from '@/services/marketplace.service';

export default function MentorsPage() {
  const t = useTranslations('marketplace');

  const [mentors, setMentors] = useState<MentorCardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.searchMentors({
        q: searchTerm,
        category: selectedCategory,
        page,
        limit: 12,
      });
      setMentors(res?.items ?? []);
      setTotalPages(res?.meta?.totalPages ?? 1);
      setTotal(res?.meta?.total ?? 0);
    } catch (err: unknown) {
      console.error('Failed to search mentors:', err);
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, page]);

  useEffect(() => {
    marketplaceService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMentors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMentors]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory((prev) => (prev === slug ? '' : slug));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <Badge variant="orange" size="md" className="mb-2">
            {t('directoryBadge')}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#172033]">
            {t('directoryTitle')}
          </h1>
          <p className="text-[#64748B] text-base mt-2 max-w-2xl">
            {t('directorySubtitle')}
          </p>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-96 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full text-sm text-[#172033] bg-transparent focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <Badge
              variant={selectedCategory === '' ? 'orange' : 'slate'}
              size="md"
              className="cursor-pointer shrink-0 transition-all hover:scale-105"
              onClick={() => handleCategorySelect('')}
            >
              {t('allCategories')}
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.slug ? 'orange' : 'slate'}
                size="md"
                className="cursor-pointer shrink-0 transition-all hover:scale-105"
                onClick={() => handleCategorySelect(cat.slug)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500">{t('searching')}</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('noMentorsTitle')}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {t('noMentorsDesc')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              {t('clearFilters')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{t('showingMentors', { count: mentors.length, total })}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((m) => (
                <MentorCard key={m.id} mentor={m} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t('previous')}
                </Button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  {t('pageOf', { page, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t('next')}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
