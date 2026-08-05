import { NextResponse } from 'next/server';
const { PlacesClient } = require('@googlemaps/places').v1;
const apiKey = process.env.GOOGLE_API; 
const placesClient = new PlacesClient({apiKey});

export async function POST(request) {
  try {
    const { placeId } = await request.json();
    
    if (!placeId) {
      return NextResponse.json({ error: 'Google Place ID is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
    }

    // Get place details using Places API client
    const placeRequest = {
      name: `places/${placeId}`
    };
    
    const placeResponse = await placesClient.getPlace(placeRequest, {
      otherArgs: {
        headers: {
          'X-Goog-FieldMask': 'displayName,formattedAddress,addressComponents,websiteUri,currentOpeningHours,location,id,types',
        },
      },
    });

    if (!placeResponse || !placeResponse[0]) {
      return NextResponse.json({
        error: 'Failed to fetch place details'
      }, { status: 500 });
    }

    // Format the data for our Sanity document
    const place = placeResponse[0];
    const cityComponent = place.addressComponents?.find(
      component =>
        component.types?.includes('locality') ||
        component.types?.includes('administrative_area_level_2')
    );
    const formattedData = {
      Name: place.displayName?.text || null,
      Address: place.formattedAddress || null,
      City: cityComponent?.longText || cityComponent?.shortText || null,
      Url: place.websiteUri || null,
      GoogleID: place.id || null,
      Geolocation: place.location ? {
        lat: place.location.latitude,
        lng: place.location.longitude
      } : null,
      Hours: place.currentOpeningHours?.weekdayDescriptions ? {
        Monday: place.currentOpeningHours.weekdayDescriptions[0] || null,
        Tuesday: place.currentOpeningHours.weekdayDescriptions[1] || null,
        Wednesday: place.currentOpeningHours.weekdayDescriptions[2] || null,
        Thursday: place.currentOpeningHours.weekdayDescriptions[3] || null,
        Friday: place.currentOpeningHours.weekdayDescriptions[4] || null,
        Saturday: place.currentOpeningHours.weekdayDescriptions[5] || null,
        Sunday: place.currentOpeningHours.weekdayDescriptions[6] || null,
      } : null,
      Types: place.types || null,
    };

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching Google Place data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
