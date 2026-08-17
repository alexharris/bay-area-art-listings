import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

async function getDigestListings() {
  return sanity.fetch(`
    *[_type == "listing" && includeInDigest == true] | order(_updatedAt desc) {
      _id,
      Event,
      EventUrl,
      StartDate,
      EndDate,
      DateOverride,
      "imageUrl": EventImageUpload.asset->url,
      "location": Location-> {
        Name,
        Address,
        Url,
        county
      }
    }
  `)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function buildBlocks(listings) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const blocks = []

  // Header
  blocks.push({ type: 'heading', level: 1, text: 'Bay Area Art Digest' })
  blocks.push({ type: 'paragraph', text: today })
  blocks.push({ type: 'paragraph', text: '' })

  listings.forEach((listing, i) => {
    const dates = listing.DateOverride
      ? listing.DateOverride
      : [formatDate(listing.StartDate), formatDate(listing.EndDate)].filter(Boolean).join(' – ')

    const venue = listing.location?.Name || ''
    const address = listing.location?.Address || ''
    const county = listing.location?.county ? `${listing.location.county} County` : ''
    const eventUrl = listing.EventUrl || ''
    const imageUrl = listing.imageUrl ? `${listing.imageUrl}?w=800&auto=format` : null

    // Image
    if (imageUrl) {
      blocks.push({ type: 'image', imageUrl, alt: listing.Event || '' })
    }

    // Title
    blocks.push({ type: 'heading', level: 2, text: listing.Event || 'Untitled' })

    // Venue + address
    const venueAddressParts = [venue, address, county].filter(Boolean)
    if (venueAddressParts.length) {
      blocks.push({ type: 'paragraph', text: venueAddressParts.join(' · ') })
    }

    // Dates
    if (dates) {
      blocks.push({ type: 'paragraph', text: dates })
    }

    // Link button
    if (eventUrl) {
      blocks.push({ type: 'button', text: 'View show', href: eventUrl })
    }

    // Spacer between listings
    if (i < listings.length - 1) {
      blocks.push({ type: 'paragraph', text: '' })
      blocks.push({ type: 'paragraph', text: '' })
    }
  })

  return blocks
}

async function createBeehiivDraft(subject, blocks) {
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: subject,
      subject,
      blocks,
      status: 'draft',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Beehiiv API error: ${res.status} ${err}`)
  }

  return res.json()
}

async function clearDigestFlags(ids) {
  await Promise.all(ids.map(id =>
    sanity.patch(id).set({ includeInDigest: false }).commit()
  ))
}

async function main() {
  console.log('Fetching digest listings from Sanity…')
  const listings = await getDigestListings()

  if (!listings.length) {
    console.log('No listings flagged for digest. Nothing to send.')
    return
  }

  console.log(`Found ${listings.length} listing(s):`)
  listings.forEach(l => console.log(`  • ${l.Event} (${l.location?.county || 'no county'})`))

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const subject = `Bay Area Art Digest — ${today}`
  const blocks = buildBlocks(listings)

  console.log('\nCreating Beehiiv draft…')
  const draft = await createBeehiivDraft(subject, blocks)
  console.log(`✓ Draft created: ${draft.data?.id}`)
  console.log(`  Subject: ${subject}`)

  console.log('\nClearing includeInDigest flags on Sanity…')
  await clearDigestFlags(listings.map(l => l._id))
  console.log('✓ Flags cleared.')

  console.log('\nDone. Review your draft in Beehiiv and send when ready.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
