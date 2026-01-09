import { client } from '@/sanity/lib/client';
import DashboardClient from './DashboardClient';
import bayAreaZipcodes from '@/data/bay-area-zipcodes.json';

// Queries to get dashboard statistics
async function getDashboardStats() {
  // Total number of shows
  const totalShows = await client.fetch(`count(*[_type == "listing"])`);
  
  // Active shows (current and future)
  const today = new Date().toISOString().split('T')[0];
  const activeShows = await client.fetch(
    `count(*[_type == "listing" && EndDate >= $today])`,
    { today }
  );

  // Shows per county
  const showsWithLocations = await client.fetch(`
    *[_type == "listing"] {
      "address": Location->Address
    }
  `);

  // Create zipcode to county mapping
  const zipcodeToCounty = {};
  bayAreaZipcodes.forEach(item => {
    item.zipcodes.forEach(zipcode => {
      zipcodeToCounty[zipcode] = item.county;
    });
  });

  // Count shows by county
  const countyCounts = {};
  showsWithLocations.forEach(show => {
    if (show.address) {
      // Extract zipcode from address (assuming US format with 5-digit zipcode)
      const zipcodeMatch = show.address.match(/\b\d{5}\b/);
      if (zipcodeMatch) {
        const zipcode = zipcodeMatch[0];
        const county = zipcodeToCounty[zipcode];
        if (county) {
          countyCounts[county] = (countyCounts[county] || 0) + 1;
        }
      }
    }
  });

  const countyData = Object.entries(countyCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([county, count]) => ({ county, count }));

  // Shows by county (from location Google Place ID city)
  const showsByLocation = await client.fetch(`
    *[_type == "listing"] {
      "locationName": Location->Name,
      "googleId": Location->GoogleID
    }
  `);

  // Count by location
  const locationCounts = {};
  showsByLocation.forEach(show => {
    if (show.locationName) {
      locationCounts[show.locationName] = (locationCounts[show.locationName] || 0) + 1;
    }
  });

  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([location, count]) => ({ location, count }));

  // Total locations
  const totalLocations = await client.fetch(`count(*[_type == "location"])`);

  // Shows with notes
  const showsWithNotes = await client.fetch(`count(*[_type == "listing" && defined(Notes)])`);

  return {
    totalShows,
    activeShows,
    countyData,
    topLocations,
    totalLocations,
    showsWithNotes
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} />;
}
