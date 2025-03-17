export const dynamic = "force-dynamic";

import postmark from 'postmark';

const serverToken = process.env.POSTMARK_SERVER_TOKEN;

if (!serverToken) {
  throw new Error('POSTMARK_SERVER_TOKEN environment variable is not set');
}

const client = new postmark.ServerClient(serverToken);

export async function GET() {
  console.log('hello');

  try {
    const response = await client.sendEmail({
      "From": "hello@alexharris.online",
      "To": "hello@alexharris.online",
      "Subject": "Hello World from Vercel Serverless",
      "TextBody": 'HELLO WORLD',
      "MessageStream": "broadcast"
    });
    console.log(`Email sent to hello@alexharris.online:`, response);

    return new Response(JSON.stringify({ message: 'Emails sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error sending emails:', error);
    return new Response(JSON.stringify({ message: 'Error sending emails', error: error.message }), { status: 500 });
  }

}