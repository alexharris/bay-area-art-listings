import MainListings from "../components/mainListings";
import { client } from "@/sanity/lib/client";
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

// Static page regenerated in the background at most once a minute (ISR), so it's
// served from Vercel's CDN. Per-show share previews live at /s/[slug] because
// reading searchParams here would force the page to render on every request.
export const revalidate = 60;

export const metadata = {
  alternates: { canonical: '/' },
};

async function getHomepageData() {
  // Let errors throw: during regeneration Next keeps serving the last good page
  const [listings, locations] = await Promise.all([getListings(), getLocations()]);
  return {
    listings: listings?.map(stripInternalFields),
    locations: locations?.map(({ InternalNotes, ...location }) => location),
  };
}

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

export default async function Home() {
  const [settings, homepageData] = await Promise.all([
    getSettings(),
    getHomepageData(),
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
          initialListings={initialListings}
          initialLocations={initialLocations}
        />
      </main>
    </div>
  );
}
