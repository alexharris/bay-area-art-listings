export const maxDuration = 300;

import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: 'ride9vgj',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: 'v2022-03-07',
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hoursAreEqual(stored, fresh) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.every(day => (stored?.[day] ?? null) === (fresh?.[day] ?? null));
}

export async function GET() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Query all locations with a GoogleID that are stale or never synced
  const staleLocations = await sanityClient.fetch(
    `*[_type == "location" && defined(GoogleID) && (
      !defined(hoursLastSyncedAt) || hoursLastSyncedAt < $cutoff
    )] {
      _id, Name, GoogleID, Hours, hoursLastSyncedAt
    }`,
    { cutoff: thirtyDaysAgo }
  );

  const summary = { total: staleLocations.length, refreshed: 0, changed: 0, errors: 0 };
  const baseUrl = process.env.URL || 'http://localhost:3333';

  for (let i = 0; i < staleLocations.length; i++) {
    const location = staleLocations[i];

    // Small delay between calls to avoid rate limiting
    if (i > 0) await delay(200);

    try {
      const response = await fetch(`${baseUrl}/api/google-place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: location.GoogleID }),
      });

      if (!response.ok) {
        console.error(`Failed to fetch hours for ${location.Name}: ${response.status}`);
        summary.errors++;
        continue;
      }

      const { data, error } = await response.json();
      if (error || !data) {
        console.error(`API error for ${location.Name}:`, error);
        summary.errors++;
        continue;
      }

      const now = new Date().toISOString();
      const hoursChanged = !hoursAreEqual(location.Hours, data.Hours);

      const patch = sanityClient.patch(location._id).set({
        Hours: data.Hours,
        hoursLastSyncedAt: now,
        hoursPendingReview: hoursChanged,
      });

      if (hoursChanged) {
        patch.set({ hoursChangedAt: now });
        summary.changed++;
      }

      await patch.commit();
      summary.refreshed++;
    } catch (err) {
      console.error(`Error processing ${location.Name}:`, err);
      summary.errors++;
    }
  }

  return Response.json(summary);
}

export async function POST() {
  return GET();
}
