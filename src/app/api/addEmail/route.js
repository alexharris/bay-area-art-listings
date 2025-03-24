import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function POST(request) {
  try {
    // Log to confirm the request is received
    console.log('Request received');

    // Parse the JSON body from the request
    const body = await request.json();
    console.log('Parsed body:', body);

    const { email } = body;

    if (!email) {
      console.error('Email is missing in the request body');
      return new Response('Email is required', { status: 400 });
    }

    console.log('Email:', email); // Log the email to ensure it's being received

    // Insert into Supabase
    const { error } = await supabase
      .from('emails')
      .insert([{ email: email }]);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
