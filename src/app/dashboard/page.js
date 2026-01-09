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

  // Get all shows with their start dates for the openings chart
  const allShows = await client.fetch(`
    *[_type == "listing" && defined(StartDate)] {
      StartDate
    }
  `);

  // Process shows by year and day
  const showsByYear = {};
  allShows.forEach(show => {
    if (show.StartDate) {
      const date = new Date(show.StartDate);
      const year = date.getFullYear();
      const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / 1000 / 60 / 60 / 24);
      
      if (!showsByYear[year]) {
        showsByYear[year] = {};
      }
      showsByYear[year][dayOfYear] = (showsByYear[year][dayOfYear] || 0) + 1;
    }
  });

  // Convert to array format for each year
  const openingsData = {};
  Object.keys(showsByYear).forEach(year => {
    const yearData = [];
    for (let day = 1; day <= 365; day++) {
      yearData.push({
        day,
        count: showsByYear[year][day] || 0,
        date: new Date(parseInt(year), 0, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    openingsData[year] = yearData;
  });

  const availableYears = Object.keys(openingsData).sort((a, b) => b - a);

  return {
    totalShows,
    activeShows,
    countyData,
    topLocations,
    totalLocations,
    showsWithNotes,
    openingsData,
    availableYears
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} />;
}
