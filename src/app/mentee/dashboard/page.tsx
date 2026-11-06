'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MenteeSidebar, MenteeTab } from '@/components/mentee/MenteeSidebar';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { useTranslations } from 'next-intl';
  
import {
  Calendar,
  Clock,
  Video,
  Users,
  Target,
  Plus,
  Star,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { marketplaceService, MentorCardData } from '@/services/marketplace.service';
import { schedulingApi } from '@/lib/api/client';
import { menteeApi, mentorshipsApi } from '@/lib/api/client';
import { messagingApi } from '@/lib/api/messaging';
import { ChatView } from '@/components/messaging/ChatView';
import { DisputeModal } from '@/components/modals/DisputeModal';
import type { Mentorship } from '@/lib/types';

export default function MenteeDashboardPage() {
  const router = useRouter();
  const t = useTranslations('menteeDashboard');
  const tCommon = useTranslations('common');
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MenteeTab>('overview');
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
      const userRole = String(user.role ?? '').trim().toLowerCase();
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Redirect mentees to onboarding if their profile is missing or incomplete
  useEffect(() => {
    if (
      !authLoading &&
      user &&
      !user.isMentor &&
      (!user.menteeProfile || !user.menteeProfile.onboardingCompleted)
    ) {
      router.push('/mentee/onboarding');
    }
  }, [user, authLoading, router]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recommendedMentors, setRecommendedMentors] = useState<MentorCardData[]>([]);
  const [goalsList, setGoalsList] = useState<{ id: string; title: string; completed: boolean; targetDate: string }[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<unknown[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState<{ bookingId?: string; mentorshipId?: string; label?: string } | null>(null);

  // Edit Mentee Profile State
  const [editProfile, setEditProfile] = useState({
    fullName: '',
    headline: '',
    goals: '',
  });

  useEffect(() => {
    if (user?.menteeProfile) {
      setEditProfile({
        fullName: user.menteeProfile.fullName || '',
        headline: user.menteeProfile.headline || '',
        goals: (user.menteeProfile.goals ?? []).join(', '),
      });
    }
  }, [user]);

  // Load recommended mentors for the discovery widget
  useEffect(() => {
    marketplaceService
      .searchMentors({ limit: 3 })
      .then((res) => setRecommendedMentors(res?.items || []))
      .catch((err) => console.error('Failed to load recommended mentors', err));
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        setLoadingBookings(true);
        const bookingsRes = await schedulingApi.getMyBookings();
        setBookings((bookingsRes.data as unknown[]) ?? []);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }

      try {
        const profileRes = await menteeApi.getMyProfile();
        const goals = profileRes.data.goals ?? [];

        setGoalsList(
          goals.map((goal, index) => ({
            id: String(index),
            title: goal,
            completed: false,
            targetDate: 'Ongoing',
          }))
        );
      } catch (error) {
        console.error('Failed to load mentee goals:', error);
        setGoalsList([]);
      }

      try {
        const mentorshipsRes = await mentorshipsApi.getMenteeMentorships();
        setMentorships(mentorshipsRes.data ?? []);
      } catch (error) {
        console.error('Failed to load mentorships:', error);
        setMentorships([]);
      }
    };

    void loadDashboardData();
  }, [user]);

  const activeMentorsCount = mentorships.filter((m) => (m as { status?: string }).status === 'ACTIVE').length;
  const upcomingSessionsCount = (bookings as { status: string }[]).filter((b) => b.status === 'SCHEDULED').length;
  const completedBookingsList = (bookings as { status: string; durationMinutes?: number }[]).filter(
    (b) => b.status === 'COMPLETED'
  );
  const hoursLearned = (
    completedBookingsList.reduce((acc, b) => acc + (Number(b.durationMinutes) || 60), 0) / 60
  ).toFixed(1);
  const completedGoalsCount = goalsList.filter((g) => g.completed).length;
  const goalProgressPercent = goalsList.length > 0 ? Math.round((completedGoalsCount / goalsList.length) * 100) : 0;

  const sortedUpcoming = (bookings as { id: string; scheduledAt: string; status: string; meetingLink?: string; mentorship?: { plan?: { title?: string }; mentor?: { fullName?: string } } }[])
    .filter((b) => b.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const nextBooking = sortedUpcoming[0];
  const nextBookingTime = nextBooking
    ? new Date(nextBooking.scheduledAt).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })
    : '';
  const nextBookingMentorName = nextBooking?.mentorship?.mentor?.fullName ?? '';
  const nextBookingInitials = nextBookingMentorName
    ? nextBookingMentorName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  if (authLoading) {
    return <LoadingState message={t('loadingHub')} />;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth?mode=login';
    }
    return null;
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    const nextGoals = [
      ...goalsList,
      {
        id: Date.now().toString(),
        title: newGoalInput.trim(),
        completed: false,
        targetDate: 'Ongoing',
      },
    ];
    setGoalsList(nextGoals);
    setNewGoalInput('');
    try {
      await menteeApi.updateGoals({ goals: nextGoals.map((g) => g.title) });
      toast.success(t('goalSavedToast'));
    } catch {
      toast.error(t('goalSaveError'));
    }
  };

  const toggleGoal = (id: string) => {
    setGoalsList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleSaveSettings = async () => {
    try {
      await menteeApi.updateProfile({
        fullName: editProfile.fullName || undefined,
        headline: editProfile.headline || undefined,
      });
      const parsedGoals = editProfile.goals
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
      if (parsedGoals.length > 0) {
        await menteeApi.updateGoals({ goals: parsedGoals });
        setGoalsList(
          parsedGoals.map((goal, idx) => ({
            id: String(idx),
            title: goal,
            completed: false,
            targetDate: 'Ongoing',
          })),
        );
      }
      toast.success(t('profileUpdatedToast'));
    } catch {
      toast.error(t('profileUpdateError'));
    }
  };

  const tabTitles: Record<MenteeTab, string> = {
    overview: t('tabOverview'),
    sessions: t('tabSessions'),
    mentors: t('tabMentors'),
    messages: t('tabMessages'),
    goals: t('tabGoals'),
    settings: t('tabSettings'),
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans antialiased text-[#172033]">
      {/* Responsive Sidebar Component */}
      <MenteeSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        {/* Top Header Bar */}
        <MenteeHeader
          user={user}
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTabTitle={tabTitles[activeTab]}
        />

        {/* Dashboard Content Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('activeMentors')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">{activeMentorsCount}</h2>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('activeSubscriptions')}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('upcomingSessions')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">{upcomingSessionsCount}</h2>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {upcomingSessionsCount > 0 ? t('scheduled') : t('noneScheduled')}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('hoursLearned')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">{hoursLearned} {t('hrsUnit')}</h2>
                    <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('completedSessionsCount', { count: completedBookingsList.length })}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('goalProgress')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">{goalProgressPercent}%</h2>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('completedOf', { completed: completedGoalsCount, total: goalsList.length })}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Spotlight: Next Scheduled Session */}
              <div className="p-6 bg-[#172033] text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
                        {t('nextLiveCall')}
                      </span>
                      <span className="text-xs text-slate-400">{nextBooking ? nextBookingTime : t('noUpcomingCalls')}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      {nextBooking ? (nextBooking.mentorship?.plan?.title ?? t('mentorshipSession')) : t('noSessionScheduled')}
                    </h2>

                    {nextBooking && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center font-bold text-white text-sm shrink-0">
                          {nextBookingInitials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{nextBookingMentorName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      onClick={() => nextBooking?.meetingLink ? window.open(nextBooking.meetingLink, '_blank') : toast.info(t('noMeetingLink'))}
                      disabled={!nextBooking}
                      className="px-5 py-3 bg-[#FF6B00] text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Video className="w-4 h-4 shrink-0" />
                      <span>{t('joinMeeting')}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('sessions')}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl border border-white/10 transition-colors text-center inline-flex items-center justify-center whitespace-nowrap"
                    >
                      <span>{t('viewDetails')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Recommended Mentors & Quick Goals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 columns: Recommended Top Mentors */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#172033]">{t('topRecommendedMentors')}</h3>
                      <p className="text-xs text-slate-500">{t('recommendedSubtitle')}</p>
                    </div>
                    <Link
                      href="/mentors"
                      className="text-xs font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>{t('exploreAllMentors')}</span> <ChevronRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendedMentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#172033] text-white flex items-center justify-center font-bold text-base shrink-0">
                            {mentor.fullName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                              {mentor.fullName}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1">{mentor.title}</p>
                            {mentor.company && (
                              <p className="text-[11px] font-medium text-slate-400">{mentor.company}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs whitespace-nowrap">
                            <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                            <span>{mentor.avgRating || '5.0'}</span>
                            <span className="text-slate-400 font-normal">({mentor.reviewCount})</span>
                          </div>

                          <Link
                            href={`/mentors/${mentor.slug || mentor.id}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center whitespace-nowrap"
                          >
                            <span>{t('viewProfile')}</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column: Quick Learning Goals Widget */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{t('quickGoals')}</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('goals')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                    >
                      {t('manageAll')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {goalsList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">{t('noGoalsYet')}</p>
                    ) : (
                      goalsList.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => toggleGoal(g.id)}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={g.completed}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                g.completed ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {g.title}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <button
                  onClick={() => setSessionFilter('upcoming')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap inline-flex items-center ${
                    sessionFilter === 'upcoming'
                      ? 'bg-[#172033] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t('upcomingTab')}
                </button>
                <button
                  onClick={() => setSessionFilter('past')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap inline-flex items-center ${
                    sessionFilter === 'past'
                      ? 'bg-[#172033] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t('pastTab')}
                </button>
              </div>

              {loadingBookings ? (
                <div className="text-sm text-gray-600 py-8 text-center">{tCommon('loading')}</div>
              ) : (
                <div className="space-y-4">
                  {bookings.filter((b: unknown) => {
                    const booking = b as { status: string };
                    if (sessionFilter === 'upcoming') return booking.status === 'SCHEDULED';
                    return booking.status !== 'SCHEDULED';
                  }).length === 0 && (
                    <p className="text-sm text-gray-500 py-8 text-center">
                      {sessionFilter === 'upcoming' ? t('noUpcomingSessions') : t('noPastSessions')}
                    </p>
                  )}
                  {bookings
                    .filter((b: unknown) => {
                      const booking = b as { status: string };
                      if (sessionFilter === 'upcoming') return booking.status === 'SCHEDULED';
                      return booking.status !== 'SCHEDULED';
                    })
                    .map((b: unknown) => {
                      const booking = b as {
                        id: string;
                        scheduledAt: string;
                        durationMinutes: number;
                        status: string;
                        meetingLink?: string;
                        cancellationReason?: string;
                        mentorship?: { plan?: { title?: string }; mentor?: { fullName?: string } };
                      };
                      return (
                        <div key={booking.id} className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{booking.mentorship?.plan?.title || t('mentorshipSession')}</p>
                            <p className="text-xs text-gray-500">{t('mentorFallback')}: {booking.mentorship?.mentor?.fullName || 'Mentor'}</p>
                            <p className="text-xs text-gray-500">{new Date(booking.scheduledAt).toLocaleString()} • {t('minUnit', { count: booking.durationMinutes })}</p>
                            {booking.cancellationReason && <p className="text-xs text-red-600 mt-1">{booking.cancellationReason}</p>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              booking.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                            }`}>{booking.status}</span>
                            {booking.status === 'SCHEDULED' && booking.meetingLink && (
                              <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-orange-600 text-xs font-bold hover:underline whitespace-nowrap inline-flex items-center gap-1">
                                <Video className="w-3.5 h-3.5 shrink-0" /> {t('joinMeeting')}
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setDisputeTarget({
                                  bookingId: booking.id,
                                  label: `Session on ${new Date(booking.scheduledAt).toLocaleDateString()}`,
                                })
                              }
                              className="text-red-600 text-xs font-bold hover:underline whitespace-nowrap"
                            >
                              {t('reportIssue')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY MENTORS */}
          {activeTab === 'mentors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#172033]">{t('activeSubscribedMentors')}</h2>
                  <p className="text-xs text-slate-500">{t('activeSubscribedMentorsSub')}</p>
                </div>
                <Link
                  href="/mentors"
                  className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>{t('findMentors')}</span>
                </Link>
              </div>

              {mentorships.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                  <p className="text-sm text-slate-500">{t('noActiveMentorships')}</p>
                  <Link
                    href="/mentors"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
                  >
                    {t('exploreMentors')}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentorships.map((m) => {
                    const mentorship = m as unknown as { id: string; status: string; mentor?: { fullName?: string; title?: string }; plan?: { title?: string; priceAmount?: number; currency?: string } };
                    const mentorName = mentorship.mentor?.fullName || 'Mentor';
                    const initials = mentorName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
                    return (
                      <div key={mentorship.id} className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-lg shrink-0">
                                {initials}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{mentorName}</h3>
                                <p className="text-xs text-slate-500">{mentorship.mentor?.title || ''}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold whitespace-nowrap">
                              {mentorship.status}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-500">{t('monthlyPlanLabel')} {mentorship.plan?.title || 'N/A'}</span>
                              <span className="font-bold text-slate-800">
                                {mentorship.plan?.priceAmount != null ? `${mentorship.plan.currency ?? ''} ${mentorship.plan.priceAmount}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={async () => {
                              try {
                                await messagingApi.getOrCreateForMentorship(m.id);
                                setActiveTab('messages');
                              } catch {
                                setActiveTab('messages');
                              }
                            }}
                            className="flex-1 py-2.5 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] font-bold text-xs rounded-xl text-center transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span>{t('messageMentor')}</span>
                          </button>
                          <Link
                            href="/mentee/dashboard/bookings/new"
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition-colors inline-flex items-center justify-center whitespace-nowrap"
                          >
                            <span>{t('bookNewSession')}</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: REAL-TIME MESSAGING */}
          {activeTab === 'messages' && user && (
            <div className="space-y-4">
              <ChatView currentUserId={user.id} userRole="MENTEE" />
            </div>
          )}

          {/* TAB 4: LEARNING GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#172033]">{t('goalsPageTitle')}</h2>
                  <p className="text-xs text-slate-500">{t('goalsPageSub')}</p>
                </div>

                {/* Form to add goal */}
                <form onSubmit={handleAddGoal} className="flex gap-3">
                  <input
                    type="text"
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    placeholder={t('goalInputPlaceholder')}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center justify-center whitespace-nowrap shrink-0"
                  >
                    <span>{t('addGoalBtn')}</span>
                  </button>
                </form>

                {/* Goals Checklist */}
                <div className="space-y-3 pt-2">
                  {goalsList.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        goal.completed
                          ? 'bg-slate-50/60 border-slate-200/80 opacity-75'
                          : 'bg-white border-slate-200 shadow-xs hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => {}}
                          className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500 shrink-0"
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              goal.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {goal.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS / PROFILE */}
          {activeTab === 'settings' && (
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#172033]">{t('settingsPageTitle')}</h2>
                <p className="text-xs text-slate-500">{t('settingsPageSub')}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('fullNameLabel')}</label>
                  <input
                    type="text"
                    value={editProfile.fullName}
                    onChange={(e) => setEditProfile({ ...editProfile, fullName: e.target.value })}
                    placeholder={t('fullNameLabel')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('headlineLabel')}</label>
                  <input
                    type="text"
                    value={editProfile.headline}
                    onChange={(e) => setEditProfile({ ...editProfile, headline: e.target.value })}
                    placeholder={t('headlineLabel')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('careerGoalsLabel')}</label>
                  <textarea
                    rows={3}
                    value={editProfile.goals}
                    onChange={(e) => setEditProfile({ ...editProfile, goals: e.target.value })}
                    placeholder={t('careerGoalsLabel')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center justify-center whitespace-nowrap"
                  >
                    <span>{t('savePreferencesBtn')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <DisputeModal
        isOpen={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        bookingId={disputeTarget?.bookingId}
        mentorshipId={disputeTarget?.mentorshipId}
        contextLabel={disputeTarget?.label}
      />
    </div>
  );
}
