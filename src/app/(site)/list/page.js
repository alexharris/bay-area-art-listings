import { getListingsByIds } from '@/app/components/getListings';
import SharedListView from '@/app/components/SharedListView';
import Link from 'next/link';

export default async function SharedListPage({ searchParams }) {
  const { ids: idsParam, name } = await searchParams;
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];
  const listings = ids.length > 0 ? await getListingsByIds(ids) : [];
  const listName = name || 'Saved Exhibitions';
  const notFound = ids.length - listings.length;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 underline">
            ← Back to listings
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">{listName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {listings.length} exhibition{listings.length !== 1 ? 's' : ''}
            {notFound > 0 && (
              <span className="ml-2 text-gray-400">
                ({notFound} no longer available)
              </span>
            )}
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-gray-400 py-12 text-center">
            No exhibitions found. They may have been removed.
          </div>
        ) : (
          <SharedListView listings={listings} />
        )}
      </div>
    </div>
  );
}
