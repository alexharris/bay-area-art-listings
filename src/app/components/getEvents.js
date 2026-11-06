import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

// All upcoming events, whether or not they belong to an exhibition. An event linked to an
// exhibition inherits that exhibition's venue unless it has its own.
export default async function getEvents() {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    return client.fetch(`
      *[_type == "event" && date >= $today && defined(coalesce(Location._ref, listing->Location._ref))] | order(date asc) {
        _id, title, date, time, note, url,
        "relatedShow": listing->Event,
        "locationName": coalesce(Location->Name, listing->Location->Name),
        "locationAddress": coalesce(Location->Address, listing->Location->Address),
        "locationCity": coalesce(Location->City, listing->Location->City),
        "locationCounty": coalesce(Location->county, listing->Location->county),
        "locationUrl": coalesce(Location->Url, listing->Location->Url),
        "locationGeolocation": coalesce(Location->Geolocation, listing->Location->Geolocation)
      }
    `, { today });
}
