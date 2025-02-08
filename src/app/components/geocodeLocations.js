'use client';

import { useState } from 'react';
import { createClient } from '@sanity/client';
import Papa from 'papaparse';

const client = createClient({
  projectId: 'ride9vgj',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
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

async function geocodeLocations(file) {
  const locations = await getLocations();
  const csvData = [];

  const fileContent = await file.text();
  console.log(locations)
  console.log(fileContent)
  Papa.parse(fileContent, {
    header: true,
    complete: async (results) => {
      csvData.push(...results.data);

      for (const location of locations) {
        const match = csvData.find((row) => row.address === location.Address);
        if (match) {
            match.Latitude = parseFloat(match.Latitude);
            match.Longitude = parseFloat(match.Longitude);
          try {
            await client.patch(location._id)
              .set({
              'Geolocation.lat': match.Latitude,
              'Geolocation.lng': match.Longitude
              })
              .commit();
            console.log(`Updated location ${location._id} with latitude ${match.Latitude} and longitude ${match.Longitude}`);
          } catch (error) {
            console.error(`Error updating location ${location._id}:`, error);
          }
        } else {
          console.log('not a match')
        }
      }
    }
  });
}

export default function Geocoder() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (file) {
      geocodeLocations(file);
    }
  };

  return (
    <div className='p-4 mt-48'>
      Geocode
      <input type="file" accept=".csv" onChange={handleFileChange} />
      {file && (
        <>
          {file.name}
          <button onClick={handleFileUpload} className='border p-2'>Geocode everything</button>
        </>
      )}
    </div>
  );
}