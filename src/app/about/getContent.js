import { createClient } from '@sanity/client';


const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function getContent() {
  try {
    let data = await client.fetch('*[_type == "page"][Title == "About"]');
    if (data.length > 0) {
      return data
    }
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }
}



