import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { useTranslations } from 'next-intl';
import { Home, ArrowLeft, Search, Compass, Sparkles } from 'lucide-react';

export default function NotFound() {
  const tNotFound = useTranslations('notFound');
  const tNav = useTranslations('nav');
  const tFooter = useTranslations('footer');

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FFF7ED] rounded-full blur-3xl -z-10 opacity-80 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

      {/* Reusable Simple Header */}
      <SimpleHeader />

      {/* Main 404 Hero Section */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col items-center justify-center text-center z-10">
        
        {/* Floating Badge */}
        <Badge variant="orange" size="md" className="gap-2 shadow-xs mb-6 px-4 py-1.5 inline-flex items-center">
          <Sparkles className="w-4 h-4 text-[#F97316]" /> {tNotFound('badge')}
        </Badge>

        {/* Big 404 Visual Graphic */}
        <div className="relative mb-6">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-[#172033] select-none opacity-90">
            4<span className="text-[#F97316] inline-block animate-bounce">0</span>4
          </h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Compass className="w-20 h-20 sm:w-28 sm:h-28 text-[#F97316]/15 stroke-[1.5]" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 max-w-lg mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            {tNotFound('oops')}
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            {tNotFound('description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-xs sm:max-w-md">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md gap-2"
              leftIcon={<Home className="w-[#F97316]" />}
            >
              {tNotFound('backHome')}
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full font-bold gap-2 border-gray-300 hover:bg-gray-50 text-[#172033]"
              leftIcon={<Compass className="w-5 h-5 text-[#F97316]" />}
            >
              {tNotFound('goDashboard')}
            </Button>
          </Link>
        </div>

        {/* Quick Links Footer Card */}
        <div className="mt-12 p-5 rounded-2xl bg-[#FFF] border border-[#E5E7EB] shadow-xs max-w-md w-full flex items-center justify-between text-xs text-[#64748B] font-semibold">
          <span>{tNotFound('lookingSpecific')}</span>
          <div className="flex gap-4">
            <Link href="/auth?mode=login" className="text-[#F97316] hover:underline font-bold">
              {tNav('login')}
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/auth?mode=register" className="text-[#F97316] hover:underline font-bold">
              {tNav('signup')}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 font-medium">
        © {new Date().getFullYear()} MentorAura. {tFooter('rights')}
      </footer>
    </div>
  );
}
