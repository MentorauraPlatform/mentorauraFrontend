import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172033] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center text-white font-bold text-lg">
                MA
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Mentor<span className="text-[#F97316]">Aura</span>
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Empowering leaders, innovators, and creators across Africa with 1:1 world-class mentorship.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-[#94A3B8]">
              <li><Link href="#explore" className="hover:text-white transition-colors">Find Mentors</Link></li>
              <li><Link href="#categories" className="hover:text-white transition-colors">Browse Domains</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link href="#reviews" className="hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Mentors */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Mentors
            </h4>
            <ul className="space-y-2.5 text-sm text-[#94A3B8]">
              <li><Link href="#apply" className="hover:text-white transition-colors">Apply as Mentor</Link></li>
              <li><Link href="#guidelines" className="hover:text-white transition-colors">Mentor Guidelines</Link></li>
              <li><Link href="#community" className="hover:text-white transition-colors">Mentor Hub</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-[#94A3B8]">
              <li><Link href="#privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-[#94A3B8] gap-4">
          <p>© {new Date().getFullYear()} MentorAura Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with energy & precision for mentors & mentees.
          </p>
        </div>
      </div>
    </footer>
  );
};
