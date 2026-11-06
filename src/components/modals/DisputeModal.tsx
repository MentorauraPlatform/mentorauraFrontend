'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorshipId?: string;
  bookingId?: string;
  targetUserId?: string;
  contextLabel?: string;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  mentorshipId,
  bookingId,
  targetUserId,
  contextLabel,
}) => {
  const t = useTranslations('disputeModal');
  const [reason, setReason] = useState<
    | 'SESSION_NO_SHOW'
    | 'POOR_QUALITY'
    | 'UNAUTHORIZED_CHARGE'
    | 'MENTOR_UNRESPONSIVE'
    | 'SCHEDULING_CONFLICT'
    | 'OTHER'
  >('SESSION_NO_SHOW');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const disputeReasons = [
    { value: 'SESSION_NO_SHOW', label: t('reasonNoShow') },
    { value: 'POOR_QUALITY', label: t('reasonPoorQuality') },
    { value: 'MENTOR_UNRESPONSIVE', label: t('reasonUnresponsive') },
    { value: 'SCHEDULING_CONFLICT', label: t('reasonScheduling') },
    { value: 'UNAUTHORIZED_CHARGE', label: t('reasonBilling') },
    { value: 'OTHER', label: t('reasonOther') },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error(t('reasonRequiredError'));
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.createDispute({
        title: title.trim(),
        description: description.trim(),
        reason,
        mentorshipId,
        bookingId,
        targetUserId,
      });
      toast.success(t('submitSuccessToast'));
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[] };
      const msg = Array.isArray(apiErr?.message)
        ? apiErr.message.join(', ')
        : apiErr?.message || t('submitFailedError');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#172033]">{t('title')}</h3>
              <p className="text-xs text-slate-500">
                {contextLabel || t('defaultContext')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('reasonLabel')}</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {disputeReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('subjectLabel')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('subjectPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('detailsLabel')}</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('detailsPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitting ? t('submitting') : t('submitDispute')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
