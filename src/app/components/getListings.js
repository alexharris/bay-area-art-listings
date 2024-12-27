import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: 'production',
    token: process.env.SANITY_TOKEN,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function getListings() {
  try {
    let data = await client.fetch('*[_type == "listing"]');
    if(data.length > 0) {
        return data
    }
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }
}


