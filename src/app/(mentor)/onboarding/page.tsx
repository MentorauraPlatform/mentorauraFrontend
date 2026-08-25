'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mentorApi, apiClient } from '@/lib/api/client';
import type { MentorProfile, Skill, SkillLevel } from '@/lib/types';

const STEPS = [
  { id: 1, title: 'Introduction', description: 'Welcome to mentor onboarding' },
  { id: 2, title: 'Professional Information', description: 'Tell us about yourself' },
  { id: 3, title: 'Skills & Expertise', description: 'What can you teach?' },
  { id: 4, title: 'Experience', description: 'Your background' },
  { id: 5, title: 'Availability', description: 'When are you available?' },
  { id: 6, title: 'Review', description: 'Review your information' },
  { id: 7, title: 'Complete', description: 'Onboarding complete' },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface OnboardingData {
  fullName: string;
  title: string;
  company: string;
  bio: string;
  experience: string;
  areasOfExpertise: string[];
  skills: Array<{ id: string; name: string; level: SkillLevel }>;
  availability: Record<string, unknown>;
}

const initialData: OnboardingData = {
  fullName: '',
  title: '',
  company: '',
  bio: '',
  experience: '',
  areasOfExpertise: [],
  skills: [],
  availability: {
    timezone: 'Africa/Douala',
    slots: [
      { day: 'MONDAY', startTime: '09:00', endTime: '12:00' },
      { day: 'WEDNESDAY', startTime: '14:00', endTime: '17:00' },
    ],
  },
};

export default function MentorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const tokenRef = useRef<string | null>(null);

  const initializeData = async (token: string) => {
    try {
      setLoading(true);
      const profileRes = await mentorApi.getMyProfile(token).catch(() => null);
      let skillsData: Skill[] = [];
      try {
        const skillsRes = await apiClient.get<Skill[]>('/skills', token);
        skillsData = skillsRes.data;
      } catch {
        // skills loading failed, use empty array
      }

      if (profileRes) {
        const existing = profileRes.data as MentorProfile;
        setProfile(existing);
        setData({
          fullName: existing.fullName || '',
          title: existing.title || '',
          company: existing.company || '',
          bio: existing.bio || '',
          experience: existing.experience || '',
          areasOfExpertise: existing.areasOfExpertise || [],
          skills: (existing.user?.userSkills || []).map((us) => ({
            id: us.skill.id,
            name: us.skill.name,
            level: us.level,
          })),
          availability: (existing.availability as Record<string, unknown>) || initialData.availability,
        });
        if (existing.onboardingStatus === 'COMPLETE' || existing.onboardingStatus === 'PENDING') {
          setCurrentStep(7);
        }
      }

      setSkills(skillsData);
    } catch {
      // ignore initialization errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    tokenRef.current = token;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initializeData(token);
  }, [router]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 7) as Step);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId || !tokenRef.current) return;
    try {
      setLoading(true);
      setError(null);
      await mentorApi.addSkill(tokenRef.current, {
        skillId: selectedSkillId,
        level: selectedLevel,
      });
      const skill = skills.find((s) => s.id === selectedSkillId);
      if (skill) {
        setData((prev) => ({
          ...prev,
          skills: [...prev.skills, { id: skill.id, name: skill.name, level: selectedLevel }],
        }));
      }
      setSelectedSkillId('');
      setSkillSearch('');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!tokenRef.current) return;
    try {
      setLoading(true);
      setError(null);
      await mentorApi.removeSkill(tokenRef.current, skillId);
      setData((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.id !== skillId),
      }));
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkillLevel = async (skillId: string, level: SkillLevel) => {
    if (!tokenRef.current) return;
    try {
      setLoading(true);
      setError(null);
      await mentorApi.updateSkill(tokenRef.current, skillId, { level });
      setData((prev) => ({
        ...prev,
        skills: prev.skills.map((s) => (s.id === skillId ? { ...s, level } : s)),
      }));
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update skill level');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async () => {
    if (!tokenRef.current) return;
    try {
      setLoading(true);
      setError(null);
      await mentorApi.updateAvailability(tokenRef.current, { availability: data.availability });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!tokenRef.current) return;
    try {
      setLoading(true);
      setError(null);
      if (!profile) {
        await mentorApi.createProfile(tokenRef.current, {
          fullName: data.fullName,
          title: data.title,
          company: data.company,
          bio: data.bio,
          experience: data.experience,
          areasOfExpertise: data.areasOfExpertise,
        });
      } else {
        await mentorApi.updateProfile(tokenRef.current, {
          title: data.title,
          company: data.company,
          bio: data.bio,
          experience: data.experience,
          areasOfExpertise: data.areasOfExpertise,
        });
      }
      await mentorApi.updateAvailability(tokenRef.current, { availability: data.availability });
      await mentorApi.submitOnboarding(tokenRef.current, { confirmed: true });
      setCurrentStep(7);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to submit onboarding');
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to MentorAura</h2>
            <p className="text-gray-600">
              Thank you for choosing to become a mentor. This onboarding process will help us
              create your mentor profile so mentees can find and book sessions with you.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">What to expect:</h3>
              <ul className="mt-2 list-disc list-inside text-blue-800 space-y-1">
                <li>Professional information</li>
                <li>Skills and expertise</li>
                <li>Experience background</li>
                <li>Availability schedule</li>
                <li>Review and submit</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => updateData({ fullName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => updateData({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
              <input
                type="text"
                value={data.company}
                onChange={(e) => updateData({ company: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={data.bio}
                onChange={(e) => updateData({ bio: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
            <p className="text-gray-600">Add skills you can mentor others in.</p>
            <div className="space-y-2">
              {data.skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={skill.level}
                      onChange={(e) => handleUpdateSkillLevel(skill.id, e.target.value as SkillLevel)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {data.skills.length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet.</p>
              )}
            </div>
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Add a Skill</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search skills..."
                />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button
                  onClick={handleAddSkill}
                  disabled={!selectedSkillId}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {filteredSkills.length > 0 && skillSearch && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                        selectedSkillId === skill.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Experience</label>
              <textarea
                value={data.experience}
                onChange={(e) => updateData({ experience: e.target.value })}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your professional experience, achievements, and background..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
              <input
                type="text"
                value={data.areasOfExpertise.join(', ')}
                onChange={(e) =>
                  updateData({
                    areasOfExpertise: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Software Engineering, Leadership, Career Growth (comma separated)"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Availability</h2>
            <p className="text-gray-600">Specify when you are available for mentorship sessions.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <input
                type="text"
                value={data.availability.timezone as string}
                onChange={(e) =>
                  updateData({
                    availability: { ...data.availability, timezone: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots</label>
              {Array.isArray(data.availability.slots) && (
                <div className="space-y-2">
                  {(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).map(
                    (slot, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={slot.day}
                          onChange={(e) => {
                            const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                            newSlots[index] = { ...newSlots[index], day: e.target.value };
                            updateData({ availability: { ...data.availability, slots: newSlots } });
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="MONDAY">Monday</option>
                          <option value="TUESDAY">Tuesday</option>
                          <option value="WEDNESDAY">Wednesday</option>
                          <option value="THURSDAY">Thursday</option>
                          <option value="FRIDAY">Friday</option>
                          <option value="SATURDAY">Saturday</option>
                          <option value="SUNDAY">Sunday</option>
                        </select>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                            newSlots[index] = { ...newSlots[index], startTime: e.target.value };
                            updateData({ availability: { ...data.availability, slots: newSlots } });
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => {
                            const newSlots = [...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>)];
                            newSlots[index] = { ...newSlots[index], endTime: e.target.value };
                            updateData({ availability: { ...data.availability, slots: newSlots } });
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <button
                          onClick={() => {
                            const newSlots = (data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>).filter((_, i) => i !== index);
                            updateData({ availability: { ...data.availability, slots: newSlots } });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
              <button
                onClick={() => {
                  const newSlots = [
                    ...(data.availability.slots as Array<{ day: string; startTime: string; endTime: string }>),
                    { day: 'MONDAY', startTime: '09:00', endTime: '12:00' },
                  ];
                  updateData({ availability: { ...data.availability, slots: newSlots } });
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add time slot
              </button>
            </div>
            <button
              onClick={handleUpdateAvailability}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Save Availability
            </button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Professional Information</h3>
                <dl className="mt-2 space-y-1">
                  <div className="flex"><dt className="w-32 text-gray-600">Full Name:</dt><dd className="text-gray-900">{data.fullName || '-'}</dd></div>
                  <div className="flex"><dt className="w-32 text-gray-600">Title:</dt><dd className="text-gray-900">{data.title || '-'}</dd></div>
                  <div className="flex"><dt className="w-32 text-gray-600">Company:</dt><dd className="text-gray-900">{data.company || '-'}</dd></div>
                  <div className="flex"><dt className="w-32 text-gray-600">Bio:</dt><dd className="text-gray-900">{data.bio || '-'}</dd></div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Experience</h3>
                <p className="text-gray-900 mt-1">{data.experience || '-'}</p>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Areas of Expertise:</span> {data.areasOfExpertise.join(', ') || '-'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Skills</h3>
                {data.skills.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.skills.map((skill) => (
                      <span key={skill.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills added</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Availability</h3>
                <pre className="mt-1 text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                  {JSON.stringify(data.availability, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900">Onboarding Complete!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your mentor profile has been submitted for review. You will be notified once it is approved.
              In the meantime, you can access your mentor dashboard.
            </p>
            <a
              href="/mentor/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Go to Mentor Dashboard
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.filter((s) => s.id <= 6).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.id}
                  </div>
                  {index < 5 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {renderStep()}

          {currentStep < 7 && currentStep !== 1 && (
            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
              {currentStep === 6 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Onboarding'}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
