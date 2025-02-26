import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function Location({ params }) {
  const id = (await params).id;
  const listing = await client.fetch(`*[_type == "listing" && _id == $id][0]`, { id });

  return (
    <div className="p-4 prose">
      <h1>{listing.Event}</h1>
    </div>
  );
}

