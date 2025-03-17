import { createClient as createSanityClient } from '@sanity/client';

export async function GET() {
  console.log('hello')




  return new Response(JSON.stringify({ message: 'Hello World' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}