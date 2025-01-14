import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: 'production',
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function getListings() {
  try {
    // get the listing
    let data = await client.fetch('*[_type == "listing"]');

    // get the locations reference by the listing
    const locations = await Promise.all(data.map(async listing => {
      const location = await client.fetch(`*[_type == "location" && _id == "${listing.Location._ref}"]`);
      return location
    }));

    // combine them
    data = data.map((listing, index) => ({
      ...listing,
      locationName: locations[index][0]?.Name || 'Unknown',
      locationAddress: locations[index][0]?.Address || 'Unknown'
    }));

    if(data.length > 0) {
        return data
    }
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }
}


