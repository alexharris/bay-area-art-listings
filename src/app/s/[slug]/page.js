import { cache } from 'react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { generateSlug, formatDate } from '@/utils/shared';
import ShareRedirect from './ShareRedirect';

// Share links: /s/<slug> serves per-show Open Graph tags for social previews
// (crawlers don't run JS), then sends visitors to /?show=<slug> on the static homepage.

const getListingBySlug = cache(async (slug) => {
  const listings = await client.fetch(
    `*[_type == "listing"]{ Event, StartDate, EndDate, DateOverride, EventImageUpload, EventImageUrl, "locationName": Location->Name }`
  );
  return listings.find(item => generateSlug(item.Event) === slug) || null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const robots = { index: false, follow: true };
  const listing = await getListingBySlug(slug);
  if (!listing) return { robots };

  const imageUrl = listing.EventImageUpload
    ? urlFor(listing.EventImageUpload).width(1200).height(630).fit('crop').url()
    : listing.EventImageUrl || null;

  const dates = listing.DateOverride
    || [formatDate(listing.StartDate), formatDate(listing.EndDate)].filter(Boolean).join(' – ');
  const summary = [dates, listing.locationName && `at ${listing.locationName}`].filter(Boolean).join(' ');
  const description = summary ? summary[0].toUpperCase() + summary.slice(1) : 'Art Board';

  return {
    robots,
    title: listing.Event,
    description,
    openGraph: {
      title: listing.Event,
      description,
      url: `/s/${slug}`,
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: listing.Event,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function SharePage({ params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  const target = `/?show=${encodeURIComponent(slug)}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-[family-name:var(--font-geist-sans)]">
      <ShareRedirect href={target} />
      <a href={target} className="underline text-gray-700">
        {listing ? `View “${listing.Event}” on Art Board` : 'View on Art Board'}
      </a>
    </div>
  );
}
