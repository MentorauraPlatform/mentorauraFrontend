'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Percent, Save, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminConfigurationPage() {
  const [platformFee, setPlatformFee] = useState('15');
  const [currency, setCurrency] = useState('XAF');
  const [autoApproveMentors, setAutoApproveMentors] = useState(false);
  const [supportEmail, setSupportEmail] = useState('support@mentoraura.com');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Platform configuration saved successfully.');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Platform Configuration & Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage system rules, marketplace commission parameters, vetting policies, and admin alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Marketplace & Financial Rules */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">Commission & Economics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Platform Service Commission (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[11px] text-slate-400">Deducted from mentor payouts automatically.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Primary Marketplace Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
              >
                <option value="XAF">Central African CFA Franc (XAF)</option>
                <option value="USD">United States Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
              <p className="text-[11px] text-slate-400">Default currency for pricing plans and settlements.</p>
            </div>
          </div>
        </Card>

        {/* Vetting & Security Policy */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Vetting & Compliance Policies</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Strict Manual Admin Vetting</span>
                <p className="text-xs text-slate-500">
                  When enabled, all mentor applicants must be approved by an Admin or Super Admin before appearing on the public directory.
                </p>
              </div>
              <Badge variant="success" size="sm">Active (Enforced)</Badge>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Auto-Approve Verified Domains</span>
                <p className="text-xs text-slate-500">
                  Allow mentors with recognized corporate partner emails to bypass manual vetting.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoApproveMentors}
                onChange={(e) => setAutoApproveMentors(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>
        </Card>

        {/* Support & Notification Alerts */}
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">System Notifications & Escalations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Platform Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-1 flex items-center justify-between pt-5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">Admin Email Alerts</span>
                <p className="text-[11px] text-slate-400">Receive emails for new mentor submissions.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={saving} className="gap-2 font-bold">
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
