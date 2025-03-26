import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export async function getLocationFromRef(ref) {
    return client.fetch(`*[_type == "location" && _id == "${ref}"]`);
}
