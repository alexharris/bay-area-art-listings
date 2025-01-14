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

  let locationData = []

  // get all of the existing locations
  try {
    locationData = await client.fetch('*[_type == "location"]');
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  } 

  // go through the items being uploaded
  try {
    for (const item of data) {
      // check if the location in the item exists in the existing locations

      const locationExistsAlready = locationData.some(location => location.Name === item['Location']);
      let locationId = ''

      if (!locationExistsAlready) {
        // if it does not, create it
        console.log(`Location ${item['Location']} does not exist in locationData`);
        const locationResponse = await client.create({
          _type: 'location',
          Name: item['Location']
        })
        console.log('Data uploaded successfully:', locationResponse);
        locationId = locationResponse._id;
      } else {
        // if it does, get the id
        console.log(locationData.find(location => location.Name === item['Location']))
        locationId = locationData.find(location => location.Name === item['Location'])._id;
      }

    

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

  setTimeout(() => {
  }, 10000);
}