'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi, ModerationReport, ModerationStats } from '@/lib/api/admin';
import {
  Flag,
  MessageSquare,
  User,
  Star,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  UserX,
  ShieldAlert,
} from 'lucide-react';

export default function AdminModerationPage() {
  const t = useTranslations('admin.moderation');
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Action confirmation modal
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [selectedAction, setSelectedAction] = useState<'DELETE_CONTENT' | 'SUSPEND_USER' | 'DISMISS' | 'WARN_USER' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchModerationData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [listRes, statsRes] = await Promise.all([
        adminApi.getModerationReports({
          status: statusFilter || undefined,
          targetType: typeFilter || undefined,
        }),
        adminApi.getModerationStats(),
      ]);

      const rawData = listRes.data as unknown;
      let list: ModerationReport[] = [];
      if (Array.isArray(rawData)) {
        list = rawData as ModerationReport[];
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as any).data)) {
        list = (rawData as any).data;
      }
      setReports(list);
      setStats((statsRes.data as unknown as ModerationStats) || null);
    } catch (err) {
      console.error('Failed to load moderation reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenActionModal = (
    report: ModerationReport,
    action: 'DELETE_CONTENT' | 'SUSPEND_USER' | 'DISMISS' | 'WARN_USER',
  ) => {
    setSelectedReport(report);
    setSelectedAction(action);
    setActionNotes('');
  };

  const handleActionSubmit = async () => {
    if (!selectedReport || !selectedAction) return;

    try {
      setActionLoading(true);
      const res = await adminApi.takeModerationAction(selectedReport.id, {
        action: selectedAction,
        notes: actionNotes || undefined,
      });

      showToast('success', res.message || t('actionSuccessToast'));
      setSelectedReport(null);
      setSelectedAction(null);
      fetchModerationData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to apply moderation action');
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'USER_PROFILE':
        return <User className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'REVIEW':
        return <Star className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Flag className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" className="whitespace-nowrap flex-nowrap shrink-0">Pending Review</Badge>;
      case 'ACTION_TAKEN':
        return <Badge variant="error" className="whitespace-nowrap flex-nowrap shrink-0">Action Taken</Badge>;
      case 'DISMISSED':
        return <Badge variant="slate" className="whitespace-nowrap flex-nowrap shrink-0">Dismissed</Badge>;
      default:
        return <Badge variant="slate" className="whitespace-nowrap flex-nowrap shrink-0">{status}</Badge>;
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
            {t('pageTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('pageSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="refresh-moderation-btn"
            variant="outline"
            size="sm"
            onClick={fetchModerationData}
            disabled={refreshing}
            className="flex items-center gap-2 border-slate-300 whitespace-nowrap flex-nowrap shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('flaggedTitle')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Flag className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">{stats?.pending || 0}</p>
          <p className="text-xs text-slate-500 mt-1">{t('subtitle')}</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('suspendUserBtn')}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <UserX className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 mt-2">{stats?.actionTaken || 0}</p>
          <p className="text-xs text-slate-500 mt-1">{t('historyTitle')}</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('dismissFlagBtn')}</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.dismissed || 0}</p>
          <p className="text-xs text-slate-500 mt-1">{t('approveKeepBtn')}</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('title')}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldAlert className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-700 space-y-0.5">
            <p>💬 Messages: {stats?.breakdown?.messages || 0}</p>
            <p>👤 Profiles: {stats?.breakdown?.profiles || 0}</p>
            <p>⭐ Reviews: {stats?.breakdown?.reviews || 0}</p>
          </div>
        </Card>
      </div>

      {/* Moderation Reports List */}
      <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { label: 'Pending Review', value: 'PENDING' },
              { label: 'Action Taken', value: 'ACTION_TAKEN' },
              { label: 'Dismissed', value: 'DISMISSED' },
              { label: 'All Reports', value: '' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-nowrap shrink-0 ${
                  statusFilter === tab.value
                    ? 'bg-[#172033] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              id="filter-target-type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] text-slate-700"
            >
              <option value="">All Content Types</option>
              <option value="MESSAGE">Chat Messages</option>
              <option value="USER_PROFILE">User Profiles</option>
              <option value="REVIEW">Reviews & Feedback</option>
            </select>
          </div>
        </div>

        {/* Reports Cards Feed */}
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-4 bg-white"
              >
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getTypeIcon(report.targetType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {report.targetType.replace('_', ' ')}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-rose-600">{report.reason}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t('reportedBy')} <span className="font-semibold text-slate-600">{report.reporter.name}</span> ({report.reporter.email}) on{' '}
                        {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(report.status)}</div>
                </div>

                {/* Details provided by reporter */}
                {report.details && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &ldquo;{report.details}&rdquo;
                  </p>
                )}

                {/* Hydrated Target Preview Card */}
                {report.targetPreview ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('contentLabel')}
                    </span>

                    {report.targetPreview.type === 'MESSAGE' && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-slate-800">
                            {report.targetPreview.sender?.name || 'Author'}
                          </span>
                          <span>{new Date(report.targetPreview.createdAt || '').toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 font-mono text-xs">{report.targetPreview.content}</p>
                      </div>
                    )}

                    {report.targetPreview.type === 'USER_PROFILE' && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{report.targetPreview.name}</div>
                          <div className="text-slate-500 text-[11px]">{report.targetPreview.email} ({report.targetPreview.role})</div>
                          {report.targetPreview.headline && (
                            <div className="text-slate-700 font-medium mt-1">{report.targetPreview.headline}</div>
                          )}
                          {report.targetPreview.bio && (
                            <p className="text-slate-600 text-xs mt-1 line-clamp-2">{report.targetPreview.bio}</p>
                          )}
                        </div>
                        <div>
                          <Badge variant={report.targetPreview.isActive ? 'success' : 'error'} className="whitespace-nowrap flex-nowrap shrink-0">
                            {report.targetPreview.isActive ? 'Active Account' : 'Suspended'}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {report.targetPreview.type === 'REVIEW' && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 shrink-0 ${
                                i < (report.targetPreview?.rating || 0) ? 'fill-current' : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-slate-500 text-xs ml-2">by {report.targetPreview.author?.name}</span>
                        </div>
                        <p className="text-slate-800 text-xs italic">&ldquo;{report.targetPreview.comment}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Target item no longer exists or was previously removed</div>
                )}

                {/* Moderation Action Buttons */}
                {report.status === 'PENDING' && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      id={`warn-user-${report.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenActionModal(report, 'WARN_USER')}
                      className="text-xs py-1 px-3 border-amber-300 text-amber-700 hover:bg-amber-50 whitespace-nowrap flex-nowrap shrink-0"
                    >
                      {t('warnUserBtn')}
                    </Button>
                    <Button
                      id={`dismiss-report-${report.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenActionModal(report, 'DISMISS')}
                      className="text-xs py-1 px-3 text-slate-600 hover:bg-slate-100 whitespace-nowrap flex-nowrap shrink-0"
                    >
                      {t('dismissFlagBtn')}
                    </Button>
                    {report.targetType !== 'USER_PROFILE' && (
                      <Button
                        id={`delete-content-${report.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenActionModal(report, 'DELETE_CONTENT')}
                        className="text-xs py-1 px-3 border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-1 whitespace-nowrap flex-nowrap shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('deleteMessageBtn')}</span>
                      </Button>
                    )}
                    <Button
                      id={`suspend-user-${report.id}`}
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenActionModal(report, 'SUSPEND_USER')}
                      className="text-xs py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 whitespace-nowrap flex-nowrap shrink-0"
                    >
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('suspendUserBtn')}</span>
                    </Button>
                  </div>
                )}

                {report.status === 'ACTION_TAKEN' && report.actionTaken && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold pt-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Action executed: {report.actionTaken}</span>
                    {report.notes && <span className="text-slate-400 font-normal">({report.notes})</span>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              {t('noFlaggedFound')}
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {selectedReport && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card padding="lg" className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">
                Confirm {selectedAction.replace('_', ' ')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {selectedAction === 'DELETE_CONTENT' && 'The flagged message or review will be permanently deleted from database records.'}
              {selectedAction === 'SUSPEND_USER' && 'The author of this flagged content will be locked out and their account deactivated.'}
              {selectedAction === 'DISMISS' && 'This report will be closed without applying penalties to the user.'}
              {selectedAction === 'WARN_USER' && 'An official warning will be logged against this user.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Moderator Notes (Audit Log)
              </label>
              <textarea
                id="moderator-action-notes"
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Specify the policy clause violated or justification..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedReport(null);
                  setSelectedAction(null);
                }}
                className="whitespace-nowrap flex-nowrap shrink-0"
              >
                Cancel
              </Button>
              <Button
                id="confirm-moderation-action-btn"
                variant="primary"
                size="sm"
                onClick={handleActionSubmit}
                disabled={actionLoading}
                className={`whitespace-nowrap flex-nowrap shrink-0 ${selectedAction === 'DISMISS' ? 'bg-slate-800 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
              >
                Confirm Action
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
