import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function getListings() {
  try {
    // get the listing
    let today = new Date().toISOString().split('T')[0];
    let data = await client.fetch('*[_type == "listing" && EndDate > $today]', {today});    

    console.log(data)

    // get the locations reference by the listing
    const locations = await Promise.all(data.map(async listing => {
      const location = await client.fetch(`*[_type == "location" && _id == "${listing.Location._ref}"]`);      
      return location
    }));

    // combine them
    data = data.map((listing, index) => ({
      ...listing,
      locationName: locations[index][0]?.Name || 'Unknown',
      locationAddress: locations[index][0]?.Address || 'Address Not Listed',
      locationUrl: locations[index][0]?.Url || '',
      locationHours: locations[index][0]?.Hours || '',
      locationInstagram: locations[index][0]?.Instagram || '',
    }));

    if(data.length > 0) {
        return data
    }
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }
}


