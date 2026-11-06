#!/usr/bin/env node
/**
 * One-time migration: turn each entry in a listing's inline `openings` array into a
 * standalone `event` document that references the listing.
 *
 *   node scripts/migrate-openings-to-events.js --backup <file>            # dry run (default)
 *   node scripts/migrate-openings-to-events.js --backup <file> --apply    # create event docs
 *   node scripts/migrate-openings-to-events.js --backup <file> --apply --unset
 *        # ...and remove `openings` from the listings (only after verifying the site)
 *
 * Event IDs are deterministic (event-<listingId>-<key>), so re-running is safe.
 * Events inherit their venue from the listing (no Location copied).
 * If a listing has a draft, the draft's openings win (they are the latest edits).
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const { writeFileSync } = require('fs');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const unset = args.includes('--unset');
const backupPath = args[args.indexOf('--backup') + 1];
if (!backupPath || backupPath.startsWith('--')) {
  console.error('Missing --backup <file>');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-12-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
});

const baseId = id => id.replace(/^drafts\./, '');

async function main() {
  const docs = await client.fetch(
    `*[_type == "listing" && defined(openings) && count(openings) > 0]{_id, Event, openings}`
  );
  writeFileSync(backupPath, JSON.stringify(docs, null, 2));
  console.log(`Backed up ${docs.length} listing docs (raw, incl. drafts) → ${backupPath}`);

  // Group by base id; drafts win
  const byBase = new Map();
  for (const d of docs) {
    const b = baseId(d._id);
    const isDraft = d._id.startsWith('drafts.');
    if (!byBase.has(b) || isDraft) byBase.set(b, { ...d, isDraft });
  }

  const events = [];
  for (const [b, d] of byBase) {
    for (const o of d.openings) {
      if (!o.date || !o.title) { console.warn(`  skipping incomplete opening on "${d.Event}"`, o); continue; }
      events.push({
        _id: `event-${b}-${o._key}`,
        _type: 'event',
        title: o.title,
        date: o.date,
        ...(o.time && { time: o.time }),
        ...(o.note && { note: o.note }),
        listing: { _type: 'reference', _ref: b, _weak: true },
      });
    }
  }
  console.log(`${byBase.size} listings, ${events.length} events to create`);

  if (!apply) {
    console.log('Dry run — sample:', JSON.stringify(events.slice(0, 3), null, 2));
    return;
  }

  for (let i = 0; i < events.length; i += 100) {
    const tx = client.transaction();
    events.slice(i, i + 100).forEach(e => tx.createIfNotExists(e));
    await tx.commit();
  }
  const created = await client.fetch(`count(*[_type == "event" && _id in $ids])`, { ids: events.map(e => e._id) });
  console.log(`Verified ${created}/${events.length} event docs exist`);
  if (created !== events.length) { console.error('Count mismatch — not unsetting.'); process.exit(1); }

  if (unset) {
    for (let i = 0; i < docs.length; i += 100) {
      const tx = client.transaction();
      docs.slice(i, i + 100).forEach(d => tx.patch(d._id, p => p.unset(['openings'])));
      await tx.commit();
    }
    console.log(`Removed openings from ${docs.length} listing docs`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
