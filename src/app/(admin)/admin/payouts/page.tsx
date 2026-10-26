'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi, AdminPayout, PayoutStats } from '@/lib/api/admin';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetPayout, setTargetPayout] = useState<AdminPayout | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPayoutData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [listRes, statsRes] = await Promise.all([
        adminApi.getPayouts({ status: statusFilter || undefined }),
        adminApi.getPayoutStats(),
      ]);

      const rawData = listRes.data as unknown;
      let list: AdminPayout[] = [];
      if (Array.isArray(rawData)) {
        list = rawData as AdminPayout[];
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as any).data)) {
        list = (rawData as any).data;
      }
      setPayouts(list);
      setStats((statsRes.data as unknown as PayoutStats) || null);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to load payouts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayoutData();
  }, [fetchPayoutData]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatCurrency = (amount: number, currency = 'XAF') => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency || 'XAF',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = payouts
        .filter((p) => p.status === 'PENDING')
        .map((p) => p.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Single Approve
  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve and release this mentor payout?')) return;
    try {
      setActionLoading(true);
      const res = await adminApi.approvePayout(id);
      showToast('success', res.message || 'Payout successfully approved and released');
      fetchPayoutData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to approve payout');
    } finally {
      setActionLoading(false);
    }
  };

  // Single Reject
  const handleRejectSubmit = async () => {
    if (!targetPayout) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for the rejection');
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminApi.rejectPayout(targetPayout.id, rejectionReason);
      showToast('success', res.message || 'Payout request rejected');
      setRejectModalOpen(false);
      setTargetPayout(null);
      setRejectionReason('');
      fetchPayoutData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reject payout');
    } finally {
      setActionLoading(false);
    }
  };

  // Batch Approve
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      const res = await adminApi.batchApprovePayouts(selectedIds);
      const batchData = res.data;
      showToast(
        'success',
        `Batch release completed! ${batchData?.approvedCount || selectedIds.length} payouts approved (${formatCurrency(batchData?.totalAmountReleased || 0, batchData?.currency || 'XAF')})`,
      );
      setBatchModalOpen(false);
      setSelectedIds([]);
      fetchPayoutData();
    } catch (err: any) {
      showToast('error', err?.message || 'Batch approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.mentor.fullName.toLowerCase().includes(term) ||
      p.mentor.email.toLowerCase().includes(term) ||
      p.accountNumber.toLowerCase().includes(term) ||
      p.provider.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Paid / Released</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Awaiting Review</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const selectedPendingPayouts = payouts.filter(
    (p) => selectedIds.includes(p.id) && p.status === 'PENDING',
  );
  const batchTotalAmount = selectedPendingPayouts.reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payout Management & Batch Approval
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review mentor withdrawal requests, verify payment details, and release payouts individually or in batches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button
              id="batch-approve-payouts-btn"
              variant="primary"
              size="sm"
              onClick={() => setBatchModalOpen(true)}
              className="bg-[#F97316] hover:bg-[#ea580c] text-white flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Release Selected ({selectedIds.length})</span>
            </Button>
          )}
          <Button
            id="refresh-payouts-btn"
            variant="outline"
            size="sm"
            onClick={fetchPayoutData}
            disabled={refreshing}
            className="flex items-center gap-2 border-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.pendingCount || 0}</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">
            {formatCurrency(stats?.pendingAmount || 0, stats?.currency)} pending release
          </p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Released</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(stats?.paidAmount || 0, stats?.currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{stats?.paidCount || 0} successfully settled</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rejected Requests</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.rejectedCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Declined or flagged withdrawals</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">All-Time Requests</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Lifetime mentor payout volume</p>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            {['PENDING', 'PAID', 'REJECTED', ''].map((st) => (
              <button
                key={st || 'ALL'}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-[#172033] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === '' ? 'All Payouts' : st === 'PENDING' ? 'Pending Approval' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-payouts-input"
                placeholder="Search mentor or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] w-60"
              />
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="admin-payouts-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    id="select-all-payouts-checkbox"
                    checked={
                      filteredPayouts.filter((p) => p.status === 'PENDING').length > 0 &&
                      selectedIds.length ===
                        filteredPayouts.filter((p) => p.status === 'PENDING').length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-[#F97316] focus:ring-[#F97316] h-4 w-4"
                  />
                </th>
                <th className="py-3 px-3">Mentor</th>
                <th className="py-3 px-3">Provider & Account</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Date Requested</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout) => {
                  const isPending = payout.status === 'PENDING';
                  const isChecked = selectedIds.includes(payout.id);

                  return (
                    <tr
                      key={payout.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        {isPending ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(payout.id, e.target.checked)}
                            className="rounded text-[#F97316] focus:ring-[#F97316] h-4 w-4"
                          />
                        ) : null}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{payout.mentor.fullName}</div>
                        <div className="text-[11px] text-slate-400">{payout.mentor.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{payout.provider}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {payout.accountNumber}
                          {payout.accountName ? ` (${payout.accountName})` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                        {formatCurrency(payout.amount, payout.currency)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(payout.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(payout.status)}
                        {payout.rejectionReason && (
                          <div className="text-[11px] text-rose-500 mt-1 max-w-[140px] truncate" title={payout.rejectionReason}>
                            {payout.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              id={`approve-payout-${payout.id}`}
                              size="sm"
                              variant="primary"
                              disabled={actionLoading}
                              onClick={() => handleApprove(payout.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2.5 h-auto rounded-lg"
                            >
                              Approve
                            </Button>
                            <Button
                              id={`reject-payout-${payout.id}`}
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                              onClick={() => {
                                setTargetPayout(payout);
                                setRejectModalOpen(true);
                              }}
                              className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs py-1 px-2.5 h-auto rounded-lg"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : payout.status === 'PAID' && payout.transactionRef ? (
                          <span className="text-[11px] font-mono text-slate-400">Ref: {payout.transactionRef.slice(0, 14)}...</span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payout requests found in this view
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      {rejectModalOpen && targetPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card padding="lg" className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">Reject Payout Request</h3>
            </div>
            <p className="text-xs text-slate-500">
              You are about to decline withdrawal of{' '}
              <span className="font-bold text-slate-800">
                {formatCurrency(targetPayout.amount, targetPayout.currency)}
              </span>{' '}
              for mentor <span className="font-semibold text-slate-800">{targetPayout.mentor.fullName}</span>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Rejection Reason (Sent to Mentor)
              </label>
              <textarea
                id="rejection-reason-textarea"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Account details mismatch, insufficient completed sessions, or KYC incomplete..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectModalOpen(false);
                  setTargetPayout(null);
                }}
              >
                Cancel
              </Button>
              <Button
                id="confirm-reject-payout-btn"
                variant="primary"
                size="sm"
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectionReason.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Batch Approval Modal */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card padding="lg" className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">Confirm Batch Release</h3>
            </div>
            <p className="text-xs text-slate-500">
              You have selected{' '}
              <span className="font-bold text-slate-900">{selectedIds.length} payout(s)</span> totalling{' '}
              <span className="font-black text-emerald-600">{formatCurrency(batchTotalAmount)}</span>.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <p>• Unique transaction references will be generated.</p>
              <p>• Statuses will change to <span className="font-bold text-emerald-600">PAID</span>.</p>
              <p>• Action will be permanently logged in administrative audit trails.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBatchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                id="confirm-batch-release-btn"
                variant="primary"
                size="sm"
                onClick={handleBatchApprove}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Release {formatCurrency(batchTotalAmount)}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
