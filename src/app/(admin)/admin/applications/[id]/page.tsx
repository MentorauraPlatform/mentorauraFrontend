'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { adminApi, AdminMentorApplication } from '@/lib/api/client';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Briefcase,
  Award,
  FileText,
  FileCheck2,
  AlertTriangle,
  Loader2,
  Building,
  User,
  Globe,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MentorApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const [application, setApplication] = useState<AdminMentorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDetail = () => {
    setLoading(true);
    adminApi
      .getMentorApplicationDetail(applicationId)
      .then((res) => {
        const detail =
          (res.data as any)?.data && typeof (res.data as any).data === 'object'
            ? (res.data as any).data
            : res.data;
        setApplication(detail as AdminMentorApplication);
      })
      .catch((err) => {
        console.error('Failed to load application details:', err);
        toast.error('Failed to load mentor application details');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [applicationId]);

  const handleApprove = async () => {
    if (!application) return;
    setActionLoading(true);
    try {
      await adminApi.approveMentorApplication(application.id);
      toast.success('Mentor application approved and published to the marketplace!');
      fetchDetail();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve application';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!application) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.rejectMentorApplication(application.id, rejectionReason.trim());
      toast.success('Mentor application rejected.');
      setRejectionModalOpen(false);
      fetchDetail();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject application';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Application Review...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
        <Card padding="lg" className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Application Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">This mentor profile may have been removed or does not exist.</p>
        </Card>
      </div>
    );
  }

  const isApproved = application.isVerified && application.onboardingStatus === 'COMPLETE';
  const isRejected = application.onboardingStatus === 'REJECTED';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Vetting Queue
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Review: {application.fullName}
            </h1>
            <Badge
              variant={
                isApproved ? 'success' : isRejected ? 'error' : 'orange'
              }
              size="md"
              className="capitalize"
            >
              {application.onboardingStatus.toLowerCase()}
            </Badge>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            size="md"
            disabled={actionLoading || isRejected}
            onClick={() => setRejectionModalOpen(true)}
            className="gap-2 font-bold"
          >
            <XCircle className="w-4 h-4" /> Reject Profile
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={actionLoading || isApproved}
            onClick={handleApprove}
            className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve & Publish Mentor
          </Button>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Summary & Proof */}
        <div className="space-y-6 lg:col-span-1">
          {/* Mentor Profile Overview Card */}
          <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5">
            <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-slate-100">
              <Avatar name={application.fullName} size="xl" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">{application.fullName}</h2>
                <p className="text-xs font-semibold text-slate-500">{application.title}</p>
                {application.company && (
                  <p className="text-xs text-orange-600 font-medium flex items-center justify-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5" /> {application.company}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Registered Email:</span>
                <span className="font-bold text-slate-800">{application.user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Years of Experience:</span>
                <span className="font-bold text-slate-800">
                  {application.yearsOfExperience ? `${application.yearsOfExperience}+ Years` : 'Self-Reported'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Verification Status:</span>
                <span className={`font-bold ${application.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {application.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Application Date:</span>
                <span className="font-bold text-slate-800">
                  {new Date(application.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Professional Links */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Professional Proof & Links
              </span>
              <div className="flex flex-col gap-2">
                {application.linkedinUrl ? (
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-100/70 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" /> LinkedIn Profile
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400 italic">
                    No LinkedIn link provided
                  </div>
                )}

                {application.githubUrl ? (
                  <a
                    href={application.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-slate-800" /> GitHub Profile
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400 italic">
                    No GitHub link provided
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Rejection notice if previously rejected */}
          {application.rejectionReason && (
            <Card padding="md" className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Recorded Rejection Reason
              </span>
              <p className="text-xs text-rose-700 whitespace-pre-line leading-relaxed">
                {application.rejectionReason}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Detailed Claims, Bio, Experience, Documents */}
        <div className="space-y-6 lg:col-span-2">
          {/* Biography & Professional Statement */}
          <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" /> Professional Bio & Headline
            </h3>
            {application.headline && (
              <p className="font-semibold text-xs text-slate-700 italic border-l-2 border-orange-500 pl-3 py-1 bg-orange-50/50 rounded-r-lg">
                &ldquo;{application.headline}&rdquo;
              </p>
            )}
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {application.bio || 'No detailed biography submitted.'}
            </p>
          </Card>

          {/* Professional Experience & Career History */}
          <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-500" /> Career History & Experience Claims
            </h3>
            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {application.experience || 'No experience summary submitted.'}
            </div>
          </Card>

          {/* Skills & Expertise */}
          <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" /> Skills & Domain Claims
            </h3>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Self-Reported Platform Skills
              </span>
              {application.user?.userSkills && application.user.userSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {application.user.userSkills.map((us) => (
                    <div
                      key={us.id}
                      className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2"
                    >
                      <span className="text-xs font-bold text-slate-800">{us.skill.name}</span>
                      <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100/60 px-1.5 py-0.5 rounded">
                        {us.level}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No platform skills attached.</p>
              )}
            </div>

            {application.areasOfExpertise && application.areasOfExpertise.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Areas of Expertise / Topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {application.areasOfExpertise.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-100"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Identity & Verification Documents */}
          <Card padding="lg" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-orange-500" /> Identity Proof & Documents
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" /> Government ID / Passport
                  </span>
                  {application.idDocumentUrl ? (
                    <Badge variant="success" size="sm">Attached</Badge>
                  ) : (
                    <Badge variant="slate" size="sm">None</Badge>
                  )}
                </div>
                {application.idDocumentUrl ? (
                  <a
                    href={application.idDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 pt-1"
                  >
                    View Document <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No government ID upload provided.</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" /> Resume / CV Attachment
                  </span>
                  {application.cvUrl ? (
                    <Badge variant="success" size="sm">Attached</Badge>
                  ) : (
                    <Badge variant="slate" size="sm">None</Badge>
                  )}
                </div>
                {application.cvUrl ? (
                  <a
                    href={application.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 pt-1"
                  >
                    View Resume / CV <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No curriculum vitae attached.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Reject Mentor Application</h3>
            <p className="text-xs text-slate-500">
              Please enter the specific reason for rejecting <span className="font-bold text-slate-800">{application.fullName}</span>. This feedback will be sent directly to the applicant and recorded in platform audit logs.
            </p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please provide a verified LinkedIn profile link or additional proof of senior engineering experience..."
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
