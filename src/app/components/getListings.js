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
        "locationUrl": Location->Url,
        "locationGeolocation": Location->Geolocation,
        "locationHours": Location->Hours
      }
    `, { today });    


    // combine them
    data = data.map((listing) => {
      let eventImageUrl = null;
      let eventImageCaption = null;
      
      // Uploaded image takes priority over URL string
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


