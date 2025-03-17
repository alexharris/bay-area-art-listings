import { createClient as createSanityClient } from '@sanity/client';

export async function GET() {
  console.log('hello')

  const sanity = createSanityClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
  });

  async function getListings() {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekDate = nextWeek.toISOString().split('T')[0];

    let existingLocations = await sanity.fetch(`*[_type == "listing" && StartDate >= "${today}" && StartDate <= "${nextWeekDate}"]`);
    const formattedListings = existingLocations.map(location => {
        return `Title: ${location.Event}\nStart Date: ${location.StartDate}\nEnd Date: ${location.EndDate}\n\n`;
    }).join('');

    return formattedListings;
  }

  var formattedListings = await getListings()

  console.log(formattedListings)


  return new Response(JSON.stringify({ message: 'Hello World' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}