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

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const short = {Monday:'Mon',Tuesday:'Tue',Wednesday:'Wed',Thursday:'Thu',Friday:'Fri',Saturday:'Sat',Sunday:'Sun'};

function formatSnapshot(hours) {
  return days.map(d => `${short[d]}: ${hours?.[d] || 'Closed'}`).join('\n');
}

function hoursAreEqual(stored, fresh) {
  return days.every(day => (stored?.[day] ?? null) === (fresh?.[day] ?? null));
}

export async function GET() {
  // Query all locations with a GoogleID
  const locations = await sanityClient.fetch(
    `*[_type == "location" && defined(GoogleID)] {
      _id, Name, GoogleID, Hours, hoursManualOverride
    }`
  );

  const summary = { total: locations.length, refreshed: 0, changed: 0, overridden: 0, errors: 0 };
  const baseUrl = process.env.URL || 'http://localhost:3333';

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];

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

      const googleHours = data.Hours;
      const snapshot = googleHours ? formatSnapshot(googleHours) : '(No hours data from Google)';
      const hoursChanged = googleHours ? !hoursAreEqual(location.Hours, googleHours) : false;
      const manualOverride = location.hoursManualOverride ?? false;

      const patch = sanityClient.patch(location._id).set({ googleHoursSnapshot: snapshot });

      if (hoursChanged && !manualOverride) {
        patch.set({ Hours: googleHours });
        summary.changed++;
      } else if (hoursChanged && manualOverride) {
        summary.overridden++;
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
