'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  isMentor: boolean;
  isActive: boolean;
  createdAt: string;
  menteeProfile?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    headline?: string;
    goals?: string[];
    interests?: string[];
  } | null;
  mentorProfile?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    title?: string;
    company?: string;
    bio?: string;
    isVerified?: boolean;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch current user details via authService (reads HttpOnly Cookie)
  const fetchMe = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setUser(null);
      } else {
        console.error('Failed to fetch user session:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      router.push('/auth?mode=login');
    }
  }, [router]);

  // Initial load effect
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Refetch helper
  const refetchUser = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refetchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
