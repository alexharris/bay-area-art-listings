import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function getListings() {
  try {
    // get the location
    let data = await client.fetch('*[_type == "location"]');

  

    let sortedData = data.sort((a, b) => {
      // Custom sort function
      const nameA = a.Name || '';
      const nameB = b.Name || '';

      return nameA.localeCompare(nameB);
    });

    if(data.length > 0) {
        return sortedData
    }
    
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }
}


