import { MetadataRoute } from 'next';

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001/api/v1';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mentoraura.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mentors`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth?mode=login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth?mode=register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let mentorRoutes: MetadataRoute.Sitemap = [];

  try {
    const catRes = await fetch(`${API_BASE}/categories`, { next: { revalidate: 3600 } });
    if (catRes.ok) {
      const { data } = await catRes.json();
      if (Array.isArray(data)) {
        categoryRoutes = data.map((cat: { slug: string }) => ({
          url: `${baseUrl}/mentors?category=${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    }
  } catch {
    // Fallback if backend is unreachable at build time
    const fallbackCategories = ['engineering', 'product', 'design', 'ai-data', 'career', 'leadership'];
    categoryRoutes = fallbackCategories.map((slug) => ({
      url: `${baseUrl}/mentors?category=${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  try {
    const mentorsRes = await fetch(`${API_BASE}/discovery/featured`, { next: { revalidate: 3600 } });
    if (mentorsRes.ok) {
      const { data } = await mentorsRes.json();
      if (Array.isArray(data)) {
        mentorRoutes = data.map((m: { slug?: string; id: string }) => ({
          url: `${baseUrl}/mentors/${m.slug || m.id}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.85,
        }));
      }
    }
  } catch {
    // Ignore fallback errors for dynamic mentors
  }

  return [...staticRoutes, ...categoryRoutes, ...mentorRoutes];
}
