import MainListings from "../components/mainListings";
import { client } from "@/sanity/lib/client";
import { extractPortableTextContent } from "@/utils/helpers";
import getListings from "../components/getListings";

// Only the fields the client reads. An allowlist keeps the embedded page data small and keeps
// editorial/import fields (InternalNotes, importNotes, …) out of the HTML.
const CLIENT_LISTING_FIELDS = [
  '_id', '_createdAt', 'Event', 'EventUrl', 'StartDate', 'EndDate', 'DateOverride', 'Highlight', 'sfawUrl',
  'Notes', 'openings', 'eventImageUrl', 'eventImageCaption', 'isOnViewToday',
  'locationName', 'locationAddress', 'locationCity', 'locationCounty', 'locationUrl',
  'locationGeolocation', 'locationHours', 'locationInstagram',
];

// Portable text → plain string, matching how NotesRenderer flattens it (blocks joined by newlines)
function notesToString(notes) {
  if (!Array.isArray(notes)) return notes;
  return notes
    .filter(block => block._type === 'block')
    .map(block => (block.children ? block.children.map(child => child.text).join('') : ''))
    .join('\n');
}

function toClientListing(listing) {
  const clean = {};
  for (const field of CLIENT_LISTING_FIELDS) {
    if (listing[field] !== undefined && listing[field] !== null) clean[field] = listing[field];
  }
  if (clean.Notes) clean.Notes = notesToString(clean.Notes);
  if (clean.openings) {
    clean.openings = clean.openings.map(({ _key, title, date, time, note }) => ({ _key, title, date, time, note }));
  }
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
  // Locations are only needed by the map view, which fetches them on demand
  const listings = await getListings();
  return { listings: listings?.map(toClientListing) };
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
  const { listings: initialListings } = homepageData;

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
        />
      </main>
    </div>
  );
}
