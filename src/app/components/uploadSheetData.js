import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'ride9vgj',
  dataset: 'production',
  token: 'skNjKTdtZLHyHrjFnNjL76asMf1OcDYvDYcsvEdLNjErzxN4HTDhBvYJl1QMoUXYGqleUZPMbz0z0BuVJyWV6aZuGcnQIw949ecUS9LMptAX6nCQajtEFT7MnlvNfQJ3kj3amgc1aTW9dqYTqgZ9zE8GcdhvRB4GRYrX12ZeMFvjRtA3Tthd',
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
}