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
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  TrendingUp,
  Award,
  Star,
  Search,
  MessageSquare,
  ChevronRight,
  SlidersHorizontal,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { marketplaceService, MentorCardData } from '@/services/marketplace.service';

export default function MenteeDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MenteeTab>('overview');

  useEffect(() => {
    if (!authLoading && user) {
      const isMentor = user.isMentor ?? (user.role === 'mentor' || user.role === 'MENTOR' || !!user.mentorProfile);
      if (isMentor) {
        router.push('/mentor/dashboard');
      }
    }
  }, [user, authLoading, router]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recommendedMentors, setRecommendedMentors] = useState<MentorCardData[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  // Sample Mentee State for rich interactive dashboard demonstration
  const [goalsList, setGoalsList] = useState([
    { id: '1', title: 'Master Next.js App Router Architecture', completed: true, targetDate: 'Sept 2026' },
    { id: '2', title: 'Prepare for Senior Frontend System Design Interviews', completed: false, targetDate: 'Oct 2026' },
    { id: '3', title: 'Refactor Mentoraura backend NestJS microservices', completed: false, targetDate: 'Nov 2026' },
  ]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'upcoming' | 'past'>('upcoming');

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
        goals: user.menteeProfile.goals || '',
      });
    }
  }, [user]);

  // Load recommended mentors for the discovery widget
  useEffect(() => {
    setLoadingMentors(true);
    marketplaceService
      .searchMentors({ limit: 3 })
      .then((res) => setRecommendedMentors(res?.items || []))
      .catch((err) => console.error('Failed to load recommended mentors', err))
      .finally(() => setLoadingMentors(false));
  }, []);

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
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">2</h2>
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
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">2</h2>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Next in 2 days
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
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">33%</h2>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      1 of 3 Completed
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Spotlight: Next Scheduled Session */}
              <div className="p-6 bg-gradient-to-br from-[#172033] to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF6B00]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        Next Live Call
                      </span>
                      <span className="text-xs text-slate-400">Wednesday, 4:00 PM GMT+1</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      Frontend Architecture & System Design Review
                    </h2>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center font-bold text-white text-sm">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">John Doe</p>
                        <p className="text-xs text-slate-400">Staff Frontend Engineer at TechCorp</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      onClick={() => toast.info('Joining video room session...')}
                      className="px-5 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
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
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0">
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
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <button
                  onClick={() => setSessionFilter('upcoming')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    sessionFilter === 'upcoming'
                      ? 'bg-[#172033] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Upcoming Sessions (2)
                </button>
                <button
                  onClick={() => setSessionFilter('past')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    sessionFilter === 'past'
                      ? 'bg-[#172033] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Completed Sessions (6)
                </button>
              </div>

              {sessionFilter === 'upcoming' ? (
                <div className="space-y-4">
                  {/* Session Card 1 */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                        <Video className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold">
                            Confirmed
                          </span>
                          <span className="text-xs text-slate-400">1-on-1 Strategy Call</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          Frontend Architecture & System Design Review
                        </h3>
                        <p className="text-xs text-slate-500">
                          Mentor: <span className="font-semibold text-slate-700">John Doe</span> (Staff Engineer at TechCorp)
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Wednesday, Sept 9, 2026 • 4:00 PM - 5:00 PM GMT+1
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => toast.info('Video room opening soon...')}
                        className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Call
                      </button>
                    </div>
                  </div>

                  {/* Session Card 2 */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        <Video className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-[11px] font-bold">
                            Scheduled
                          </span>
                          <span className="text-xs text-slate-400">Monthly Plan Check-in</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          Career Growth & Technical Roadmap 2026
                        </h3>
                        <p className="text-xs text-slate-500">
                          Mentor: <span className="font-semibold text-slate-700">Sarah Jenkins</span> (Lead PM)
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Friday, Sept 18, 2026 • 2:00 PM - 3:00 PM GMT+1
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => toast.info('Reschedule request sent!')}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-slate-900">Past Sessions History</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You have successfully completed 6 sessions with your mentors. High five on your continuous learning!
                  </p>
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
                  className="px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Mentor
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Mentor Card 1 */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-lg">
                          JD
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">John Doe</h3>
                          <p className="text-xs text-slate-500">Staff Frontend Engineer</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold">
                        Active Plan
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Plan: Pro Mentorship</span>
                        <span className="font-bold text-slate-800">$150 / mo</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Sessions Remaining:</span>
                        <span className="font-bold text-orange-600">2 of 4 calls left</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <Link
                      href="/mentors"
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition-colors"
                    >
                      Book Next Session
                    </Link>
                  </div>
                </div>

                {/* Active Mentor Card 2 */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-400 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                          SJ
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Sarah Jenkins</h3>
                          <p className="text-xs text-slate-500">Lead Product Manager</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold">
                        Active Plan
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Plan: Standard Guidance</span>
                        <span className="font-bold text-slate-800">$100 / mo</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Sessions Remaining:</span>
                        <span className="font-bold text-orange-600">1 of 2 calls left</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <Link
                      href="/mentors"
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition-colors"
                    >
                      Book Next Session
                    </Link>
                  </div>
                </div>
              </div>
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
                    className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20"
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
                    className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all"
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
