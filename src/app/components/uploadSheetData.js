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
  let locationData = [];
  let newLocations = [];

  // get all of the existing locations
  try {
    locationData = await client.fetch('*[_type == "location"]');
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }

  // go through the new items and get the locations
  for (const item of data) {
    newLocations.push(item['Location']);
  }

  newLocations = [...new Set(newLocations)];
  console.log(newLocations);

  // add the new locations
  for (const location of newLocations) {
    // check if it exists
    const locationExistsAlready = locationData.some(existingLocation => existingLocation.Name === location);
    // if it does not exist
    if (!locationExistsAlready) {
    // create it
      const locationResponse = await client.create({
        _type: 'location',
        Name: location
      });
      console.log('Data uploaded successfully:', locationResponse);
    }
  }


  // go through the items being uploaded
  // we know that all locations exist, but we still need the id

  // get location data now that new ones have been added
  try {
    locationData = await client.fetch('*[_type == "location"]');
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }

  try {

    for (const item of data) {
      // check if the location in the item exists in the existing locations

      let locationId = locationData.find(location => location.Name === item['Location'])._id;
    
      // remove the location because we are replacing it with a reference
      delete item['Location'];

      const response = await client.create({
        _type: 'listing',
        Location: {
          _type: 'reference',
          _ref: locationId,
          _weak: true
        },
        ...item
      });
      console.log('Data uploaded successfully:', response);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }

  setTimeout(() => {}, 10000);
}