import MainListings from "../components/mainListings";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { generateSlug } from "@/utils/shared";

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
  if (!show) return {};

  const listings = await client.fetch(
    `*[_type == "listing"]{ Event, EventImageUpload, EventImageUrl, "locationName": Location->locationName }`
  );
  const listing = listings.find(item => generateSlug(item.Event) === show);
  if (!listing) return {};

  const imageUrl = listing.EventImageUpload
    ? urlFor(listing.EventImageUpload).width(1200).height(630).fit('crop').url()
    : listing.EventImageUrl || null;

  return {
    title: listing.Event,
    openGraph: {
      title: listing.Event,
      description: listing.locationName ? `At ${listing.locationName} — Bay Area Art Listings` : 'Bay Area Art Listings',
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: listing.Event,
    },
  };
}

export default async function Home({ searchParams }) {
  const settings = await getSettings();
  const { show } = await searchParams;

  return (
    <div className="flex flex-col items-start justify-between min-h-screen gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full">
        <MainListings newsletterSettings={settings?.newsletter} sharedSlug={show || null} />
      </main>
    </div>
  );
}
