import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#172033] flex items-center justify-center text-white font-bold text-xl group-hover:bg-[#F97316] transition-colors shadow-sm">
            M<span className="text-[#F97316] group-hover:text-white transition-colors">A</span>
          </div>
          <span className="text-xl font-bold text-[#172033] tracking-tight">
            Mentor<span className="text-[#F97316]">Aura</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
          <Link href="#explore" className="hover:text-[#172033] transition-colors">
            Find a Mentor
          </Link>
          <Link href="#how-it-works" className="hover:text-[#172033] transition-colors">
            How It Works
          </Link>
          <Link href="#mentors" className="hover:text-[#172033] transition-colors">
            Become a Mentor
          </Link>
          <Link href="#pricing" className="hover:text-[#172033] transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Auth CTA Actions */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="md">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
