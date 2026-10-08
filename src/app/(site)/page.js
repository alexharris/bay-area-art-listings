import { unstable_cache } from "next/cache";
import MainListings from "../components/mainListings";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { generateSlug, formatDate } from "@/utils/shared";
import { extractPortableTextContent } from "@/utils/helpers";
import getListings from "../components/getListings";
import getLocations from "../components/getLocations";

// Editorial/import fields the frontend never reads — keep them out of the HTML payload
const INTERNAL_FIELDS = ['InternalNotes', 'importNotes', 'importWarnings', 'importLinks', 'emailMessageId', 'candidateImageUrls', 'instagramImage'];

function stripInternalFields(listing) {
  const clean = { ...listing };
  for (const field of INTERNAL_FIELDS) delete clean[field];
  return clean;
}

// Cache the Sanity fetch across requests; new/edited listings appear within a minute
const getHomepageData = unstable_cache(
  async () => {
    const [listings, locations] = await Promise.all([getListings(), getLocations()]);
    return {
      listings: listings?.map(stripInternalFields),
      locations: locations?.map(({ InternalNotes, ...location }) => location),
    };
  },
  ['homepage-data'],
  { revalidate: 60 }
);

// schema.org ExhibitionEvent markup so search engines understand the listings as events
function buildStructuredData(listings) {
  const events = listings
    .filter(item => item.Event && item.StartDate && item.locationName)
    .map(item => {
      const description = extractPortableTextContent(item.Notes).replace(/\+\+\+/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        '@type': 'ExhibitionEvent',
        name: item.Event,
        startDate: item.StartDate,
        ...(item.EndDate && { endDate: item.EndDate }),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        ...(item.EventUrl && { url: item.EventUrl }),
        ...(item.eventImageUrl && { image: [item.eventImageUrl] }),
        ...(description && { description: description.slice(0, 300) }),
        location: {
          '@type': 'Place',
          name: item.locationName,
          address: {
            '@type': 'PostalAddress',
            ...(item.locationAddress && { streetAddress: item.locationAddress }),
            ...(item.locationCity && { addressLocality: item.locationCity }),
            addressRegion: 'CA',
            addressCountry: 'US',
          },
          ...(item.locationGeolocation?.lat && {
            geo: { '@type': 'GeoCoordinates', latitude: item.locationGeolocation.lat, longitude: item.locationGeolocation.lng },
          }),
        },
        organizer: {
          '@type': 'Organization',
          name: item.locationName,
          ...(item.locationUrl && { url: item.locationUrl }),
        },
      };
    });

  return { '@context': 'https://schema.org', '@graph': events };
}

async function getSettings() {
  try {
    const settings = await client.fetch(`*[_type == "settings" && _id == "settings"][0]{
      newsletter
    }`)
    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

export async function generateMetadata({ searchParams }) {
  const { show } = await searchParams;
  // ?show= share links are duplicates of the homepage; consolidate on "/"
  const alternates = { canonical: '/' };
  if (!show) return { alternates };

  const listings = await client.fetch(
    `*[_type == "listing"]{ Event, StartDate, EndDate, DateOverride, EventImageUpload, EventImageUrl, "locationName": Location->Name }`
  );
  const listing = listings.find(item => generateSlug(item.Event) === show);
  if (!listing) return { alternates };

  const imageUrl = listing.EventImageUpload
    ? urlFor(listing.EventImageUpload).width(1200).height(630).fit('crop').url()
    : listing.EventImageUrl || null;

  const dates = listing.DateOverride
    || [formatDate(listing.StartDate), formatDate(listing.EndDate)].filter(Boolean).join(' – ');
  const summary = [dates, listing.locationName && `at ${listing.locationName}`].filter(Boolean).join(' ');
  const description = summary ? summary[0].toUpperCase() + summary.slice(1) : 'Art Board';

  return {
    alternates,
    title: listing.Event,
    description,
    openGraph: {
      title: listing.Event,
      description,
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: listing.Event,
      description,
    },
  };
}

export default async function Home({ searchParams }) {
  const [settings, { show }, homepageData] = await Promise.all([
    getSettings(),
    searchParams,
    getHomepageData().catch(() => ({})),
  ]);
  const { listings: initialListings, locations: initialLocations } = homepageData;

  return (
    <div className="flex flex-col items-start justify-between min-h-screen gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full">
        <h1 className="sr-only">Bay Area art exhibitions and gallery openings</h1>
        {initialListings?.length > 0 && (
          <script
            type="application/ld+json"
            // Escape "<" so listing text can't close the script tag
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData(initialListings)).replace(/</g, '\\u003c') }}
          />
        )}
        <MainListings
          newsletterSettings={settings?.newsletter}
          sharedSlug={show || null}
          initialListings={initialListings}
          initialLocations={initialLocations}
        />
      </main>
    </div>
  );
}
