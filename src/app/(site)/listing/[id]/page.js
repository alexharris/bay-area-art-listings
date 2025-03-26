import { createClient } from '@sanity/client';
import { formatDate } from '../../../../utils/dates';
import { getLocationFromRef } from '../../../../utils/locations';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

async function fetchListingData(id) {
  return await client.fetch(`*[_type == "listing" && _id == $id][0]`, { id });
}

export default async function Location({ params }) {
  const id = (await params).id;
  const listing = await fetchListingData(id);

  const startDate = formatDate(listing.StartDate);
  const endDate = formatDate(listing.EndDate);

  const location = await getLocationFromRef(listing.Location._ref);

  console.log(location);

  return (
    <div className="p-4 prose">
      <h1>{listing.Event}</h1>
      <p>{startDate} - {endDate}</p>

      {location[0].Name}<br />
      {location[0].Address}<br />
      {location[0].Url}<br />
    </div>  
  );
}

export async function generateMetadata({ params }) {
  const id = (await params).id;
  const listing = await fetchListingData(id);

  const location = await getLocationFromRef(listing.Location._ref);

  return {
    title: `${listing.Event} @ ${location[0].Name} ${formatDate(listing.StartDate)} to ${formatDate(listing.EndDate)}`,
    description: `${listing.Event} @ ${location[0].Name} ${formatDate(listing.StartDate)} to ${formatDate(listing.EndDate)}`,
    openGraph: {
      title: `${listing.Event} @ ${location[0].Name} ${formatDate(listing.StartDate)} to ${formatDate(listing.EndDate)}`,
      description: `${listing.Event} @ ${location[0].Name} ${formatDate(listing.StartDate)} to ${formatDate(listing.EndDate)}`,
    },
  };
}

