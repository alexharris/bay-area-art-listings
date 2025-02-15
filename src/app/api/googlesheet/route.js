import { google } from 'googleapis';
import {createClient} from '@sanity/client'
const { PlacesClient } = require('@googlemaps/places').v1;
const apiKey = process.env.GOOGLE_API;
const placesClient = new PlacesClient({apiKey});

// This function writes a message to the client
function writeMessageToClient(message, controller) {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(`data: ${JSON.stringify({ message })}\n\n`);
  controller.enqueue(encodedMessage);
}

// This function gets the data from the Google Sheet
// It returns an array of rows
async function getDataFromSheet(sheetName) {
  const sheets = google.sheets('v4');
  const apiKey = process.env.GOOGLE_API;
  // Get Sheet Data
  const sheetData = await sheets.spreadsheets.values.get({
    key: apiKey,
    spreadsheetId: '1uQejuXXnuVwrU1vGDwcWoM4HlZh1XHwRCVqLJE4yqOg',
    range: sheetName,
  });  
  // Get the rows from the sheet data
  const sheetRows = sheetData.data.values;
  return sheetRows;
}

async function getPlaceDetailsFromGoogle(newLocation) {
  let textQuery = newLocation + ' bay area art gallery';
  const request = {
    textQuery: textQuery
  };
  const googleQuery = await placesClient.searchText(request, {
    otherArgs: {
      headers: {
        'X-Goog-FieldMask': 'places',
      },
    },
  });   
  if(googleQuery[0].places.length === 0) {
    writeMessageToClient(`Couldn't find info about ${newLocation}`, controller);
  } else {
    return googleQuery[0].places[0]
  }
}

// This function gets the existing locations from Sanity
async function getExistingLocationsFromSanity(sanityClient) {
  let existingLocations = [];

  // Get all of the locations that already exist
  try {
    existingLocations = await sanityClient.fetch('*[_type == "location"]');
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }  
  console.log(existingLocations)
  return existingLocations
}

async function addGooglePlaceToSanity(googlePlace, newLocation, sanityClient, controller) {
  await sanityClient.create({
    _type: 'location',
    Name: googlePlace.displayName.text,
    Address: googlePlace.formattedAddress,
    GoogleID: googlePlace.id,
    Url: googlePlace.websiteUri,
    OriginalName: newLocation,
    Geolocation: {
      lat: googlePlace.location.latitude,
      lng: googlePlace.location.longitude
    }    
  });
  
  writeMessageToClient(`${googlePlace.displayName.text} added to Sanity.`, controller);

  return
}

async function addListingsToSanity(sheetRows, sanityClient, controller) {
  for (let i = 1; i < sheetRows.length; i++) {

    const row = sheetRows[i];
    const id = row[0];
    const highlight = row[1] 
    const isHighlight = highlight ? true : false;
    const listingTitle = row[2];
    let startDate = row[4];
    let endDate = row[5];

    // Format dates
    // if the date has a year, leave it alone, otherwise add the current year
    console.log(startDate, endDate)
    // Dates have format MMMM DD, YYYY
    if(startDate.split(',').length === 1) {
      startDate = startDate + ', ' + new Date().getFullYear();
    }
    if(endDate.split(',').length === 1) {
      endDate = endDate + ', ' + new Date().getFullYear();
    }
    // now convert start and end date to to YYYY-MM-DD
    startDate = new Date(startDate).toISOString().split('T')[0];
    endDate = new Date(endDate).toISOString().split('T')[0];


    // Use the spreadsheet location name to find the corresponding location in Sanity
    let updatedExistingLocations = await sanityClient.fetch('*[_type == "location"]');
    let locationId = updatedExistingLocations.find(location => location.OriginalName === row[3])._id;

    await sanityClient.createOrReplace({
      _type: 'listing',
      _id: id,
      Highlight: isHighlight,
      Event: listingTitle,
      Location: {
        _type: 'reference',
        _ref: locationId,
        _weak: true
      },
      StartDate: startDate,
      EndDate: endDate,
    }).then((listingResponse) => {
      // writeMessageToClient(`Added listing: ${listingTitle}`, controller);
    }).catch((error) => {
      // console.error('Error adding listing:', error);
      // writeMessageToClient(`Unable to add listing: ${listingTitle}. Reason ${error}`, controller);
    });
  }
}

export async function GET(req, res) {
  
  // Get the message from query parameters
  // used to determine the sheet to fetch
  const url = new URL(req.url);
  const sheetName = url.searchParams.get('sheet');
  console.log(sheetName)

  // Create Sanity Client
  const sanityClient = createClient({
    projectId: 'ride9vgj',
    dataset: 'development',
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
    apiVersion: 'v2022-03-07'
  });
  // Create a new ReadableStream
  // used to stream data to the client
  const readableStream = new ReadableStream({
    async start(controller) {
      writeMessageToClient(`Beginning process.`, controller);
      // Get the existing locations from Sanity
      let existingLocations = await getExistingLocationsFromSanity(sanityClient);
      // Get the new locations from the Google Sheet
      let newLocations = [];
      let sheetRows = await getDataFromSheet(sheetName);
      // Go through the new items and get the locations
      for (let i = 1; i < sheetRows.length; i++) {
        newLocations.push(sheetRows[i][3]);
      }
      // Reduce to a single set, no duplicates
      newLocations = [...new Set(newLocations)];
      // Go through the new locations and check if they exist
      for (const newLocation of newLocations) {
        writeMessageToClient(`Checking ${newLocation}`, controller);
        const locationExistsAlready = existingLocations.some(existingLocation => existingLocation.OriginalName === newLocation);
        if (!locationExistsAlready) {
          writeMessageToClient(`Location does not exist: ${newLocation}. Googling it.`, controller);
          let googlePlace = await getPlaceDetailsFromGoogle(newLocation);
          if(googlePlace) {
            writeMessageToClient(`Found info about ${newLocation}. Adding to Sanity`, controller);
            await addGooglePlaceToSanity(googlePlace, newLocation, sanityClient, controller);
          } else {
            writeMessageToClient(`Couldn't find info about ${newLocation}. Manually Review.`, controller);
          }

        } else {
          writeMessageToClient(`Location exists: ${newLocation}`, controller);
        }
      }

      // With locations done, now we put up the listings
      writeMessageToClient('--------------------', controller);
      await addListingsToSanity(sheetRows, sanityClient, controller);

      writeMessageToClient('Upload finished', controller);
      controller.close();
    }
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*', // Add CORS headers
    }
  });
}