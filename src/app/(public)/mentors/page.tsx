import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, Search, Filter, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Find Mentors & Industry Experts | MentorAura',
  description: 'Browse 500+ top software engineers, product managers, and UI/UX designers for 1-on-1 mentorship.',
};

export default function MentorsPage() {
  const mentors = [
    {
      name: 'Amina Mansoor',
      title: 'Senior Staff Engineer',
      company: 'TechCorp',
      category: 'engineering',
      rating: '4.9',
      reviews: 124,
      skills: ['System Architecture', 'Career Transition', 'Tech Leadership'],
      avatar: 'AM',
      price: '$120/mo',
    },
    {
      name: 'David Okafor',
      title: 'Principal PM',
      company: 'Global Scale',
      category: 'product',
      rating: '5.0',
      reviews: 98,
      skills: ['Product Strategy', 'Roadmapping', 'Executive Management'],
      avatar: 'DO',
      price: '$150/mo',
    },
    {
      name: 'Elena Rostova',
      title: 'Head of UX & Product Design',
      company: 'Studio Design',
      category: 'design',
      rating: '4.95',
      reviews: 86,
      skills: ['UI/UX Systems', 'Portfolio Reviews', 'Figma Mastery'],
      avatar: 'ER',
      price: '$110/mo',
    },
    {
      name: 'Marcus Vance',
      title: 'VP of AI & ML',
      company: 'DataScale Labs',
      category: 'ai',
      rating: '4.98',
      reviews: 104,
      skills: ['Machine Learning', 'LLMs & AI', 'Python Systems'],
      avatar: 'MV',
      price: '$160/mo',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <Badge variant="orange" size="md" className="mb-2">Mentor Directory</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#172033]">
            Browse 1-on-1 Mentors
          </h1>
          <p className="text-[#64748B] text-base mt-2 max-w-2xl">
            Filter by technical domain, expertise, and company to find your dedicated mentor.
          </p>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search mentors..."
              className="w-full md:w-80 text-sm text-[#172033] bg-transparent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Badge variant="orange" size="md" className="cursor-pointer shrink-0">All Disciplines</Badge>
            <Badge variant="slate" size="md" className="cursor-pointer shrink-0">Engineering</Badge>
            <Badge variant="slate" size="md" className="cursor-pointer shrink-0">Product</Badge>
            <Badge variant="slate" size="md" className="cursor-pointer shrink-0">Design</Badge>
            <Badge variant="slate" size="md" className="cursor-pointer shrink-0">AI & Data</Badge>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m, idx) => (
            <Card key={idx} variant="hoverable" padding="lg" className="p-6 bg-white space-y-4 border-[#E5E7EB] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#172033] text-[#F97316] font-extrabold text-xl flex items-center justify-center shrink-0">
                    {m.avatar}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[#172033]">{m.name}</h2>
                    <p className="text-xs text-[#64748B]">{m.title} @ <span className="font-semibold text-gray-800">{m.company}</span></p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-xs font-bold">{m.rating}</span>
                      <span className="text-xs text-gray-400">({m.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {m.skills.map((skill, sIdx) => (
                    <Badge key={sIdx} variant="slate" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Monthly Plan</span>
                  <span className="text-lg font-black text-[#172033]">{m.price}</span>
                </div>
                <Link href="/auth?mode=register">
                  <Button variant="primary" size="sm" className="font-bold">
                    Book Mentor
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
