'use client';

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ride9vgj',
  dataset: 'production',
  token: 'skNjKTdtZLHyHrjFnNjL76asMf1OcDYvDYcsvEdLNjErzxN4HTDhBvYJl1QMoUXYGqleUZPMbz0z0BuVJyWV6aZuGcnQIw949ecUS9LMptAX6nCQajtEFT7MnlvNfQJ3kj3amgc1aTW9dqYTqgZ9zE8GcdhvRB4GRYrX12ZeMFvjRtA3Tthd',
  useCdn: false,
  apiVersion: 'v2022-03-07'
});

async function getLocations() {
  console.log('geocode!');
  try {
    const locations = await client.fetch('*[_type == "location"]');
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

async function geocodeLocations() {
  let locations = await getLocations();
  console.log(locations);
}

export default function geocoder() {
  return (
    <div className='p-4 mt-48'>
      <button onClick={geocodeLocations} className='border p-2'>Geocode everything</button>
    </div>
  );
}