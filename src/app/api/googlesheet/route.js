import { google } from 'googleapis';
import {createClient} from '@sanity/client'
const { PlacesClient } = require('@googlemaps/places').v1;


export async function GET(req, res) {

  let locationData = [];
  let newLocations = [];

  const sheets = google.sheets('v4');
  const apiKey = process.env.GOOGLE_API;
  const placesClient = new PlacesClient({apiKey});


  // Get Sheet Data
  const sheetData = await sheets.spreadsheets.values.get({
    key: apiKey,
    spreadsheetId: '1uQejuXXnuVwrU1vGDwcWoM4HlZh1XHwRCVqLJE4yqOg',
    range: 'test',
  });
  
  // Create Sanity Client
  const client = createClient({
    projectId: 'ride9vgj',
    dataset: 'development',
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
    apiVersion: 'v2022-03-07'
  });

  const rows = sheetData.data.values;

  // Get all of the existing locations
  try {
    locationData = await client.fetch('*[_type == "location"]');
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }

  // Go through the new items and get the locations
  for (let i = 1; i < rows.length; i++) {
    newLocations.push(rows[i][3]);
  }

  newLocations = [...new Set(newLocations)];


  // Add the new locations that dont already exist
  for (const newLocation of newLocations) {

    // check if it exists by comparing the locations from sanity with the google results of the new location
    const locationExistsAlready = locationData.some(existingLocation => existingLocation.OriginalName === newLocation);
    console.log('location already exists?: ' + locationExistsAlready) 

    // if it does not exist
    if (!locationExistsAlready) {

      let textQuery = newLocation;
      const request = {
        textQuery,
      };      
      const googleLocation = await placesClient.searchText(request, {
        otherArgs: {
          headers: {
            'X-Goog-FieldMask': 'places',
          },
        },
      });      

      const place = googleLocation[0].places[0]

 

      const name = place.displayName?.text || '';
      const address = place.formattedAddress || '';
      const lat = place.location?.latitude || '';
      const lng = place.location?.longitude || '';
      const website = place.websiteUri || '';
      const googleId = place.id || '';
      const originalName = newLocation || '';


    // create it
      const locationResponse = await client.create({
        _type: 'location',
        Name: name,
        Address: address,
        GoogleID: googleId,
        Url: website,
        OriginalName: originalName,
        Geolocation: {
          lat: lat,
          lng: lng
        }
      });
      console.log('Data uploaded successfully:', locationResponse);
    } else {
      console.log('location already exists!!')
    }
  }  

  // get location data now that new ones have been added
  try {
    locationData = await client.fetch('*[_type == "location"]');
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }

  // Add sheet data to sanity
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const id = row[0];
    const highlight = row[1] 
    const isHighlight = highlight ? true : false;
    const event = row[2];

    // find the reference id of the location
    let locationId = locationData.find(location => location.OriginalName === row[3])._id;
    
    const startDate = row[4];
    const endDate = row[5];

    await client.createOrReplace({
      _type: 'listing',
      _id: id,
      Highlight: isHighlight,
      Event: event,
      Location: {
        _type: 'reference',
        _ref: locationId,
        _weak: true
      },
      StartDate: startDate,
      EndDate: endDate,

    });
  }

  

  return new Response('Hello');

}
