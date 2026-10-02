'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi, AdminMentorApplication } from '@/lib/api/client';
import { ShieldCheck, Users, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AdminOverviewPage() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [recentApplications, setRecentApplications] = useState<AdminMentorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getMentorApplications({ status: 'SUBMITTED', limit: 5 })
      .then((res) => {
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
      })
      .catch((err) => console.error('Failed to fetch admin overview:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Administrative Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor platform metrics, manage pending mentor applications, and configure system rules.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{pendingCount}</p>
          <p className="text-xs text-slate-500 font-medium">Mentor onboarding applications awaiting vetting</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Vetting Status</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600">Active</p>
          <p className="text-xs text-slate-500 font-medium">RBAC Security and Audit Logging Active</p>
        </Card>

        <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Role</span>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">Admin</p>
          <p className="text-xs text-slate-500 font-medium">Full Vetting & User Oversight Privileges</p>
        </Card>
      </div>

      <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Applications Awaiting Vetting</h2>
          <Link href="/admin/applications">
            <Button variant="ghost" size="sm" className="gap-1 font-bold text-orange-600">
              View All Queue <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 italic">Loading applications...</p>
        ) : recentApplications.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Vetting Queue Clean</p>
            <p className="text-xs text-slate-400">All submitted mentor applications have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{app.fullName}</h3>
                  <p className="text-xs text-slate-500">{app.title} {app.company ? `@ ${app.company}` : ''}</p>
                </div>
                <Link href={`/admin/applications`}>
                  <Button variant="outline" size="sm" className="font-bold">
                    Review Profile
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
