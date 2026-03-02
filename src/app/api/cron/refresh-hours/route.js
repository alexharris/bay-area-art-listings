export const maxDuration = 60;

import { createClient } from '@sanity/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const postmark = require('postmark');

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

function hoursAreEqual(stored, fresh) {
  return days.every(day => (stored?.[day] ?? null) === (fresh?.[day] ?? null));
}

const NOTIFY_EMAILS = ['hi@artboard.info'];

async function sendSummaryEmail(summary, changedVenues) {
  const mailer = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let body;
  if (summary.changed === 0 && summary.errors === 0) {
    body = `Hours sync ran on ${date}. All ${summary.refreshed} venues checked — no changes.`;
  } else {
    const lines = [`Hours sync ran on ${date}.`, ``];
    lines.push(`Checked: ${summary.refreshed} of ${summary.total} venues`);
    if (summary.changed > 0) lines.push(`Updated: ${summary.changed} (${changedVenues.join(', ')})`);
    if (summary.overridden > 0) lines.push(`Skipped (override): ${summary.overridden}`);
    if (summary.errors > 0) lines.push(`Errors: ${summary.errors}`);
    body = lines.join('\n');
  }

  for (const to of NOTIFY_EMAILS) {
    const result = await mailer.sendEmail({
      From: 'hi@artboard.info',
      To: to,
      Subject: `Hours sync — ${date}`,
      TextBody: body,
      MessageStream: 'outbound',
    });
    console.log(`Hours sync email sent to ${to} — MessageID: ${result.MessageID}, ErrorCode: ${result.ErrorCode}`);
  }
}

export async function GET() {
  // Query all locations with a GoogleID
  const locations = await sanityClient.fetch(
    `*[_type == "location" && defined(GoogleID)] {
      _id, Name, GoogleID, Hours, hoursManualOverride
    }`
  );

  const summary = { total: locations.length, refreshed: 0, changed: 0, overridden: 0, errors: 0 };
  const changedVenues = [];
  const baseUrl = process.env.URL || 'http://localhost:3333';

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];

    if (i > 0) await delay(100);

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
      const hoursChanged = googleHours ? !hoursAreEqual(location.Hours, googleHours) : false;
      const manualOverride = location.hoursManualOverride ?? false;

      summary.refreshed++;

      if (!hoursChanged) continue;

      if (manualOverride) {
        summary.overridden++;
        continue;
      }

      await sanityClient.patch(location._id).set({ Hours: googleHours }).commit();
      summary.changed++;
      changedVenues.push(location.Name);
    } catch (err) {
      console.error(`Error processing ${location.Name}:`, err);
      summary.errors++;
    }
  }

  try {
    await sendSummaryEmail(summary, changedVenues);
  } catch (err) {
    console.error('Failed to send hours sync summary email:', err);
  }

  return Response.json(summary);
}

export async function POST() {
  return GET();
}
