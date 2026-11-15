import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import LocationsList from './LocationsList';

export const revalidate = 3600;

export const metadata = {
  title: 'Locations',
  description: 'Galleries, museums, and art spaces in the Bay Area.',
};

async function getLocations() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  return client.fetch(
    `*[_type == "location" && defined(Name)] | order(Name asc) {
      _id, Name, Address, City, county, Url, Instagram, Hours,
      "showCount": count(*[_type == "listing" && Location._ref == ^._id && EndDate >= $today]),
      "totalShowCount": count(*[_type == "listing" && Location._ref == ^._id])
    }`,
    { today }
  );
}

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 underline">
            ← Back to listings
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Locations</h1>
        </div>
        <LocationsList locations={locations} />
      </div>
    </div>
  );
}
