'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi, FinancialSummary, FinancialTransaction } from '@/lib/api/admin';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function AdminFinancePage() {
  const t = useTranslations('admin.finance');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFinanceData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [sumRes, txRes] = await Promise.all([
        adminApi.getFinancialSummary(),
        adminApi.getTransactions({
          page,
          limit: 15,
          status: statusFilter || undefined,
          provider: providerFilter || undefined,
        }),
      ]);

      setSummary((sumRes.data as unknown as FinancialSummary) || null);
      const txData = txRes.data as unknown;
      let txList: FinancialTransaction[] = [];
      if (Array.isArray(txData)) {
        txList = txData as FinancialTransaction[];
      } else if (txData && typeof txData === 'object' && 'data' in txData && Array.isArray((txData as any).data)) {
        txList = (txData as any).data;
      }
      setTransactions(txList);
      setTotalPages(txRes.meta?.totalPages || 1);
      setTotalCount(txRes.meta?.total || txList.length);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, providerFilter]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const formatCurrency = (amount: number, currency = 'XAF') => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency || 'XAF',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <Badge variant="success" className="whitespace-nowrap flex-nowrap shrink-0">Completed</Badge>;
      case 'PENDING':
        return <Badge variant="warning" className="whitespace-nowrap flex-nowrap shrink-0">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="error" className="whitespace-nowrap flex-nowrap shrink-0">Failed</Badge>;
      case 'REFUNDED':
        return <Badge variant="slate" className="whitespace-nowrap flex-nowrap shrink-0">Refunded</Badge>;
      default:
        return <Badge variant="slate" className="whitespace-nowrap flex-nowrap shrink-0">{status}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const userName = tx.user?.name || tx.mentee?.name || '';
    const userEmail = tx.user?.email || tx.mentee?.email || '';
    const mentorName =
      tx.mentorship?.mentorName ||
      tx.mentor?.fullName ||
      tx.mentor?.name ||
      '';
    const providerRef = tx.providerTxId || tx.providerReference || '';
    return (
      userName.toLowerCase().includes(term) ||
      userEmail.toLowerCase().includes(term) ||
      mentorName.toLowerCase().includes(term) ||
      providerRef.toLowerCase().includes(term) ||
      tx.id.toLowerCase().includes(term)
    );
  });

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
            id="refresh-finance-btn"
            variant="outline"
            size="sm"
            onClick={fetchFinanceData}
            disabled={refreshing}
            className="flex items-center gap-2 border-slate-300 hover:border-slate-400 whitespace-nowrap flex-nowrap shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('refreshBtn')}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('gmvCardTitle')}</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316] shrink-0">
              <TrendingUp className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {formatCurrency(summary?.gmv ?? summary?.totalGmv ?? 0, summary?.currency)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{t('gmvSubtitle')}</span>
          </div>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('commissionCardTitle')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(summary?.platformCommission ?? summary?.totalPlatformRevenue ?? 0, summary?.currency)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span className="font-semibold text-emerald-600">
              {summary && (summary.gmv || summary.totalGmv) ? Math.round(((summary.platformCommission ?? summary.totalPlatformRevenue ?? 0) / (summary.gmv ?? summary.totalGmv ?? 1)) * 100) : 15}%
            </span>
            <span>{t('commissionRateNote')}</span>
          </div>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('mentorVolumeCardTitle')}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CreditCard className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {formatCurrency(summary?.mentorVolume ?? summary?.netMentorEarnings ?? 0, summary?.currency)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>{t('mentorVolumeSubtitle')}</span>
          </div>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('totalTxCardTitle')}</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {summary?.totalTransactions ?? summary?.totalTransactionsCount ?? 0}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span className="font-semibold text-purple-600">{summary?.successfulTransactions ?? summary?.successfulTransactionsCount ?? 0}</span>
            <span>{t('settledTxSubtitle')}</span>
          </div>
        </Card>
      </div>

      {/* Provider Breakdown & Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Providers Breakdown */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm lg:col-span-1 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{t('providerShareTitle')}</span>
          </h2>
          <div className="space-y-4">
            {summary?.breakdown?.byProvider && Object.keys(summary.breakdown.byProvider).length > 0 ? (
              Object.entries(summary.breakdown.byProvider).map(([provider, data]) => {
                const totalGmv = summary.gmv || 1;
                const percentage = Math.round((data.volume / totalGmv) * 100);
                const providerLabels: Record<string, string> = {
                  MTN_MOMO: 'MTN Mobile Money',
                  ORANGE_MONEY: 'Orange Money',
                  CARD: 'Debit / Credit Card',
                  BANK_TRANSFER: 'Bank Wire',
                };

                return (
                  <div key={provider} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700">{providerLabels[provider] || provider}</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(data.volume)} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          provider === 'MTN_MOMO'
                            ? 'bg-amber-400'
                            : provider === 'ORANGE_MONEY'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{data.count} transaction{data.count === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">{t('noTransactions')}</div>
            )}
          </div>
        </Card>

        {/* Monthly Trend Overview */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">{t('pageTitle')}</h2>
            <span className="text-xs text-slate-400">Past Months</span>
          </div>

          {((summary?.monthlyTrends && summary.monthlyTrends.length > 0) || (summary?.monthlyTrend && summary.monthlyTrend.length > 0)) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Month</th>
                    <th className="py-2.5 text-right">{t('totalTxCardTitle')}</th>
                    <th className="py-2.5 text-right">GMV</th>
                    <th className="py-2.5 text-right">{t('commissionCardTitle')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(summary?.monthlyTrends || summary?.monthlyTrend || []).map((trend: any) => (
                    <tr key={trend.month} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">{trend.month}</td>
                      <td className="py-3 text-right text-slate-600">{trend.transactions ?? trend.count}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(trend.gmv)}</td>
                      <td className="py-3 text-right font-bold text-emerald-600">{formatCurrency(trend.commission ?? trend.platformRevenue ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">{t('noTransactions')}</div>
          )}
        </Card>
      </div>

      {/* Transactions Ledger */}
      <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('recentTxTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing {filteredTransactions.length} of {totalCount} transactions</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
              <input
                type="text"
                id="search-transactions-input"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] text-slate-700"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="SUCCESS">Completed (Success)</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Provider Filter */}
            <select
              id="filter-provider-select"
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] text-slate-700"
            >
              <option value="">{t('allProviders')}</option>
              <option value="MTN_MOMO">MTN MoMo</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="CARD">Card</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="transactions-ledger-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">{t('dateCol')}</th>
                <th className="py-3 px-3">{t('userCol')}</th>
                <th className="py-3 px-3">Mentor</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-3 text-right">{t('amountCol')}</th>
                <th className="py-3 px-3 text-right">{t('platformCommission')}</th>
                <th className="py-3 px-3 text-right">Mentor Net</th>
                <th className="py-3 px-3 text-center">{t('statusCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{tx.user?.name || tx.mentee?.name || 'Anonymous User'}</div>
                      <div className="text-[11px] text-slate-400">{tx.user?.email || tx.mentee?.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{tx.mentorship?.mentorName || tx.mentor?.fullName || tx.mentor?.name || 'General Mentor'}</div>
                      {(tx.mentorship?.planTitle || tx.planTitle) && (
                        <div className="text-[11px] text-slate-400">{tx.mentorship?.planTitle || tx.planTitle}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] whitespace-nowrap flex-nowrap shrink-0">
                        {tx.provider}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(tx.platformFee || 0, tx.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {formatCurrency(tx.mentorEarnings || 0, tx.currency)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {t('noTxFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="whitespace-nowrap flex-nowrap shrink-0"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="whitespace-nowrap flex-nowrap shrink-0"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
