'use server';

import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'ride9vgj',
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: 'v2022-03-07'
});

export default async function uploadSheetData(data) {



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
  }, 10000);
}