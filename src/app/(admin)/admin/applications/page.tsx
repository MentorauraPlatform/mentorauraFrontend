'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { adminApi, AdminMentorApplication } from '@/lib/api/client';
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Briefcase,
  AlertCircle,
  FileText,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

type VettingTab = 'SUBMITTED' | 'COMPLETE' | 'REJECTED' | 'ALL';

export default function AdminMentorApplicationsPage() {
  const [activeTab, setActiveTab] = useState<VettingTab>('SUBMITTED');
  const [search, setSearch] = useState<string>('');
  const [applications, setApplications] = useState<AdminMentorApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApp, setSelectedApp] = useState<AdminMentorApplication | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchApplications = () => {
    setLoading(true);
    const statusParam = activeTab === 'ALL' ? undefined : activeTab;
    adminApi
      .getMentorApplications({ status: statusParam, q: search })
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
        setApplications(list);
      })
      .catch((err) => {
        console.error('Failed to load applications:', err);
        toast.error('Failed to load mentor applications');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await adminApi.approveMentorApplication(id);
      toast.success('Mentor application approved and published to marketplace!');
      setSelectedApp(null);
      fetchApplications();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve application';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      toast.error('Please enter a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.rejectMentorApplication(selectedApp.id, rejectionReason);
      toast.success('Mentor application rejected.');
      setRejectionModalOpen(false);
      setSelectedApp(null);
      setRejectionReason('');
      fetchApplications();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject application';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Mentor Application Vetting Workspace
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review onboarding details, verify professional credentials, and approve or reject mentor applications.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('SUBMITTED')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'SUBMITTED'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab('COMPLETE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'COMPLETE'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Mentors
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'REJECTED'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected Submissions
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Submissions
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-10 pr-3 h-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow transition-all flex items-center justify-center shrink-0 active:scale-[0.98]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Vetting Queue...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card padding="lg" className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Mentor Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no mentor onboarding submissions matching this filter.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <Card
              key={app.id}
              padding="lg"
              className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={app.fullName} size="md" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{app.fullName}</h3>
                      <p className="text-xs text-slate-500 truncate">{app.user?.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      app.onboardingStatus === 'COMPLETE'
                        ? 'success'
                        : app.onboardingStatus === 'REJECTED'
                        ? 'error'
                        : 'orange'
                    }
                    size="sm"
                    className="capitalize"
                  >
                    {app.onboardingStatus.toLowerCase()}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="font-semibold flex items-center gap-1 text-slate-800">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{app.title}</span>
                    {app.company && <span>@ {app.company}</span>}
                  </p>
                  {app.experience && (
                    <p className="line-clamp-2 text-slate-500 text-[11px] pt-1">
                      {app.experience}
                    </p>
                  )}
                </div>

                {app.user?.userSkills && app.user.userSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {app.user.userSkills.slice(0, 3).map((us) => (
                      <Badge key={us.id} variant="slate" size="sm" className="text-[10px]">
                        {us.skill.name} ({us.level.toLowerCase()})
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5 mt-auto">
                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Quick View</span>
                </button>
                <Link href={`/admin/applications/${app.id}`} className="flex-1">
                  <button
                    type="button"
                    className={`w-full inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98] group ${
                      app.onboardingStatus === 'COMPLETE'
                        ? 'bg-slate-900 hover:bg-slate-800 hover:shadow-md shadow-slate-900/10'
                        : app.onboardingStatus === 'REJECTED'
                        ? 'bg-slate-700 hover:bg-slate-800'
                        : 'bg-[#F97316] hover:bg-[#EA580C] shadow-xs hover:shadow'
                    }`}
                  >
                    <span>
                      {app.onboardingStatus === 'COMPLETE'
                        ? 'Review Profile'
                        : app.onboardingStatus === 'REJECTED'
                        ? 'View Details'
                        : 'Review Application'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Mentor Application Inspection Drawer/Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <Avatar name={selectedApp.fullName} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedApp.fullName}</h2>
                  <p className="text-xs text-slate-500">{selectedApp.user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Role & Title</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedApp.title}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Company</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedApp.company || 'N/A'}</span>
                </div>
              </div>

              {selectedApp.bio && (
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                    Professional Biography
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedApp.bio}
                  </p>
                </div>
              )}

              {selectedApp.experience && (
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                    Background & Experience Claims
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedApp.experience}
                  </p>
                </div>
              )}

              {selectedApp.areasOfExpertise.length > 0 && (
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                    Areas of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.areasOfExpertise.map((area, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              {selectedApp.onboardingStatus === 'COMPLETE' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  >
                    Close Preview
                  </button>
                  <Link href={`/admin/applications/${selectedApp.id}`}>
                    <button
                      type="button"
                      className="h-10 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Full Profile</span>
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    variant="danger"
                    size="md"
                    isLoading={actionLoading}
                    onClick={() => setRejectionModalOpen(true)}
                    className="gap-1.5 font-semibold text-xs rounded-xl shadow-xs"
                  >
                    <XCircle className="w-4 h-4" /> Reject Submission
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={actionLoading}
                    onClick={() => handleApprove(selectedApp.id)}
                    className="gap-1.5 font-semibold text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Publish Mentor
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Reject Mentor Application</h3>
            <p className="text-xs text-slate-500">
              Please specify the reason for rejecting <span className="font-bold text-slate-800">{selectedApp.fullName}</span>. This feedback will be logged in audit history and emailed to the applicant.
            </p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete proof of experience or generic profile details..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectionModalOpen(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={actionLoading}
                onClick={handleRejectSubmit}
                className="font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
