'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MenteeSidebar, MenteeTab } from '@/components/mentee/MenteeSidebar';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { LoadingState } from '@/components/ui/LoadingState';
  
import {
  Calendar,
  Clock,
  Video,
  Users,
  Target,
  Plus,
  Star,
  ChevronRight,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { marketplaceService, MentorCardData } from '@/services/marketplace.service';
import { schedulingApi } from '@/lib/api/client';
import { menteeApi, mentorshipsApi } from '@/lib/api/client';
import type { Mentorship } from '@/lib/types';

export default function MenteeDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MenteeTab>('overview');


  useEffect(() => {
    if (!authLoading && user) {
      const userRole = String(user.role ?? '').trim().toLowerCase();
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin');
        return;
      }
      const isMentor = user.isMentor ?? (user.role === 'mentor' || user.role === 'MENTOR' || !!user.mentorProfile);
      if (isMentor) {
        router.push('/mentor/dashboard');
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
            targetDate: '',
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
  const completedGoalsCount = goalsList.filter((g) => g.completed).length;
   const goalProgressPercent = goalsList.length > 0 ? Math.round((completedGoalsCount / goalsList.length) * 100) : 0;

  const sortedUpcoming = (bookings as { id: string; scheduledAt: string; status: string; meetingLink?: string; mentorship?: { plan?: { title?: string }; mentor?: { fullName?: string } } }[])
    .filter((b) => b.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const nextBooking = sortedUpcoming[0];
  const nextBookingTime = nextBooking
    ? new Date(nextBooking.scheduledAt).toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })
    : '';
  const nextBookingMentorName = nextBooking?.mentorship?.mentor?.fullName ?? '';
  const nextBookingInitials = nextBookingMentorName
    ? nextBookingMentorName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  if (authLoading) {
    return <LoadingState message="Loading your Mentee Hub..." />;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth?mode=login';
    }
    return null;
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    setGoalsList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newGoalInput.trim(),
        completed: false,
        targetDate: 'Dec 2026',
      },
    ]);
    setNewGoalInput('');
    toast.success('New learning goal added!');
  };

  const toggleGoal = (id: string) => {
    setGoalsList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const tabTitles: Record<MenteeTab, string> = {
    overview: 'Mentee Dashboard',
    sessions: 'My Mentorship Sessions',
    mentors: 'My Subscribed Mentors',
    goals: 'Learning Goals & Growth',
    settings: 'Profile & Preferences',
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Active Mentors
                    </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">{activeMentorsCount}</h2>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Active Subscriptions
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Upcoming Sessions
                    </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">{upcomingSessionsCount}</h2>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {upcomingSessionsCount > 0 ? 'Scheduled' : 'None scheduled'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Hours Learned
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">14.5 hrs</h2>
                    <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      +3.5 hrs this month
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Goal Progress
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">{goalProgressPercent}%</h2>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {completedGoalsCount} of {goalsList.length} Completed
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
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                                               Next Live Call
                      </span>
                      <span className="text-xs text-slate-400">{nextBooking ? nextBookingTime : 'No upcoming calls'}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      {nextBooking ? (nextBooking.mentorship?.plan?.title ?? 'Mentorship Session') : 'No session scheduled yet'}
                    </h2>

                    {nextBooking && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center font-bold text-white text-sm">
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
                      onClick={() => nextBooking?.meetingLink ? window.open(nextBooking.meetingLink, '_blank') : toast.info('No meeting link yet')}
                      disabled={!nextBooking}
                      className="px-5 py-3 bg-[#FF6B00] text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </button>
                    <button
                      onClick={() => setActiveTab('sessions')}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl border border-white/10 transition-colors text-center"
                    >
                      View Details
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
                      <h3 className="text-lg font-bold text-[#172033]">Top Recommended Mentors</h3>
                      <p className="text-xs text-slate-500">Handpicked mentors based on your career interests</p>
                    </div>
                    <Link
                      href="/mentors"
                      className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                    >
                      Explore All <ChevronRight className="w-4 h-4" />
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
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{mentor.avgRating || '5.0'}</span>
                            <span className="text-slate-400 font-normal">({mentor.reviewCount})</span>
                          </div>

                          <Link
                            href={`/mentors/${mentor.slug || mentor.id}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            View Profile
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
                      <Target className="w-4 h-4 text-orange-500" />
                      Active Milestones
                    </h3>
                    <button
                      onClick={() => setActiveTab('goals')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="space-y-3">
                    {goalsList.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={g.completed}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <p
                            className={`text-xs font-medium ${
                              g.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {g.title}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Target: {g.targetDate}
                          </span>
                        </div>
                      </div>
                    ))}
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
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    sessionFilter === 'upcoming'
                      ? 'bg-[#172033] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Upcoming Sessions
                </button>
                <button
                  onClick={() => setSessionFilter('past')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    sessionFilter === 'past'
                      ? 'bg-[#172033] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Past Sessions
                </button>
              </div>

              {loadingBookings ? (
                <div className="text-sm text-gray-600">Loading bookings...</div>
              ) : (
                <div className="space-y-4">
                  {bookings.length === 0 && <p className="text-sm text-gray-600">No bookings yet.</p>}
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
                            <p className="text-sm font-bold text-gray-900">{booking.mentorship?.plan?.title || 'Session'}</p>
                            <p className="text-xs text-gray-500">Mentor: {booking.mentorship?.mentor?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{new Date(booking.scheduledAt).toLocaleString()} â€¢ {booking.durationMinutes} min</p>
                            {booking.cancellationReason && <p className="text-xs text-red-600 mt-1">Reason: {booking.cancellationReason}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                            }`}>{booking.status}</span>
                            {booking.status === 'SCHEDULED' && booking.meetingLink && (
                              <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-orange-600 text-xs font-bold hover:underline">Join</a>
                            )}
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
                  <h2 className="text-lg font-bold text-[#172033]">Active Subscriptions</h2>
                  <p className="text-xs text-slate-500">Your current mentors and monthly plan allowances</p>
                </div>
                <Link
                  href="/mentors"
                  className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Mentor
                </Link>
              </div>

                 {mentorships.length === 0 ? (
                <p className="text-sm text-slate-500">No active mentors yet.</p>
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
                                <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-lg">
                                  {initials}
                                </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{mentorName}</h3>
                                <p className="text-xs text-slate-500">{mentorship.mentor?.title || ''}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold">
                              {mentorship.status}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-500">Plan: {mentorship.plan?.title || 'N/A'}</span>
                              <span className="font-bold text-slate-800">
                                {mentorship.plan?.priceAmount != null ? `${mentorship.plan.currency ?? ''} ${mentorship.plan.priceAmount}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <Link
                              href="/mentee/dashboard/bookings/new"
                              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition-colors"
                            >
                              Book Next Session
                            </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEARNING GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#172033]">Learning Goals & Roadmap</h2>
                  <p className="text-xs text-slate-500">Track your skill development and milestones</p>
                </div>

                {/* Form to add goal */}
                <form onSubmit={handleAddGoal} className="flex gap-3">
                  <input
                    type="text"
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    placeholder="Add a new career goal (e.g. Master Docker deployment)..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00] text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Add Goal
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
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => {}}
                          className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              goal.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {goal.title}
                          </p>
                          <span className="text-xs text-slate-400">Target Date: {goal.targetDate}</span>
                        </div>
                      </div>

                      {goal.completed && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">
                          Achieved
                        </span>
                      )}
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
                <h2 className="text-lg font-bold text-[#172033]">Mentee Profile Settings</h2>
                <p className="text-xs text-slate-500">Update your account information and preferences</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editProfile.fullName}
                    onChange={(e) => setEditProfile({ ...editProfile, fullName: e.target.value })}
                    placeholder="Enter your full name..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline / Role</label>
                  <input
                    type="text"
                    value={editProfile.headline}
                    onChange={(e) => setEditProfile({ ...editProfile, headline: e.target.value })}
                    placeholder="e.g. Junior Frontend Developer / Career Switcher"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Career Goals Summary</label>
                  <textarea
                    rows={3}
                    value={editProfile.goals}
                    onChange={(e) => setEditProfile({ ...editProfile, goals: e.target.value })}
                    placeholder="Describe what you want to achieve with mentorship..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => toast.success('Profile preferences updated!')}
                    className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

