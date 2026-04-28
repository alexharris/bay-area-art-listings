#!/usr/bin/env node
/**
 * One-time migration: populate the `county` field on all location documents
 * by extracting the 5-digit zip from each Address and looking it up in
 * bay-area-zipcodes.json.
 *
 * Run: node scripts/migrate-county.js
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_WRITE_TOKEN
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@sanity/client');
const { readFileSync } = require('fs');
const { join } = require('path');

const zipcodeData = JSON.parse(
  readFileSync(join(__dirname, '../src/data/bay-area-zipcodes.json'), 'utf8')
);

// Build zip → county lookup (first match wins)
const zipToCounty = {};
for (const { county, zipcodes } of zipcodeData) {
  for (const zip of zipcodes) {
    if (!zipToCounty[zip]) {
      zipToCounty[zip] = county;
    }
  }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-12-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function run() {
  const locations = await client.fetch(`*[_type == "location"]{ _id, Name, Address, county }`);
  console.log(`Found ${locations.length} location documents.`);

  let updated = 0;
  const noZip = [];

  for (const loc of locations) {
    const zipMatch = loc.Address?.match(/\b(\d{5})\b/);
    if (!zipMatch) {
      noZip.push({ id: loc._id, name: loc.Name, address: loc.Address });
      continue;
    }

    const zip = zipMatch[1];
    const county = zipToCounty[zip];

    if (!county) {
      noZip.push({ id: loc._id, name: loc.Name, address: loc.Address, zip });
      continue;
    }

    if (loc.county === county) {
      console.log(`  skip  ${loc.Name} — already "${county}"`);
      continue;
    }

    await client.patch(loc._id).set({ county }).commit();
    console.log(`  set   ${loc.Name} → ${county}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} locations.`);

  if (noZip.length > 0) {
    console.log(`\nCould not determine county for ${noZip.length} location(s) — set manually in Studio:`);
    for (const l of noZip) {
      console.log(`  ${l.name} (${l.id}) — address: ${l.address ?? 'none'}${l.zip ? ` zip: ${l.zip}` : ''}`);
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
