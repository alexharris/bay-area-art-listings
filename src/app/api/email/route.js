const postmark = require('postmark');

const { createClient: createSanityClient } = require('@sanity/client');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');


const serverToken = process.env.POSTMARK_SERVER_TOKEN;
const client = new postmark.ServerClient(serverToken);

const sanity = createSanityClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

const supabase = createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)


async function getEmails() {
    const { data, error } = await supabase
        .from('emails')
        .select('email');

    if (error) {
        console.error('Error fetching emails:', error);
        return [];
    }

    return data.map(record => record.email);
}

const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekDate = nextWeek.toISOString().split('T')[0];


async function getListings() {

    let listings = await sanity.fetch(`*[_type == "listing" && StartDate >= "${today}" && StartDate <= "${nextWeekDate}"]`);
    
    // get the locations reference by the listing
    const locations = await Promise.all(listings.map(async listing => {
        const location = await sanity.fetch(`*[_type == "location" && _id == "${listing.Location._ref}"]`);
        return location
    }));
  
    // combine them
    listings = listings.map((listing, index) => ({
        ...listing,
        locationName: locations[index][0]?.Name || 'Unknown',
        locationAddress: locations[index][0]?.Address || 'Address Not Listed',
        locationUrl: locations[index][0]?.Url || ''
    }));
   

      
    // const formattedListings = listings.map(listing => {
    //     return `Title: ${listing.Event}\nStart Date: ${listing.StartDate}\nEnd Date: ${listing.EndDate}\n\n`;
    // }).join('');

    listings = listings.map(listing => ({
        ...listing,
        StartDate: new Date(listing.StartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        EndDate: new Date(listing.EndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }));

      
    var listingObjects = listings.map(listing => {
        return {
            "name": listing.Event,
            "startDate": listing.StartDate,
            "endDate": listing.EndDate,
            "locationName": listing.locationName,
            "locationAddress": listing.locationAddress,
            "locationUrl": listing.locationUrl
        }
    })
    

    const formattedListings = listingObjects

    return formattedListings;
}


export async function POST(req) {
    if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
    }

    var formattedListings = await getListings()

    formattedListings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    var emails = await getEmails()

    let todayNice = new Date(today).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let nextWeekDateNice = new Date(nextWeekDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    try {
        for (const email of emails) {
            const response = await client.sendEmailWithTemplate({
                "From": "hi@artboard.info",
                "To": email,
                "TemplateAlias": "main",
                "MessageStream": "broadcast",
                "TemplateModel": {
                    "today": todayNice,
                    "nextWeekDate": nextWeekDateNice,
                    "listings": formattedListings
                }              
            });
            console.log(`Email sent to ${email}:`, response);
        }
        return new Response(JSON.stringify({ message: 'Emails sent successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error sending emails:', error);
        return new Response(JSON.stringify({ message: 'Error sending emails', error: error.message }), { status: 500 });
    }
}
