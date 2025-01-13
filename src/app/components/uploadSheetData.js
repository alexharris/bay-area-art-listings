import { createClient } from '@sanity/client';

async function createSanityClient() {
  return createClient({
    projectId: 'ride9vgj',
    dataset: 'production',
    token: process.env.SANITY_STUDIO_API_READ_TOKEN,
    useCdn: false,
    apiVersion: 'v2022-03-07'
  });
}

export default async function uploadSheetData(data) {

  const client = await createSanityClient()

  console.log(client)
  console.log(process.env.SANITY_STUDIO_API_READ_TOKEN)

  try {
    for (const item of data) {
      const response = await client.create({
        _type: 'listing',
        ...item
      });
      console.log('Data uploaded successfully:', response);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }

  setTimeout(() => {
    console.log(process.env.SANITY_STUDIO_API_READ_TOKEN);
  }, 10000);
}