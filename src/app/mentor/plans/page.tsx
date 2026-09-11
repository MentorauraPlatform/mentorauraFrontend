'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Package,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  marketplaceService,
  PlanItem,
  CreatePlanPayload,
} from '@/services/marketplace.service';

export default function MentorPlansPage() {
  const t = useTranslations('marketplace');

  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state for creating plan
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreatePlanPayload>({
    title: '',
    description: '',
    priceAmount: 15000,
    currency: 'XAF',
    sessionsPerMonth: 4,
  });

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await marketplaceService.getMyPlans();
      setPlans(data);
    } catch (err: unknown) {
      console.error('Failed to load plans:', err);
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load mentorship plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await marketplaceService.createPlan({
        ...formData,
        priceAmount: Number(formData.priceAmount),
        sessionsPerMonth: Number(formData.sessionsPerMonth),
      });

      setSuccessMsg(t('planCreatedSuccess'));
      setIsCreating(false);
      setFormData({
        title: '',
        description: '',
        priceAmount: 15000,
        currency: 'XAF',
        sessionsPerMonth: 4,
      });
      fetchPlans();
    } catch (err: unknown) {
      console.error('Failed to create plan:', err);
      const e = err as { message?: string };
      setError(e?.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm(t('confirmDeactivate'))) return;
    try {
      await marketplaceService.deletePlan(id);
      setSuccessMsg(t('planDeactivatedSuccess'));
      fetchPlans();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e?.message || 'Failed to deactivate plan');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="orange" size="md" className="mb-2">
              {t('mentorPortalBadge')}
            </Badge>
            <h1 className="text-3xl font-black text-slate-900">{t('mentorPlansTitle')}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {t('mentorPlansSubtitle')}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            className="gap-2 font-bold shrink-0 self-start sm:self-auto"
            onClick={() => setIsCreating((prev) => !prev)}
          >
            <Plus className="w-4 h-4" />
            {isCreating ? t('cancel') : t('createNewPlan')}
          </Button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Create Plan Form */}
        {isCreating && (
          <Card padding="lg" className="p-6 bg-white border-2 border-orange-200 rounded-2xl space-y-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              {t('newPlanHeading')}
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('planTitleLabel')}
                </label>
                <Input
                  type="text"
                  required
                  placeholder={t('planTitlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('descriptionLabel')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('priceAmountLabel')}
                  </label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={formData.priceAmount}
                    onChange={(e) => setFormData({ ...formData, priceAmount: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('currencyLabel')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full h-[42px] px-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="XAF">XAF (FCFA)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('sessionsPerMonthLabel')}
                  </label>
                  <Input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={formData.sessionsPerMonth}
                    onChange={(e) => setFormData({ ...formData, sessionsPerMonth: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="font-bold gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('savePlan')}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Existing Plans List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-500">{t('searching')}</p>
          </div>
        ) : plans.length === 0 ? (
          <Card padding="lg" className="p-10 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">{t('noPlansYet')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('noPlansYetDesc')}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="gap-2 font-bold"
            >
              <Plus className="w-4 h-4" />
              {t('createFirstPlan')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                padding="lg"
                className={`p-6 bg-white border rounded-2xl space-y-4 shadow-sm flex flex-col justify-between ${
                  plan.isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{plan.title}</h3>
                    <Badge variant={plan.isActive ? 'success' : 'slate'} size="sm">
                      {plan.isActive ? t('active') : t('deactivated')}
                    </Badge>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                    <span className="text-base font-black text-slate-900">
                      {plan.priceAmount.toLocaleString()} {plan.currency}
                      <span className="text-xs font-normal text-slate-500"> / mo</span>
                    </span>
                    <span>• {t('sessionsPerMonthNote', { count: plan.sessionsPerMonth })}</span>
                  </div>
                </div>

                {plan.isActive && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeactivate(plan.id)}
                      className="text-rose-600 hover:bg-rose-50 gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('deactivate')}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
