'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Percent,
  Save,
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { adminApi, PlatformCategory, PlatformSettingItem } from '@/lib/api/admin';

export default function AdminConfigurationPage() {
  const t = useTranslations('admin.configuration');
  const [settings, setSettings] = useState<Record<string, string>>({
    global_commission_rate: '15',
    min_payout_amount: '10000',
    auto_cancel_hours: '24',
    dispute_grace_period_days: '7',
    support_email: 'support@mentoraura.com',
    terms_url: 'https://mentoraura.com/terms',
    privacy_url: 'https://mentoraura.com/privacy',
  });
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PlatformCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, catRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getCategories(),
      ]);

      const sData = settingsRes.data || (settingsRes as any);
      const newSettings: Record<string, string> = {};
      const newDesc: Record<string, string> = {};

      if (sData) {
        for (const [k, v] of Object.entries(sData as Record<string, PlatformSettingItem>)) {
          newSettings[k] = v.value;
          newDesc[k] = v.description;
        }
        setSettings((prev) => ({ ...prev, ...newSettings }));
        setDescriptions(newDesc);
      }

      const cData = catRes.data || (catRes as any);
      setCategories(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error('Failed to load configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await adminApi.updateSettings(settings);
      showToast('success', res.message || t('settingsSaved'));
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update platform settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Category Actions
  const handleOpenCategoryModal = (cat?: PlatformCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryDescription(cat.description || '');
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDescription('');
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert('Please provide a category name');
      return;
    }

    try {
      setCategoryLoading(true);
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
        });
        showToast('success', `Category '${categoryName}' updated successfully`);
      } else {
        await adminApi.createCategory({
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
        });
        showToast('success', `Category '${categoryName}' created successfully`);
      }
      setCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: PlatformCategory) => {
    if (cat.mentorCount > 0) {
      alert(`Cannot delete '${cat.name}' because it has ${cat.mentorCount} active mentor(s) assigned.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete category '${cat.name}'?`)) return;

    try {
      await adminApi.deleteCategory(cat.id);
      showToast('success', `Category '${cat.name}' deleted`);
      fetchData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="w-full space-y-8 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('pageTitle')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('pageSubtitle')}
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Marketplace Economics */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="w-5 h-5 text-orange-600 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('commissionSectionTitle')}</h2>
              <p className="text-xs text-slate-500">{t('commissionRateHelp')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('commissionRateLabel')}</label>
              <div className="relative">
                <input
                  type="number"
                  id="global-commission-input"
                  min="0"
                  max="50"
                  value={settings.global_commission_rate || '15'}
                  onChange={(e) => handleSettingChange('global_commission_rate', e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {descriptions.global_commission_rate || t('commissionRateHelp')}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{t('minPayoutLabel')}</label>
              <div className="relative">
                <input
                  type="number"
                  id="min-payout-input"
                  min="1000"
                  step="1000"
                  value={settings.min_payout_amount || '10000'}
                  onChange={(e) => handleSettingChange('min_payout_amount', e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">XAF</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {descriptions.min_payout_amount || t('subtitle')}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Auto-Cancellation Window (Hours)</label>
              <input
                type="number"
                id="auto-cancel-hours-input"
                min="1"
                max="72"
                value={settings.auto_cancel_hours || '24'}
                onChange={(e) => handleSettingChange('auto_cancel_hours', e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
              <p className="text-[11px] text-slate-400">Hours before session start after which cancellations are penalized.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Dispute Claim Grace Window (Days)</label>
              <input
                type="number"
                id="dispute-grace-days-input"
                min="1"
                max="30"
                value={settings.dispute_grace_period_days || '7'}
                onChange={(e) => handleSettingChange('dispute_grace_period_days', e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
              <p className="text-[11px] text-slate-400">Number of days after session conclusion to submit a refund claim.</p>
            </div>
          </div>
        </Card>

        {/* Platform Legal & Policies */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('title')}</h2>
              <p className="text-xs text-slate-500">{t('subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Support / Escalation Email</label>
              <input
                type="email"
                id="support-email-input"
                value={settings.support_email || 'support@mentoraura.com'}
                onChange={(e) => handleSettingChange('support_email', e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Terms of Service URL</label>
              <input
                type="url"
                id="terms-url-input"
                value={settings.terms_url || ''}
                onChange={(e) => handleSettingChange('terms_url', e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Privacy Policy URL</label>
              <input
                type="url"
                id="privacy-url-input"
                value={settings.privacy_url || ''}
                onChange={(e) => handleSettingChange('privacy_url', e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            id="save-platform-settings-btn"
            type="submit"
            variant="primary"
            size="md"
            isLoading={savingSettings}
            className="bg-[#F97316] hover:bg-[#ea580c] text-white flex items-center gap-2 font-bold shadow-sm whitespace-nowrap flex-nowrap shrink-0"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{t('saveConfigBtn')}</span>
          </Button>
        </div>
      </form>

      {/* Supported Categories Management */}
      <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('categoriesSectionTitle')}</h2>
              <p className="text-xs text-slate-500">{t('subtitle')}</p>
            </div>
          </div>
          <Button
            id="create-category-btn"
            size="sm"
            variant="primary"
            onClick={() => handleOpenCategoryModal()}
            className="bg-[#172033] hover:bg-slate-800 text-white flex items-center gap-2 whitespace-nowrap flex-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{t('addCategoryBtn')}</span>
          </Button>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="admin-categories-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Category Name</th>
                <th className="py-2.5 px-3">Slug</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Active Mentors</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{cat.slug}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full font-bold text-[11px] whitespace-nowrap flex-nowrap shrink-0">
                        {cat.mentorCount} mentor{cat.mentorCount === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          id={`edit-category-${cat.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="text-xs py-1 px-2.5 h-auto rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 whitespace-nowrap flex-nowrap shrink-0"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          id={`delete-category-${cat.id}`}
                          size="sm"
                          variant="outline"
                          disabled={cat.mentorCount > 0}
                          onClick={() => handleDeleteCategory(cat)}
                          className={`text-xs py-1 px-2.5 h-auto rounded-lg whitespace-nowrap flex-nowrap shrink-0 ${
                            cat.mentorCount > 0
                              ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                              : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {t('newCategoryPlaceholder')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Category Create/Edit Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card padding="lg" className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCategory ? 'Edit Mentor Category' : 'Create New Mentor Category'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="category-name-input"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder={t('categoryNamePlaceholder')}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  id="category-description-input"
                  rows={3}
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Brief summary of skills and mentors covered by this category..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCategoryModalOpen(false)}
                className="whitespace-nowrap flex-nowrap shrink-0"
              >
                Cancel
              </Button>
              <Button
                id="submit-category-btn"
                variant="primary"
                size="sm"
                onClick={handleSaveCategory}
                disabled={categoryLoading || !categoryName.trim()}
                className="bg-[#F97316] hover:bg-[#ea580c] text-white whitespace-nowrap flex-nowrap shrink-0"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
