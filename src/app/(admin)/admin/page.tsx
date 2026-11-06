'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  adminApi,
  AdminMentorApplication,
  FinancialSummary,
  PayoutStats,
  DisputeStats,
  ModerationStats,
} from '@/lib/api/admin';
import {
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Wallet,
  AlertTriangle,
  Flag,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const t = useTranslations('admin.overview');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [recentApplications, setRecentApplications] = useState<AdminMentorApplication[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinancialSummary | null>(null);
  const [payoutStats, setPayoutStats] = useState<PayoutStats | null>(null);
  const [disputeStats, setDisputeStats] = useState<DisputeStats | null>(null);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount: number, currency = 'XAF') => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency || 'XAF',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const fetchOverviewData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [appsRes, financeRes, payoutsRes, disputesRes, moderationRes] =
        await Promise.allSettled([
          adminApi.getMentorApplications({ status: 'SUBMITTED', limit: 5 }),
          adminApi.getFinancialSummary(),
          adminApi.getPayoutStats(),
          adminApi.getDisputeStats(),
          adminApi.getModerationStats(),
        ]);

      if (appsRes.status === 'fulfilled') {
        const res = appsRes.value;
        const raw = res as unknown;
        let list: AdminMentorApplication[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).data)) {
          list = (res.data as any).data;
        } else if (Array.isArray(raw)) {
          list = raw as AdminMentorApplication[];
        }
        const total =
          res.meta?.total ??
          (res as any).total ??
          (res.data as any)?.meta?.total ??
          list.length;
        setRecentApplications(list);
        setPendingCount(total);
      }

      if (financeRes.status === 'fulfilled') {
        const res = financeRes.value;
        setFinanceSummary((res.data as unknown as FinancialSummary) || (res as any) || null);
      }

      if (payoutsRes.status === 'fulfilled') {
        const res = payoutsRes.value;
        setPayoutStats((res.data as unknown as PayoutStats) || (res as any) || null);
      }

      if (disputesRes.status === 'fulfilled') {
        const res = disputesRes.value;
        setDisputeStats((res.data as unknown as DisputeStats) || (res as any) || null);
      }

      if (moderationRes.status === 'fulfilled') {
        const res = moderationRes.value;
        setModerationStats((res.data as unknown as ModerationStats) || (res as any) || null);
      }
    } catch (err) {
      console.error('Failed to fetch admin overview data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const gmv = financeSummary?.gmv ?? financeSummary?.totalGmv ?? 0;
  const platformRevenue =
    financeSummary?.platformCommission ??
    financeSummary?.totalPlatformRevenue ??
    0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('pageTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('pageSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="refresh-overview-btn"
            variant="outline"
            size="sm"
            onClick={fetchOverviewData}
            disabled={refreshing}
            className="flex items-center gap-2 border-slate-300 whitespace-nowrap flex-nowrap shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('refreshMetrics')}</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Vetting Queue */}
        <Card padding="lg" className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('mentorVetting')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{pendingCount}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">{t('awaitingReview')}</span>
            <Link href="/admin/applications" className="font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap flex-nowrap shrink-0">
              {t('queueLink')}
            </Link>
          </div>
        </Card>

        {/* Financial GMV */}
        <Card padding="lg" className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('platformGmv')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(gmv)}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">{formatCurrency(platformRevenue)} {t('revenue')}</span>
            <Link href="/admin/finance" className="font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap flex-nowrap shrink-0">
              {t('ledgerLink')}
            </Link>
          </div>
        </Card>

        {/* Pending Payouts */}
        <Card padding="lg" className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('pendingPayouts')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Wallet className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{payoutStats?.pendingCount || 0}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">{formatCurrency(payoutStats?.pendingAmount || 0)}</span>
            <Link href="/admin/payouts" className="font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap flex-nowrap shrink-0">
              {t('releaseLink')}
            </Link>
          </div>
        </Card>

        {/* Open Disputes */}
        <Card padding="lg" className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('openDisputes')}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{disputeStats?.open || 0}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">{t('inReview', { count: disputeStats?.underReview || 0 })}</span>
            <Link href="/admin/disputes" className="font-bold text-rose-600 hover:text-rose-700 whitespace-nowrap flex-nowrap shrink-0">
              {t('casesLink')}
            </Link>
          </div>
        </Card>

        {/* Moderation Reports */}
        <Card padding="lg" className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('contentReports')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Flag className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{moderationStats?.pending || 0}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">{t('unresolvedFlags')}</span>
            <Link href="/admin/moderation" className="font-bold text-purple-600 hover:text-purple-700 whitespace-nowrap flex-nowrap shrink-0">
              {t('moderateLink')}
            </Link>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Applications Queue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Awaiting Vetting */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('recentAppsTitle')}</h2>
              <p className="text-xs text-slate-500">{t('recentAppsSubtitle')}</p>
            </div>
            <Link href="/admin/applications">
              <Button variant="ghost" size="sm" className="gap-1 font-bold text-orange-600 whitespace-nowrap flex-nowrap shrink-0">
                <span>{t('viewAllWithCount', { count: pendingCount })}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">{t('loading')}</p>
          ) : recentApplications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 shrink-0" />
              <p className="text-sm font-bold text-slate-700">{t('noAppsAwaiting')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{app.fullName}</h3>
                      <Badge variant="warning">{app.status || 'SUBMITTED'}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {app.title} {app.company ? `@ ${app.company}` : ''}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href={`/admin/applications/${app.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs shrink-0 whitespace-nowrap flex-nowrap">
                      {t('reviewLink')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Operational Shortcuts & System Status */}
        <div className="space-y-6">
          <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">{t('quickManagementTitle')}</h2>
            <div className="space-y-2">
              <Link
                href="/admin/finance"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('actionEscrowLedger')}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>

              <Link
                href="/admin/payouts"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t('actionProcessPayouts')} ({payoutStats?.pendingCount || 0})</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>

              <Link
                href="/admin/disputes"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{t('actionDisputeRes')} ({disputeStats?.open || 0})</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>

              <Link
                href="/admin/moderation"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Flag className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{t('actionContentSafety')} ({moderationStats?.pending || 0})</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{t('manageUsers')}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>

              <Link
                href="/admin/configuration"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('actionPlatformSettings')}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>
            </div>
          </Card>

          <Card padding="lg" className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">{t('actionPlatformSettings')}</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
            <p className="text-sm font-bold text-white">{t('actionContentSafety')}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('actionContentSafetyDesc')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
