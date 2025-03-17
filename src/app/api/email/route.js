import * as postmark from 'postmark';
import { createClient as createSanityClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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


export async function POST(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }
  
  var formattedListings = await getListings()
  
  var emails = await getEmails()
console.log(emails)

try {
    for (const email of emails) {
        const response = await client.sendEmail({
            "From": "hello@alexharris.online",
            "To": email,
            "Subject": "Hello World from Vercel Serverless",
            "TextBody": formattedListings,
            "MessageStream": "broadcast"
        });
        console.log(`Email sent to ${email}:`, response);
    }

    return new Response(JSON.stringify({ message: 'Emails sent successfully' }), { status: 200 });
} catch (error) {
    console.error('Error sending emails:', error);
    return new Response(JSON.stringify({ message: 'Error sending emails', error: error.message }), { status: 500 });
}
}
