import { client } from '@/sanity/lib/client';

// Regenerate hourly so lastmod tracks real content changes, not deploys
export const revalidate = 3600;

export default async function sitemap() {
  let lastModified = new Date();
  try {
    // Most recent change to anything shown on the homepage
    const latest = await client.fetch(
      `*[_type in ["listing", "location"]] | order(_updatedAt desc)[0]._updatedAt`
    );
    if (latest) lastModified = new Date(latest);
  } catch (error) {
    console.error('Sitemap lastModified lookup failed:', error);
  }

  return [
    {
      url: 'https://artboard.info',
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
