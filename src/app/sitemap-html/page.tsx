import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap | MentorAura',
  description: 'Explore all mentors, categories, services, and career coaching resources on MentorAura.',
};

export default function SitemapPage() {
  const routes = [
    { name: 'Home', path: '/' },
    { name: 'Find Mentors', path: '/mentors' },
    { name: 'Categories & Disciplines', path: '/#categories' },
    { name: 'How Mentorship Works', path: '/#how-it-works' },
    { name: 'Pricing & Plans', path: '/#pricing' },
    { name: 'MentorAura for Teams', path: '/#teams' },
    { name: 'Become a Mentor', path: '/register?role=mentor' },
    { name: 'Log In', path: '/login' },
    { name: 'Get Started', path: '/register' },
  ];

  const categories = [
    'Software Engineering',
    'Product Management',
    'UI/UX & Design',
    'Data Science & AI',
    'DevOps & Cloud',
    'Career Transition',
    'Startup Leadership',
    'Marketing & Growth',
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-[#172033] mb-4">MentorAura Sitemap</h1>
      <p className="text-[#64748B] mb-8">
        Navigate through our 1-on-1 mentorship pages, career tracks, and expert categories.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <h2 className="text-xl font-bold text-[#172033] mb-4">Main Platform Pages</h2>
          <ul className="space-y-2.5">
            {routes.map((route) => (
              <li key={route.path}>
                <a href={route.path} className="text-[#F97316] font-medium hover:underline">
                  {route.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <h2 className="text-xl font-bold text-[#172033] mb-4">Browse Mentors by Skill</h2>
          <ul className="space-y-2.5">
            {categories.map((cat) => (
              <li key={cat}>
                <a href="/mentors" className="text-[#172033] hover:text-[#F97316] font-medium">
                  {cat} Mentors
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
