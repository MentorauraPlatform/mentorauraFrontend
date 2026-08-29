'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  ChevronDown,
  Compass,
  Briefcase,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const tNav = useTranslations('nav');
  const tCat = useTranslations('categories');
  const { user, isAuthenticated, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userDisplayName =
    user?.menteeProfile?.fullName || user?.mentorProfile?.fullName || 'User';
  const userAvatarUrl =
    user?.menteeProfile?.avatarUrl || user?.mentorProfile?.avatarUrl || null;

  // Extract first name from full name
  const getFirstName = (fullName: string) => {
    if (!fullName) return '';
    return fullName.trim().split(' ')[0];
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  // Prevent background scrolling when sidebar menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-nav bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo Component */}
          <BrandLogo onClick={closeMenu} />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#475569]" aria-label="Main Navigation">
            
            {/* Explore Mentors Dropdown trigger */}
            <div 
              className="relative group py-2 cursor-pointer"
              onMouseEnter={() => setActiveDropdown('explore')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1.5 hover:text-[#172033] transition-colors focus:outline-none">
                <span>{tNav('findMentor')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#172033] transition-transform group-hover:rotate-180" />
              </button>

              {activeDropdown === 'explore' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 grid gap-1.5 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link href="/mentors" className="p-2.5 rounded-xl hover:bg-[#FFF7ED] text-[#172033] font-medium flex items-center gap-3 transition-colors">
                    <Compass className="w-5 h-5 text-[#F97316]" />
                    <div>
                      <div className="font-bold text-xs uppercase text-gray-400">{tNav('allMentors')}</div>
                      <div className="text-sm font-semibold">{tNav('browseMentors')}</div>
                    </div>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link href="/mentors?category=engineering" className="p-2 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700">{tNav('engineeringTech')}</Link>
                  <Link href="/mentors?category=product" className="p-2 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700">{tNav('productDesign')}</Link>
                  <Link href="/mentors?category=ai" className="p-2 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700">{tNav('aiDataScience')}</Link>
                </div>
              )}
            </div>

            <Link href="#categories" className="hover:text-[#172033] transition-colors">
              {tNav('categories')}
            </Link>

            <Link href="#how-it-works" className="hover:text-[#172033] transition-colors">
              {tNav('howItWorks')}
            </Link>

            <Link href="#teams" className="hover:text-[#172033] transition-colors flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{tNav('forTeams')}</span>
            </Link>

            <Link href="#pricing" className="hover:text-[#172033] transition-colors">
              {tNav('pricing')}
            </Link>
          </nav>

          {/* Desktop User Profile / Auth CTA Actions & Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-gray-100 border border-gray-200/80 transition-all focus:outline-none"
                >
                  <Avatar src={userAvatarUrl} name={userDisplayName} size="sm" />
                  <span className="font-extrabold text-sm text-[#172033]">
                    {getFirstName(userDisplayName)}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-extrabold text-sm text-[#172033] truncate">{userDisplayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#FFF7ED] hover:text-[#F97316] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {tNav('dashboard')}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {tNav('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth?mode=login">
                  <Button variant="ghost" size="md" className="font-semibold text-slate-700">
                    {tNav('login')}
                  </Button>
                </Link>
                <Link href="/auth?mode=register">
                  <Button variant="primary" size="md" className="shadow-md font-bold">
                    {tNav('signup')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              type="button"
              className="p-2 rounded-xl text-[#172033] hover:bg-orange-50 focus:outline-none transition-colors border border-gray-200/60"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6 text-[#F97316]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-[#172033]/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile Off-Canvas Sidebar Menu */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-white z-50 lg:hidden shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
            <BrandLogo size="sm" onClick={closeMenu} />

            <button
              onClick={closeMenu}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Header in Mobile if logged in */}
          {user && (
            <div className="p-4 bg-[#FFF7ED] border-b border-orange-100 flex items-center gap-3">
              <Avatar src={userAvatarUrl} name={userDisplayName} size="md" />
              <div className="overflow-hidden">
                <p className="font-extrabold text-sm text-[#172033] truncate">{userDisplayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/mentors"
              onClick={closeMenu}
              className="flex items-center justify-between p-3 rounded-xl text-base font-bold text-[#172033] hover:bg-[#FFF7ED] hover:text-[#F97316] transition-colors"
            >
              <span>{tNav('findMentor')}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="#categories"
              onClick={closeMenu}
              className="flex items-center justify-between p-3 rounded-xl text-base font-bold text-[#172033] hover:bg-[#FFF7ED] hover:text-[#F97316] transition-colors"
            >
              <span>{tNav('categories')}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="#how-it-works"
              onClick={closeMenu}
              className="flex items-center justify-between p-3 rounded-xl text-base font-bold text-[#172033] hover:bg-[#FFF7ED] hover:text-[#F97316] transition-colors"
            >
              <span>{tNav('howItWorks')}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="#teams"
              onClick={closeMenu}
              className="flex items-center justify-between p-3 rounded-xl text-base font-bold text-[#172033] hover:bg-[#FFF7ED] hover:text-[#F97316] transition-colors"
            >
              <span>{tNav('forTeams')}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer / Auth Action Buttons */}
        <div className="p-5 border-t border-[#E5E7EB] space-y-3 bg-[#FFFCF9]">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={closeMenu} className="block">
                <Button variant="primary" size="md" className="w-full justify-center gap-2 shadow-md font-bold">
                  <LayoutDashboard className="w-4 h-4" />
                  {tNav('dashboard')}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 font-bold"
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
              >
                <LogOut className="w-4 h-4" />
                {tNav('logout')}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login" onClick={closeMenu} className="block">
                <Button variant="outline" size="md" className="w-full justify-center gap-2 font-bold">
                  <LogIn className="w-4 h-4" />
                  {tNav('login')}
                </Button>
              </Link>

              <Link href="/auth?mode=register" onClick={closeMenu} className="block">
                <Button variant="primary" size="md" className="w-full justify-center gap-2 shadow-md font-bold">
                  <UserPlus className="w-4 h-4" />
                  {tNav('signup')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

