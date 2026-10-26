'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi, AdminDispute, DisputeStats } from '@/lib/api/admin';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  DollarSign,
  User,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Resolution modal
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<string>('RESOLVED_REFUNDED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDisputeData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [listRes, statsRes] = await Promise.all([
        adminApi.getDisputes({
          status: statusFilter || undefined,
          reason: reasonFilter || undefined,
          search: searchTerm || undefined,
        }),
        adminApi.getDisputeStats(),
      ]);

      const rawData = listRes.data as unknown;
      let list: AdminDispute[] = [];
      if (Array.isArray(rawData)) {
        list = rawData as AdminDispute[];
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as any).data)) {
        list = (rawData as any).data;
      }
      setDisputes(list);
      setStats((statsRes.data as unknown as DisputeStats) || null);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, reasonFilter, searchTerm]);

  useEffect(() => {
    fetchDisputeData();
  }, [fetchDisputeData]);

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

  const handleOpenResolveModal = (dispute: AdminDispute) => {
    setSelectedDispute(dispute);
    setResolutionStatus('RESOLVED_REFUNDED');
    setResolutionNotes('');
    setRefundAmount(dispute.refundAmount || '');
  };

  const handleResolveSubmit = async () => {
    if (!selectedDispute) return;
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes explaining this determination');
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminApi.resolveDispute(selectedDispute.id, {
        status: resolutionStatus,
        resolutionNotes,
        refundAmount: resolutionStatus === 'RESOLVED_REFUNDED' && refundAmount ? Number(refundAmount) : undefined,
      });

      showToast('success', res.message || 'Dispute updated successfully');
      setSelectedDispute(null);
      fetchDisputeData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update dispute');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="warning">Open Ticket</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="navy">Under Investigation</Badge>;
      case 'RESOLVED_REFUNDED':
        return <Badge variant="success">Resolved: Refunded</Badge>;
      case 'RESOLVED_REJECTED':
        return <Badge variant="error">Resolved: Rejected</Badge>;
      case 'RESOLVED_RESCHEDULED':
        return <Badge variant="orange">Rescheduled</Badge>;
      case 'CLOSED':
        return <Badge variant="slate">Closed</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'SESSION_NO_SHOW':
        return 'Session No-Show';
      case 'POOR_QUALITY':
        return 'Quality Below Standards';
      case 'UNAUTHORIZED_CHARGE':
        return 'Unauthorized Charge';
      case 'MENTOR_UNRESPONSIVE':
        return 'Mentor Unresponsive';
      case 'SCHEDULING_CONFLICT':
        return 'Scheduling Conflict';
      default:
        return reason || 'Other Inquiry';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dispute Resolution Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Arbitrate refund requests, session no-shows, cancellation disputes, and mentee dissatisfaction claims.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="refresh-disputes-btn"
            variant="outline"
            size="sm"
            onClick={fetchDisputeData}
            disabled={refreshing}
            className="flex items-center gap-2 border-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Open Cases</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">{stats?.open || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Pending admin investigation</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Under Review</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.underReview || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Gathering mentor/mentee evidence</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Refunds Granted</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">{stats?.resolvedRefunded || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Resolved in favor of mentee</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Claims Rejected</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.resolvedRejected || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Disputes decided in mentor favor</p>
        </Card>
      </div>

      {/* Main Ticket Queue */}
      <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'All Cases', value: '' },
              { label: 'Open', value: 'OPEN' },
              { label: 'Under Review', value: 'UNDER_REVIEW' },
              { label: 'Refunded', value: 'RESOLVED_REFUNDED' },
              { label: 'Rejected', value: 'RESOLVED_REJECTED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.value
                    ? 'bg-[#172033] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Reason Filter */}
            <select
              id="filter-dispute-reason-select"
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] text-slate-700"
            >
              <option value="">All Reasons</option>
              <option value="SESSION_NO_SHOW">Session No-Show</option>
              <option value="POOR_QUALITY">Poor Quality</option>
              <option value="UNAUTHORIZED_CHARGE">Unauthorized Charge</option>
              <option value="MENTOR_UNRESPONSIVE">Mentor Unresponsive</option>
              <option value="SCHEDULING_CONFLICT">Scheduling Conflict</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-disputes-input"
                placeholder="Search ticket title or party..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] w-56"
              />
            </div>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="disputes-queue-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Ticket / Subject</th>
                <th className="py-3 px-3">Raised By</th>
                <th className="py-3 px-3">Target Party</th>
                <th className="py-3 px-3">Dispute Reason</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disputes.length > 0 ? (
                disputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{dispute.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{dispute.description}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{dispute.raisedBy.name}</div>
                      <div className="text-[11px] text-slate-400">{dispute.raisedBy.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      {dispute.targetUser ? (
                        <>
                          <div className="font-semibold text-slate-800">{dispute.targetUser.name}</div>
                          <div className="text-[11px] text-slate-400">{dispute.targetUser.email}</div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Platform / Mentor</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap">
                        {getReasonLabel(dispute.reason)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(dispute.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(dispute.status)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Button
                        id={`review-dispute-${dispute.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenResolveModal(dispute)}
                        className="text-xs py-1 px-2.5 h-auto rounded-lg border-slate-300 hover:border-slate-400"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        <span>Arbitrate</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No dispute cases in this queue
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resolution & Arbitration Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card padding="lg" className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F97316]">
                  Case Arbitration #{selectedDispute.id.slice(0, 8)}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedDispute.title}</h3>
              </div>
              <div>{getStatusBadge(selectedDispute.status)}</div>
            </div>

            {/* Case Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Claimant (Raised By)</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDispute.raisedBy.name}</p>
                <p className="text-slate-500">{selectedDispute.raisedBy.email} ({selectedDispute.raisedBy.role})</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Respondent (Target)</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDispute.targetUser?.name || 'Assigned Mentor'}</p>
                <p className="text-slate-500">{selectedDispute.targetUser?.email || 'N/A'}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Dispute Reason & Complaint</span>
                <p className="font-semibold text-slate-800 mt-1">{getReasonLabel(selectedDispute.reason)}</p>
                <p className="text-slate-600 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {selectedDispute.description}
                </p>
              </div>
              {selectedDispute.booking && (
                <div className="col-span-2 text-slate-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Linked Session: {new Date(selectedDispute.booking.scheduledAt).toLocaleString()} ({selectedDispute.booking.status})
                  </span>
                </div>
              )}
            </div>

            {/* Arbitration Decision Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Administrative Ruling</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Outcome</label>
                <select
                  id="dispute-outcome-select"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] font-semibold text-slate-800"
                >
                  <option value="RESOLVED_REFUNDED">Resolve & Grant Refund to Mentee</option>
                  <option value="RESOLVED_REJECTED">Resolve & Dismiss Claim (In Mentor&apos;s Favor)</option>
                  <option value="UNDER_REVIEW">Keep Under Active Investigation</option>
                  <option value="RESOLVED_RESCHEDULED">Resolve & Permit Reschedule</option>
                  <option value="CLOSED">Close Without Further Action</option>
                </select>
              </div>

              {resolutionStatus === 'RESOLVED_REFUNDED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Refund Amount (XAF)</label>
                  <input
                    type="number"
                    id="dispute-refund-amount-input"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter refund amount in XAF..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Cancels linked booking and logs refund transaction</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Determination Notes & Justification (Recorded in Audit Trail)
                </label>
                <textarea
                  id="dispute-resolution-notes"
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the rationale for this determination, session logs checked, or communications reviewed..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDispute(null)}
              >
                Close
              </Button>
              <Button
                id="submit-dispute-ruling-btn"
                variant="primary"
                size="sm"
                onClick={handleResolveSubmit}
                disabled={actionLoading || !resolutionNotes.trim()}
                className="bg-[#F97316] hover:bg-[#ea580c] text-white"
              >
                Apply Ruling
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
