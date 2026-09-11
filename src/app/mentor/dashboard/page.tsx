'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mentorApi, apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { MentorProfile, Skill, SkillLevel } from '@/lib/types';
import { MentorSidebar, MentorTab } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  Calendar,
  Clock,
  Video,
  Users,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  Star,
  Save,
  Globe,
  Package,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  User,
} from 'lucide-react';

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
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MentorTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const [profileRes, skillsRes] = await Promise.all([
        mentorApi.getMyProfile(),
        apiClient.get<Skill[]>('/mentor/applications/skills').catch(() => ({ data: [] })),
      ]);

      setProfile(profileRes.data);
      setSkillsList(skillsRes.data || []);

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
      setError('Failed to load mentor profile.');
    } finally {
      setLoading(false);
    }
  }, []);

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
      toast.success('Mentor profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
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
      toast.success('Skill added successfully!');
      setSelectedSkillId('');
      void fetchProfileAndSkills();
    } catch (err) {
      toast.error('Failed to add skill.');
    } finally {
      setSavingSkill(false);
    }
  };

  // Handle Remove Skill
  const handleRemoveSkill = async (skillId: string) => {
    try {
      await mentorApi.removeSkill(skillId);
      toast.success('Skill removed.');
      void fetchProfileAndSkills();
    } catch (err) {
      toast.error('Failed to remove skill.');
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
      toast.success('Availability schedule saved!');
    } catch (err) {
      toast.error('Failed to save availability.');
    } finally {
      setSavingAvailability(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState message="Loading Mentor Portal..." />;
  }

  const tabTitles: Record<MentorTab, string> = {
    overview: 'Mentor Dashboard',
    profile: 'Profile & Bio Settings',
    skills: 'Skills & Technical Expertise',
    availability: 'Weekly Availability Schedule',
    plans: 'Mentorship Plans & Packages',
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans antialiased text-[#172033]">
      {/* Responsive Desktop & Mobile Sidebar */}
      <MentorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        profile={profile}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        <MentorHeader
          user={user}
          profile={profile}
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTabTitle={tabTitles[activeTab]}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Monthly Earnings
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">$450</h2>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      +15% vs last month
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Active Mentees
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">4 Mentees</h2>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      2 Pro Plans, 2 Standard
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Completed Calls
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">18 Calls</h2>
                    <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      22.5 total hours
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Video className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Average Rating
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-[#172033]">5.0</h2>
                      <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Based on 12 reviews
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Next Scheduled Call Hero Spotlight */}
              <div className="p-6 bg-gradient-to-br from-[#172033] to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF6B00]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        Next Upcoming Call
                      </span>
                      <span className="text-xs text-slate-400">Tomorrow, 3:00 PM GMT+1</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      System Architecture & Code Review Session
                    </h2>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        AS
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Alex Smith</p>
                        <p className="text-xs text-slate-400">Mentee • Pro Mentorship Plan</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      onClick={() => toast.info('Video room opening...')}
                      className="px-5 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF852D] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Start Meeting
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
                      <h3 className="text-lg font-bold text-[#172033]">Your Active Mentees</h3>
                      <p className="text-xs text-slate-500">Mentees subscribed to your 1-on-1 mentorship plans</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            AS
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">Alex Smith</h4>
                            <p className="text-xs text-slate-500">Frontend Engineer</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                          Active
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between text-slate-600">
                        <span>Plan: Pro Mentorship</span>
                        <span className="font-bold text-orange-600">2 calls left</span>
                      </div>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            MK
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">Marie Keller</h4>
                            <p className="text-xs text-slate-500">Product Designer</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                          Active
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between text-slate-600">
                        <span>Plan: Standard Growth</span>
                        <span className="font-bold text-orange-600">1 call left</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Availability & Pricing Checklist */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Profile Optimizations
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Weekly Availability</span>
                      <button
                        onClick={() => setActiveTab('availability')}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Set Slots
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Mentorship Plans</span>
                      <Link href="/mentor/plans" className="text-orange-600 font-bold hover:underline">
                        Manage Plans
                      </Link>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Tagged Skills</span>
                      <button
                        onClick={() => setActiveTab('skills')}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Add Skills
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
                <h2 className="text-lg font-bold text-[#172033]">Public Mentor Profile</h2>
                <p className="text-xs text-slate-500">This information will be visible to mentees on the directory.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Professional Title</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={editData.company}
                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                    placeholder="e.g. TechCorp / Google / Stripe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biography</label>
                  <textarea
                    rows={4}
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Share your background, achievements, and mentorship style..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience Summary</label>
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
                    className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#172033]">Skills & Expertise</h2>
                <p className="text-xs text-slate-500">Manage technical skills displayed on your mentor card</p>
              </div>

              {/* Add Skill Form */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-xs text-slate-800">Add New Skill</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="">Select a skill...</option>
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
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>

                  <button
                    onClick={handleAddSkill}
                    disabled={!selectedSkillId || savingSkill}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Active User Skills */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-800">Tagged Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.user?.userSkills?.map((us) => (
                    <div
                      key={us.id}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-2"
                    >
                      <span>{us.skill.name}</span>
                      <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-bold">
                        {us.level}
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(us.skillId || us.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
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
                <h2 className="text-lg font-bold text-[#172033]">Weekly Availability Schedule</h2>
                <p className="text-xs text-slate-500">Configure your recurring 1-on-1 meeting timeslots</p>
              </div>

              {/* Timezone Selector */}
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-bold text-slate-700">Timezone:</label>
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
                          className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Slot
                        </button>
                      </div>

                      {daySlots.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No available timeslots set</p>
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
                                <span className="text-xs text-slate-400">to</span>
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
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingAvailability ? 'Saving Schedule...' : 'Save Availability Schedule'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PLANS */}
          {activeTab === 'plans' && (
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 max-w-xl mx-auto">
              <Package className="w-12 h-12 text-orange-500 mx-auto" />
              <h2 className="text-xl font-bold text-[#172033]">Mentorship Pricing Plans</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure your monthly recurring packages, session allowances, and pricing structure for mentees.
              </p>
              <Link
                href="/mentor/plans"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B00] hover:bg-[#FF852D] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all"
              >
                Go to Plans Manager
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}