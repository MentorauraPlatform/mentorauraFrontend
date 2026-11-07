'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { mentorApi, apiClient, schedulingApi, mentorshipsApi, applicationsApi, adminApi } from '@/lib/api/client';
import type { MentorPayoutBalance } from '@/lib/api/admin';
import { toast } from 'sonner';
import type { MentorProfile, Skill, SkillLevel, Mentorship, MentorshipApplication } from '@/lib/types';
import { messagingApi } from '@/lib/api/messaging';
import { ChatView } from '@/components/messaging/ChatView';
import { DisputeModal } from '@/components/modals/DisputeModal';
import { MentorSidebar, MentorTab } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  Clock,
  Video,
  Users,
  Plus,
  Trash2,
  Sparkles,
  DollarSign,
  Star,
  Save,
  Globe,
  Package,
  ChevronRight,
} from 'lucide-react';

function MentorBookingsSection() {
  const t = useTranslations('mentorSubpages');
  const [bookings, setBookings] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeBooking, setDisputeBooking] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const res = await schedulingApi.getMentorBookings();
        setBookings((res.data as unknown[]) ?? []);
      } catch {
        toast.error(t('cancelBookingFailedToast'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const handleCancel = async (id: string) => {
    const reason = prompt(t('cancelReasonPrompt')) || undefined;
    try {
      await schedulingApi.cancelBooking(id, reason);
      setBookings((prev) => prev.filter((b: unknown) => (b as { id: string }).id !== id));
      toast.success(t('bookingCancelledToast'));
    } catch {
      toast.error(t('cancelBookingFailedToast'));
    }
  };

  if (loading) return <div className="text-sm text-gray-600">{t('bookingsLoading')}</div>;

  return (
    <div className="space-y-4">
      {bookings.length === 0 && <p className="text-sm text-gray-600">{t('noBookingsYet')}</p>}
      {bookings.map((b: unknown) => {
        const booking = b as {
          id: string;
          scheduledAt: string;
          durationMinutes: number;
          status: string;
          meetingLink?: string;
          cancellationReason?: string;
          mentee?: { email?: string };
          mentorship?: { plan?: { title?: string } };
        };
        return (
          <div key={booking.id} className="p-5 bg-white rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">{booking.mentorship?.plan?.title || t('planFallback')}</p>
              <p className="text-xs text-gray-500">{t('menteeLabel', { email: booking.mentee?.email || t('menteeFallback') })}</p>
              <p className="text-xs text-gray-500">{new Date(booking.scheduledAt).toLocaleString()} • {booking.durationMinutes} min</p>
              {booking.cancellationReason && (
                <p className="text-xs text-red-600 mt-1">{t('cancellationReason', { reason: booking.cancellationReason })}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-nowrap shrink-0 ${
                booking.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
              }`}>{booking.status}</span>
              {booking.status === 'SCHEDULED' && booking.meetingLink && (
                <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-orange-600 text-xs font-bold hover:underline whitespace-nowrap flex-nowrap shrink-0">
                  {t('joinBtn')}
                </a>
              )}
              {booking.status === 'SCHEDULED' && (
                <button onClick={() => handleCancel(booking.id)} className="text-red-600 text-xs font-bold hover:underline whitespace-nowrap flex-nowrap shrink-0">
                  {t('cancelBtn')}
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setDisputeBooking({
                    id: booking.id,
                    label: t('sessionWithLabel', {
                      email: booking.mentee?.email || t('menteeFallback'),
                      date: new Date(booking.scheduledAt).toLocaleDateString(),
                    }),
                  })
                }
                className="text-slate-500 hover:text-red-600 text-xs font-bold hover:underline whitespace-nowrap flex-nowrap shrink-0"
              >
                {t('reportIssueBtn')}
              </button>
            </div>
          </div>
        );
      })}
      <DisputeModal
        isOpen={Boolean(disputeBooking)}
        onClose={() => setDisputeBooking(null)}
        bookingId={disputeBooking?.id}
        contextLabel={disputeBooking?.label}
      />
    </div>
  );
}

type AvailabilityDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

type AvailabilitySlot = {
  day: AvailabilityDay;
  startTime: string;
  endTime: string;
};

type Availability = {
  timezone: string;
  slots: AvailabilitySlot[];
};

export default function MentorDashboardPage() {
  const router = useRouter();
  const t = useTranslations('mentorDashboard');
  const tSub = useTranslations('mentorSubpages');
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MentorTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      messagingApi
        .getUnreadCount()
        .then((res) => {
          setUnreadMessagesCount(res.data?.unreadCount ?? 0);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      const isMentor = user.isMentor ?? (user.role === 'mentor' || user.role === 'MENTOR' || !!user.mentorProfile);
      if (!isMentor) {
        router.push('/mentee/dashboard');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as MentorTab;
      if (tabParam && ['overview', 'profile', 'skills', 'availability', 'plans', 'bookings', 'messages'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab: MentorTab) => {
    if (tab === 'mentees') {
      router.push('/mentor/mentees');
    } else {
      setActiveTab(tab);
    }
  };

  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Profile Edit State
  const [editData, setEditData] = useState({
    title: '',
    company: '',
    bio: '',
    experience: '',
    areasOfExpertise: [] as string[],
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Skills State
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const [savingSkill, setSavingSkill] = useState(false);

  // Availability State
  const [availability, setAvailability] = useState<Availability>({
    timezone: 'Africa/Douala',
    slots: [],
  });
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Live Overview Data State
  const [mentorMentorships, setMentorMentorships] = useState<Mentorship[]>([]);
  const [mentorApplications, setMentorApplications] = useState<MentorshipApplication[]>([]);
  const [mentorBookings, setMentorBookings] = useState<unknown[]>([]);
  const [payoutBalance, setPayoutBalance] = useState<MentorPayoutBalance | null>(null);
  const [requestingPayout, setRequestingPayout] = useState(false);

  const DAYS: AvailabilityDay[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  const fetchProfileAndSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, skillsRes, mentorshipsRes, appsRes, bookingsRes, balanceRes] = await Promise.all([
        mentorApi.getMyProfile(),
        apiClient.get<Skill[]>('/mentor/applications/skills').catch(() => ({ data: [] })),
        mentorshipsApi.getMentorMentorships().catch(() => ({ data: [] as Mentorship[] })),
        applicationsApi.getMentorApplications().catch(() => ({ data: [] as MentorshipApplication[] })),
        schedulingApi.getMentorBookings().catch(() => ({ data: [] as unknown[] })),
        adminApi.getMentorPayoutBalance().catch(() => ({ data: null as MentorPayoutBalance | null })),
      ]);

      setProfile(profileRes.data);
      setSkillsList(skillsRes.data || []);
      setMentorMentorships(mentorshipsRes.data || []);
      setMentorApplications(appsRes.data || []);
      setMentorBookings((bookingsRes.data as unknown[]) || []);
      setPayoutBalance(balanceRes.data || null);

      setEditData({
        title: profileRes.data.title || '',
        company: profileRes.data.company || '',
        bio: profileRes.data.bio || '',
        experience: profileRes.data.experience || '',
        areasOfExpertise: profileRes.data.areasOfExpertise || [],
      });

      const rawAvailability = profileRes.data.availability as
        | { timezone?: string; slots?: Array<{ day?: string; startTime?: string; endTime?: string }> }
        | null
        | undefined;

      setAvailability({
        timezone: rawAvailability?.timezone || 'Africa/Douala',
        slots: (rawAvailability?.slots || []).map((slot) => ({
          day: (slot.day as AvailabilityDay) || 'MONDAY',
          startTime: slot.startTime || '09:00',
          endTime: slot.endTime || '17:00',
        })),
      });
    } catch (err) {
      console.error('Failed to load mentor profile', err);
      setError(t('profileSaveError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (typeof window !== 'undefined') window.location.href = '/auth?mode=login';
      return;
    }

    const isUserMentor = Boolean(
      (user as unknown as { isMentor?: boolean }).isMentor ||
        user.role === 'mentor' ||
        user.role === 'MENTOR'
    );

    if (!isUserMentor) {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }

    void fetchProfileAndSkills();
  }, [authLoading, user, fetchProfileAndSkills]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await mentorApi.updateProfile(editData);
      setProfile(updated.data);
      toast.success(t('profileSavedSuccess'));
    } catch {
      toast.error(t('profileSaveError'));
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Add Skill
  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    setSavingSkill(true);
    try {
      await mentorApi.addSkill({ skillId: selectedSkillId, level: selectedLevel });
      toast.success(t('taggedSkills'));
      setSelectedSkillId('');
      void fetchProfileAndSkills();
    } catch {
      toast.error(t('skillAddError'));
    } finally {
      setSavingSkill(false);
    }
  };

  // Handle Remove Skill
  const handleRemoveSkill = async (skillId: string) => {
    try {
      await mentorApi.removeSkill(skillId);
      toast.success(t('taggedSkills'));
      void fetchProfileAndSkills();
    } catch {
      toast.error(t('skillRemoveError'));
    }
  };

  // Availability Helpers
  const handleAddSlot = (day: AvailabilityDay) => {
    setAvailability((prev) => ({
      ...prev,
      slots: [...prev.slots, { day, startTime: '09:00', endTime: '17:00' }],
    }));
  };

  const handleRemoveSlot = (index: number) => {
    setAvailability((prev) => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index),
    }));
  };

  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    try {
      const updated = await mentorApi.updateAvailability({ availability });
      setProfile(updated.data);
      toast.success(t('availabilitySavedSuccess'));
    } catch {
      toast.error(t('availabilitySaveError'));
    } finally {
      setSavingAvailability(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState message={t('loadingWorkspace')} />;
  }

  const activeMentorMentorships = mentorMentorships.filter((m) => m.status === 'ACTIVE');
  const pendingAppsCount = mentorApplications.filter((a) => a.status === 'PENDING').length;
  const typedBookings = mentorBookings as Array<{
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
    meetingLink?: string;
    mentee?: { email?: string; menteeProfile?: { fullName?: string } };
    mentorship?: { plan?: { title?: string } };
  }>;
  const completedBookings = typedBookings.filter((b) => b.status === 'COMPLETED');
  const totalHoursHeld = (
    completedBookings.reduce((acc, b) => acc + (Number(b.durationMinutes) || 60), 0) / 60
  ).toFixed(1);
  const upcomingBookings = typedBookings
    .filter((b) => b.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const nextUpcomingCall = upcomingBookings[0];

  const handleRequestPayout = async () => {
    const amountStr = prompt(
      t('payoutPromptAmount', {
        currency: payoutBalance?.currency || 'XAF',
        available: payoutBalance?.availableBalance ?? 0,
      }),
    );
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t('invalidPayoutAmount'));
      return;
    }
    const provider = prompt(t('payoutPromptProvider'), 'MTN_MOMO');
    if (!provider) return;
    const accountNumber = prompt(t('payoutPromptAccount'));
    if (!accountNumber) return;
    try {
      setRequestingPayout(true);
      await apiClient.post('/payouts/request', { amount, provider, accountNumber });
      toast.success(t('payoutSubmittedSuccess'));
      void fetchProfileAndSkills();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      toast.error(apiErr.message || t('payoutRequestError'));
    } finally {
      setRequestingPayout(false);
    }
  };

  const tabTitles: Record<MentorTab, string> = {
    overview: t('tabOverview'),
    profile: t('tabProfile'),
    skills: t('tabSkills'),
    availability: t('tabAvailability'),
    plans: t('tabPlans'),
    bookings: t('tabBookings'),
    messages: t('tabMessages'),
    mentees: tSub('menteesTitle') || 'Mentees',
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans antialiased text-[#172033]">
      {/* Responsive Desktop & Mobile Sidebar */}
      <MentorSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        profile={profile}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        <MentorHeader
          user={user}
          profile={profile}
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTabTitle={tabTitles[activeTab]}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('availableBalance')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">
                      {payoutBalance
                        ? `${payoutBalance.availableBalance.toLocaleString()} ${payoutBalance.currency}`
                        : '0 XAF'}
                    </h2>
                    <button
                      onClick={handleRequestPayout}
                      disabled={requestingPayout || !payoutBalance || payoutBalance.availableBalance <= 0}
                      className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md mt-1 inline-block disabled:opacity-50 whitespace-nowrap flex-nowrap shrink-0"
                    >
                      {requestingPayout ? t('requestingBtn') : t('requestPayoutBtn')}
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <DollarSign className="w-6 h-6 shrink-0" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('activeMentees')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">
                      {activeMentorMentorships.length} {t('menteeFallback')}
                    </h2>
                    <Link
                      href="/mentor/mentees"
                      className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block hover:underline whitespace-nowrap flex-nowrap shrink-0"
                    >
                      {pendingAppsCount > 0 ? `${pendingAppsCount} ${tSub('filterPending', { count: pendingAppsCount })}` : tSub('menteesSubtitle')}
                    </Link>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Users className="w-6 h-6 shrink-0" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('completedCalls')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">
                      {completedBookings.length}
                    </h2>
                    <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block whitespace-nowrap flex-nowrap shrink-0">
                      {t('totalHours', { hours: totalHoursHeld })}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                    <Video className="w-6 h-6 shrink-0" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('averageRating')}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-[#172033]">
                        {profile?.avgRating ? Number(profile.avgRating).toFixed(1) : '5.0'}
                      </h2>
                      <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block whitespace-nowrap flex-nowrap shrink-0">
                      {t('menteesServed', { count: profile?.totalMenteesServed ?? activeMentorMentorships.length })}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Star className="w-6 h-6 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Next Scheduled Call Hero Spotlight */}
              <div className="p-6 bg-[#172033] text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap flex-nowrap shrink-0">
                        <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
                        <span>{t('nextUpcomingCall')}</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {nextUpcomingCall
                          ? new Date(nextUpcomingCall.scheduledAt).toLocaleString()
                          : t('noUpcomingCalls')}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      {nextUpcomingCall
                        ? nextUpcomingCall.mentorship?.plan?.title || t('planFallback')
                        : t('noUpcomingSession')}
                    </h2>

                    {nextUpcomingCall && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center font-bold text-white text-sm shrink-0">
                          {(nextUpcomingCall.mentee?.menteeProfile?.fullName || nextUpcomingCall.mentee?.email || 'M')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {nextUpcomingCall.mentee?.menteeProfile?.fullName || nextUpcomingCall.mentee?.email || t('menteeFallback')}
                          </p>
                          <p className="text-xs text-slate-400">
                            {t('menteeFallback')} • {nextUpcomingCall.durationMinutes} min
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      onClick={() =>
                        nextUpcomingCall?.meetingLink
                          ? window.open(nextUpcomingCall.meetingLink, '_blank')
                          : setActiveTab('bookings')
                      }
                      className="px-5 py-3 bg-[#FF6B00] text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-nowrap shrink-0"
                    >
                      <Video className="w-4 h-4 shrink-0" />
                      <span>{nextUpcomingCall?.meetingLink ? t('startMeeting') : t('viewCalendar')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Active Mentees & Quick Setup */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 columns: Active Mentees List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#172033]">{t('yourActiveMentees')}</h3>
                      <p className="text-xs text-slate-500">{t('activeMenteesSub')}</p>
                    </div>
                    <Link href="/mentor/mentees" className="text-xs font-bold text-orange-600 hover:underline whitespace-nowrap flex-nowrap shrink-0">
                      {t('viewAll', { count: mentorMentorships.length })}
                    </Link>
                  </div>

                  {activeMentorMentorships.length === 0 ? (
                    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
                      {t('noActiveMenteesPrompt')}{' '}
                      <Link href="/mentor/mentees" className="text-orange-600 font-bold hover:underline">
                        {t('applicationsQueueLink')}
                      </Link>{' '}
                      {t('toReviewRequests')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeMentorMentorships.slice(0, 4).map((m) => {
                        const menteeLabel = m.mentee?.email || t('menteeFallback');
                        const initials = menteeLabel.slice(0, 2).toUpperCase();
                        return (
                          <div key={m.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm truncate max-w-[160px]">{menteeLabel}</h4>
                                  <p className="text-xs text-slate-500">{t('menteeFallback')}</p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold whitespace-nowrap flex-nowrap shrink-0">
                                {m.status}
                              </span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between text-slate-600">
                              <span>{t('planLabel')} {m.plan?.title || t('planFallback')}</span>
                              <Link href="/mentor/mentees" className="font-bold text-orange-600 hover:underline whitespace-nowrap flex-nowrap shrink-0">
                                {t('managePlans')}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right column: Availability & Pricing Checklist */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{t('profileOptimizations')}</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{t('weeklyAvailability')}</span>
                      <button
                        onClick={() => setActiveTab('availability')}
                        className="text-orange-600 font-bold hover:underline whitespace-nowrap flex-nowrap shrink-0"
                      >
                        {t('setSlots')}
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{t('mentorshipPlans')}</span>
                      <Link href="/mentor/plans" className="text-orange-600 font-bold hover:underline whitespace-nowrap flex-nowrap shrink-0">
                        {t('managePlans')}
                      </Link>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{t('taggedSkills')}</span>
                      <button
                        onClick={() => setActiveTab('skills')}
                        className="text-orange-600 font-bold hover:underline whitespace-nowrap flex-nowrap shrink-0"
                      >
                        {t('addSkills')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & BIO */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#172033]">{t('publicMentorProfile')}</h2>
                <p className="text-xs text-slate-500">{t('publicProfileDesc')}</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('professionalTitleLabel')}</label>
                  <input
                    type="text"
                    required
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="e.g. Senior Staff Engineer / Head of Product"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('companyLabel')}</label>
                  <input
                    type="text"
                    value={editData.company}
                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                    placeholder="e.g. TechCorp / Google / Stripe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('bioLabel')}</label>
                  <textarea
                    rows={4}
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Share your background, achievements, and mentorship style..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('experienceSummary')}</label>
                  <input
                    type="text"
                    value={editData.experience}
                    onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                    placeholder="e.g. 10+ years leading engineering teams..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap flex-nowrap shrink-0"
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span>{savingProfile ? t('savingProfile') : t('saveProfileChangesBtn')}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#172033]">{t('skillsHeading')}</h2>
                <p className="text-xs text-slate-500">{t('skillsSubheading')}</p>
              </div>

              {/* Add Skill Form */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-xs text-slate-800">{t('addNewSkill')}</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="">{t('selectSkillPlaceholder')}</option>
                    {skillsList.map((sk) => (
                      <option key={sk.id} value={sk.id}>
                        {sk.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="BEGINNER">{t('skillLevelBeginner')}</option>
                    <option value="INTERMEDIATE">{t('skillLevelIntermediate')}</option>
                    <option value="ADVANCED">{t('skillLevelAdvanced')}</option>
                    <option value="EXPERT">{t('skillLevelExpert')}</option>
                  </select>

                  <button
                    onClick={handleAddSkill}
                    disabled={!selectedSkillId || savingSkill}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 whitespace-nowrap flex-nowrap shrink-0"
                  >
                    {savingSkill ? t('addingSkill') : t('addSkill')}
                  </button>
                </div>
              </div>

              {/* Active User Skills */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-800">{t('taggedSkills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.user?.userSkills?.map((us) => (
                    <div
                      key={us.id}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-2 whitespace-nowrap flex-nowrap shrink-0"
                    >
                      <span>{us.skill.name}</span>
                      <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-bold">
                        {us.level}
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(us.skillId || us.skill?.id || us.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AVAILABILITY */}
          {activeTab === 'availability' && (
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#172033]">{t('availabilityHeading')}</h2>
                <p className="text-xs text-slate-500">{t('availabilitySubheading')}</p>
              </div>

              {/* Timezone Selector */}
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <label className="text-xs font-bold text-slate-700">{t('timezoneLabel')}</label>
                <select
                  value={availability.timezone}
                  onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Africa/Douala">Africa/Douala (GMT+1)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="Europe/London">Europe/London (GMT+1)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                </select>
              </div>

              {/* Days Availability Builder */}
              <div className="space-y-4">
                {DAYS.map((day) => {
                  const daySlots = availability.slots.filter((s) => s.day === day);
                  return (
                    <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{day}</span>
                        <button
                          onClick={() => handleAddSlot(day)}
                          className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 whitespace-nowrap flex-nowrap shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 shrink-0" /> <span>{t('addSlot')}</span>
                        </button>
                      </div>

                      {daySlots.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">{t('noSlotsSet')}</p>
                      ) : (
                        <div className="space-y-2">
                          {daySlots.map((slot, index) => {
                            const globalIndex = availability.slots.findIndex((s) => s === slot);
                            return (
                              <div key={index} className="flex items-center gap-3">
                                <input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => {
                                    const updated = [...availability.slots];
                                    updated[globalIndex].startTime = e.target.value;
                                    setAvailability({ ...availability, slots: updated });
                                  }}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                />
                                <span className="text-xs text-slate-400">{t('to')}</span>
                                <input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => {
                                    const updated = [...availability.slots];
                                    updated[globalIndex].endTime = e.target.value;
                                    setAvailability({ ...availability, slots: updated });
                                  }}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                />
                                <button
                                  onClick={() => handleRemoveSlot(globalIndex)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveAvailability}
                  disabled={savingAvailability}
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap flex-nowrap shrink-0"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>{savingAvailability ? t('savingSchedule') : t('saveSchedule')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PLANS */}
          {activeTab === 'plans' && (
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 max-w-xl mx-auto">
              <Package className="w-12 h-12 text-orange-500 mx-auto shrink-0" />
              <h2 className="text-xl font-bold text-[#172033]">{t('plansHeading')}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('plansSubheading')}
              </p>
              <Link
                href="/mentor/plans"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap flex-nowrap shrink-0"
              >
                <span>{t('goToPlansManager')}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          )}
          {/* TAB 6: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#172033]">{t('calendarSessionsHeading')}</h2>
              <MentorBookingsSection />
            </div>
          )}

          {/* TAB 7: MESSAGES */}
          {activeTab === 'messages' && user && (
            <div className="space-y-4">
              <ChatView currentUserId={user.id} userRole="MENTOR" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
