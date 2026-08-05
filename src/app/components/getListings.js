import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

// Helper function to check if show is on view and venue is open today
function computeIsOnViewToday(item) {
  // Check if show is on view today
  const now = new Date();
  const options = { timeZone: 'America/Los_Angeles' };
  const todayInPT = new Date(now.toLocaleString('en-US', options));
  todayInPT.setHours(0, 0, 0, 0);
  
  const startDate = new Date(item.StartDate + 'T00:00:00');
  const endDate = new Date(item.EndDate + 'T23:59:59');
  
  const isOnView = todayInPT >= startDate && todayInPT <= endDate;
  
  if (!isOnView) return false;
  
  // Check if venue is open today
  if (!item.locationHours) return false;
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[todayInPT.getDay()];
  const todaysHours = item.locationHours[currentDay];
  
  if (!todaysHours) return false;
  
  const isClosed = todaysHours.toLowerCase().includes('closed');
  return !isClosed;
}

export default async function getListings() {
  try {

    let today = new Date().toISOString().split('T')[0];
    // get the listings
    let data = await client.fetch(`
      *[_type == "listing" && EndDate >= $today] {
        ...,
        _createdAt,
        "locationName": Location->Name,
        "locationAddress": Location->Address,
        "locationCity": Location->City,
        "locationCounty": Location->county,
        "locationUrl": Location->Url,
        "locationGeolocation": Location->Geolocation,
        "locationHours": Location->Hours,
        "locationInstagram": Location->Instagram,
        "locationVenueTypes": Location->venueTypes,
        "sfawUrl": sfawUrl
      }
    `, { today });    


    // combine them
    data = data.map((listing) => {
      let eventImageUrl = null;
      let eventImageCaption = null;
      
      // Uploaded image takes priority over URL string
      if (listing.EventImageUpload) {
        eventImageUrl = urlFor(listing.EventImageUpload).width(400).height(400).fit('crop').url();
      } else if (listing.EventImageUrl) {
        eventImageUrl = listing.EventImageUrl;
        eventImageCaption = listing.EventImageCaption;
      }
      
      return {
        ...listing,
        eventImageUrl,
        eventImageCaption,
        isOnViewToday: computeIsOnViewToday(listing),
      };
    });

    if(data.length > 0) {
        return data
    }
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }
}

export async function getListingsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  try {
    let data = await client.fetch(`
      *[_type == "listing" && _id in $ids] {
        ...,
        _createdAt,
        "locationName": Location->Name,
        "locationAddress": Location->Address,
        "locationCity": Location->City,
        "locationUrl": Location->Url,
        "locationGeolocation": Location->Geolocation,
        "locationHours": Location->Hours,
        "locationInstagram": Location->Instagram,
      }
    `, { ids });

    data = data.map((listing) => {
      let eventImageUrl = null;
      let eventImageCaption = null;
      if (listing.EventImageUpload) {
        eventImageUrl = urlFor(listing.EventImageUpload).width(400).height(300).url();
      } else if (listing.EventImageUrl) {
        eventImageUrl = listing.EventImageUrl;
        eventImageCaption = listing.EventImageCaption;
      }
      return {
        ...listing,
        eventImageUrl,
        eventImageCaption,
        isOnViewToday: computeIsOnViewToday(listing),
      };
    });

    return data;
  } catch (error) {
    console.error('getListingsByIds failed:', error);
    return [];
  }
}


