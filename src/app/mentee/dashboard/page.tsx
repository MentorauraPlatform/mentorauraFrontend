'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import type { MeResponse } from '@/lib/types';

export default function MenteeDashboardPage() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => {
        window.location.href = '/auth?mode=login';
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mentee Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome, {user.menteeProfile?.fullName || user.email}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <dl className="mt-2 space-y-2">
                <div className="flex">
                  <dt className="w-32 text-gray-600">Email:</dt>
                  <dd className="text-gray-900">{user.email}</dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-gray-600">Role:</dt>
                  <dd className="text-gray-900">{user.role}</dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-gray-600">Headline:</dt>
                  <dd className="text-gray-900">{user.menteeProfile?.headline || '-'}</dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-gray-600">Goals:</dt>
                  <dd className="text-gray-900">{user.menteeProfile?.goals || '-'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                window.location.href = '/auth?mode=login';
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
