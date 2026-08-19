import Anthropic from '@anthropic-ai/sdk'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { createClient } from '@sanity/client'

// Lazy-initialized clients — created on first use so the module can be imported
// at build time even when env vars aren't available in the build environment.
let _sanity = null
let _sanityProduction = null
let _anthropic = null

function getSanityClient() {
  if (!_sanity) {
    _sanity = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-26',
    })
  }
  return _sanity
}

function getSanityProductionClient() {
  if (!_sanityProduction) {
    _sanityProduction = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: 'production',
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-26',
    })
  }
  return _sanityProduction
}

function getAnthropic() {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _anthropic
}

const BLOCKED_DOMAINS = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'pinterest.com', 'youtube.com', 't.co', 'fb.com', 'tiktok.com', 'threads.net', 'bsky.app', 'mailchi.mp', 'campaign-archive.com', 'createsend.com', 'cmail19.com', 'cmail20.com']
// Patterns that indicate a "view email in browser" or unsubscribe-style link — drop entirely
const BLOCKED_URL_PATTERNS = ['mailtrack', '/open.aspx', '/archive/', 'campaign-archive', 'emailviewonline', 'view-online', 'viewonline']
// Patterns that indicate a click-tracking redirect — keep but resolve to real URL
const TRACKING_URL_PATTERNS = ['/ls/click', '/wf/click', '/click?upn=', 'trk.klclick']

const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'mc_cid', 'mc_eid', 'fbclid', 'gclid', '_hsenc', '_hsmi', 'mkt_tok', 'yclid', 'ref', 'email_id', 'trk', 'trkCampaign']

function cleanUrl(url) {
  try {
    const u = new URL(url)
    TRACKING_PARAMS.forEach(p => u.searchParams.delete(p))
    return u.toString()
  } catch {
    return url
  }
}

function looksLikeRedirect(url) {
  try {
    const u = new URL(url)
    const subdomain = u.hostname.split('.')[0].toLowerCase()
    // Known broadcast/email/tracking subdomains
    if (['broadcast', 'email', 'links', 'link', 'go', 'click', 'track', 'mailings', 'r', 'e', 'redirect'].includes(subdomain)) return true
    // Mailchimp and similar tracking domains
    if (u.hostname.includes('list-manage.com')) return true
    // Known click-tracking URL patterns (Constant Contact /ls/click, etc.)
    if (TRACKING_URL_PATTERNS.some(p => url.includes(p))) return true
    // Short path prefix + long opaque string: /l/abc123xyz, /t/r-l-token-, etc.
    if (/^\/[a-z]{1,3}\/[a-zA-Z0-9_-]{10,}/i.test(u.pathname)) return true
    return false
  } catch {
    return false
  }
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

async function resolveRedirect(url, timeoutMs = 6000) {
  // Try HEAD first (lightweight), then GET — some servers block HEAD or require GET to trigger redirect
  for (const method of ['HEAD', 'GET']) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: BROWSER_HEADERS,
      })
      clearTimeout(timer)
      const final = response.url
      if (final && final !== url) return cleanUrl(final)
    } catch {}
  }
  return url
}
const BLOCKED_TEXT = ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'youtube', 'tiktok', 'unsubscribe', 'update your preferences', 'update preferences', 'manage preferences', 'email preferences', 'why did i get this', 'opt out', 'opt-out', 'view in browser', 'view this email', 'view email in browser', 'view this email in your browser', 'view as webpage', 'view as a web page', 'read email online', 'read this email online', 'read online', 'having trouble viewing', 'trouble viewing this email', 'forward to a friend', 'privacy policy', 'terms of service', 'terms of use']

const EMAIL_ARCHIVE_DOMAINS = ['mailchi.mp', 'campaign-archive.com', 'createsend.com', 'cmail19.com', 'cmail20.com']
const BROWSER_LINK_TERMS = ['view in browser', 'view this email', 'view email in browser', 'view this email in your browser', 'view as a web page', 'view as webpage', 'having trouble viewing', 'trouble viewing this email', 'read email online', 'read this email online', 'read online']
// URL patterns that indicate a "view email in browser" link even if the text doesn't match
const BROWSER_URL_PATTERNS = ['viewonline', 'view-online', 'emailviewonline', 'readonline']

function extractBrowserLink(html) {
  if (!html) return null
  for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = m[1]
    const rawText = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    const lowerText = rawText.toLowerCase()
    const lowerUrl = url.toLowerCase()
    const isArchiveDomain = EMAIL_ARCHIVE_DOMAINS.some(d => lowerUrl.includes(d))
    const isBrowserText = BROWSER_LINK_TERMS.some(t => lowerText.includes(t))
    const isBrowserUrl = BROWSER_URL_PATTERNS.some(p => lowerUrl.includes(p))
    if (url.startsWith('http') && (isBrowserText || isArchiveDomain || isBrowserUrl)) {
      // Use the actual link text so it's clear what kind of link this is
      return { url, text: rawText || 'View email online' }
    }
  }
  return null
}

function extractLinksFromHtml(html) {
  if (!html) return []
  const matches = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
  return matches
    .map(m => ({ url: cleanUrl(m[1]), text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }))
    .filter(l => {
      const lowerUrl = l.url.toLowerCase()
      const lowerText = l.text.toLowerCase()
      return (
        l.url.startsWith('http') &&
        l.text.length > 1 &&
        l.text.length < 120 &&
        !BLOCKED_DOMAINS.some(d => lowerUrl.includes(d)) &&
        !BLOCKED_URL_PATTERNS.some(p => lowerUrl.includes(p)) &&
        !BLOCKED_TEXT.some(t => lowerText === t || lowerText.includes(t))
      )
    })
    .slice(0, 15)
}

function extractImagesFromHtml(html) {
  if (!html) return []
  const totalLength = html.length
  const blockedSrc = ['track', 'pixel', 'open.php', 'beacon', 'spacer', 'list-manage', 'emltrk', 'mandrillapp', 'S.gif', 'facebook', 'twitter', 'instagram', 'pinterest', 'referralLogo', 'SocialIcon', 'ShareBar', 'ConstantContact', 'logo', 'banner', 'header', 'footer', 'icon', 'avatar', 'badge']
  const blockedAlt = ['logo', 'banner', 'header', 'footer', 'icon', 'facebook', 'twitter', 'instagram', 'pinterest', 'youtube', 'tiktok', 'unsubscribe']
  return [...html.matchAll(/<img([^>]+)>/gi)]
    .map(m => {
      const tag = m[1]
      const src = (tag.match(/src=["']([^"']+)["']/i) || [])[1]
      const alt = (tag.match(/alt=["']([^"']*)["']/i) || [])[1] || ''
      const width = parseInt((tag.match(/width=["']?(\d+)/i) || [])[1]) || null
      const height = parseInt((tag.match(/height=["']?(\d+)/i) || [])[1]) || null
      const position = Math.round((m.index / totalLength) * 100)

      // Look for caption text immediately after the image tag
      const after = html.slice(m.index + m[0].length, m.index + m[0].length + 600)
      const figcaption = (after.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i) || [])[1]
      // Also try first short text node in next element (td, p, div, span) if it looks like a caption
      const nearEl = (after.match(/<(?:p|div|td|span)[^>]*>\s*([\s\S]{10,200}?)\s*<\/(?:p|div|td|span)>/i) || [])[1]
      const raw = figcaption || (nearEl && !/<img/i.test(nearEl) ? nearEl : '')
      const caption = raw ? raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) : null

      return { src, alt, width, height, position, caption: caption || null }
    })
    .filter(img =>
      img.src?.startsWith('http') &&
      !blockedSrc.some(b => img.src.toLowerCase().includes(b)) &&
      !blockedAlt.some(b => img.alt.toLowerCase().includes(b)) &&
      (img.width === null || img.width > 100) &&
      (img.height === null || img.height > 100)
    )
    .slice(0, 10)
}

function extractCaptionsFromText(text) {
  if (!text) return []
  const captionStart = /^(pictured|image|photo|artwork|works?|above|below|left|right|top|bottom|l\.?-?r\.?)[,: ]/i
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => captionStart.test(l) && l.length > 15 && l.length < 300)
}

async function extractListingData(subject, textBody, htmlBody, locations = [], currentYear = new Date().getFullYear()) {
  const rawLinks = extractLinksFromHtml(htmlBody)
  const images = extractImagesFromHtml(htmlBody)
  const textCaptions = extractCaptionsFromText(textBody)

  // Resolve tracking/redirect links so Claude sees real URLs, not opaque tracking ones
  // Sequential (not parallel) to avoid rate-limiting on tracking servers
  const links = []
  for (const l of rawLinks) {
    if (!looksLikeRedirect(l.url)) {
      links.push(l)
      continue
    }
    const resolved = await resolveRedirect(l.url, 4000)
    if (resolved === l.url) {
      console.log(`    ↳ Could not resolve redirect: ${l.url}`)
      links.push(l) // keep original so Claude can still see + use the link text context
      continue
    }
    // Drop the resolved URL if it landed on a blocked domain
    const lowerResolved = resolved.toLowerCase()
    if (BLOCKED_DOMAINS.some(d => lowerResolved.includes(d))) continue
    console.log(`    ↳ Resolved "${l.text}": ${l.url} → ${resolved}`)
    links.push({ ...l, url: resolved })
  }

  const linksSection = links.length
    ? `\nLinks found in email:\n${links.map(l => `- "${l.text}": ${l.url}`).join('\n')}`
    : ''

  const imagesSection = images.length
    ? `\nImages found in email (src | alt text | caption | width x height | position in email %):\n${images.map(i => `- ${i.src} | alt="${i.alt}" | caption="${i.caption ?? ''}" | ${i.width ?? '?'}x${i.height ?? '?'} | ${i.position}% through email`).join('\n')}\nNote: images near 0% are likely header/banner images. Prefer images later in the email. Use caption and alt text to match each image to the correct exhibition — especially important when the email contains multiple shows.`
    : ''

  const captionsSection = textCaptions.length
    ? `\nImage caption lines found in email text:\n${textCaptions.map(c => `- ${c}`).join('\n')}`
    : ''

  const response = await getAnthropic().messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Extract art exhibition information from this email and return a JSON object.

Email subject: ${subject}

Email body:
${textBody || ''}
${linksSection}
${imagesSection}
${captionsSection}

Known venues in our database:
${locations.length ? locations.map(l => `- "${l.Name}"${l.Address ? ` (${l.Address})` : ''} → id: ${l._id}`).join('\n') : '(none)'}

If this email announces multiple separate exhibitions, return one object per exhibition. Otherwise return one.

Return only a JSON array where each item represents one exhibition (use null for anything not found):
[
  {
    "title": "exhibition title only, not including the artist name",
    "locationId": "the exact _id value of the matching venue from the list above — match on gallery/museum name. Use null if not confident.",
    "artist": "for a solo show, the artist's full name; for a group show with 2-3 artists, list them separated by & (e.g. 'Jane Smith & John Doe'); for large group shows, null",
    "url": "URL of the specific exhibition page. Prefer a link whose text mentions the artist, exhibition title, 'view', 'learn more', 'details', or 'exhibition'. IMPORTANT: if a link's text clearly refers to viewing the exhibition (e.g. 'View Exhibition', 'View Exhibition Here', 'See the Show') but the URL is a tracking/redirect URL (e.g. mailings.artlogic.net, list-manage.com, broadcast.*, or any short opaque URL), STILL use it — it will be resolved automatically. Only avoid links that are clearly for viewing the email itself in a browser (mailchi.mp archive links, campaign-archive.com, or links with text like 'view this email', 'view in browser', 'read online'). CRITICAL: when the email contains multiple exhibitions, never use one exhibition's URL for another. Never guess or construct a URL. Never borrow a URL pattern from another exhibition in the same email. If you cannot find a link that specifically and unambiguously belongs to this exhibition, use null.",
    "galleryUrl": "the gallery or museum homepage URL — typically the root domain linked from the header/footer (e.g. 'https://gallery.com'). null if not found.",
    "imageUrl": "URL of the main exhibition artwork image — use caption, alt text, and position to match the correct image to this specific exhibition's section of the email. Ignore logos, banners, and social media icons.",
    "candidateImageUrls": ["up to 3 artwork image URLs that belong to this exhibition's section of the email — use position data to assign images to the correct show. Most relevant first."],
    "startDate": "YYYY-MM-DD or null. CRITICAL: if no year is explicitly stated in the email, always use ${currentYear}. Never infer the year from the day of the week or any other reasoning. Never use a past year.",
    "endDate": "YYYY-MM-DD or null. Same rule: if no year is stated, use ${currentYear}.",
    "openings": [
      {
        "title": "use 'Opening Reception' if it's a reception for the opening of the show, regardless of how the email words it. If the event also includes something else (e.g. an artist talk, performance, panel), append it: 'Opening Reception & Artist Talk'. Use exact wording only for standalone non-opening events like 'Closing Reception', 'Artist Talk', 'Panel Discussion'.",
        "date": "YYYY-MM-DD",
        "time": "e.g. 6–9pm",
        "note": "any extra detail or null"
      }
    ],
    "description": "the full exhibition description text for this specific exhibition only, plain text only.",
    "warnings": ["issues to flag for the reviewer. Use only these specific warnings where applicable — do not invent other warning types: 'Exhibition URL could not be found' (if no exhibition-specific URL exists), 'Multiple date ranges found — review dates before publishing' (if the email contains complex or multiple date ranges that don't fit neatly into start/end dates), 'Other events and possible exhibitions found in email — review source if needed' (if the email contains non-exhibition events like workshops, talks, job postings, other exhibitions, or other noise alongside the main exhibition). Omit entirely if no issues."],
    "decisions": {
      "title": "how you determined the exhibition title",
      "artist": "how you identified the artist(s), or why you left it blank",
      "image": "which image you selected and why — describe what it looks like",
      "url": "which URL you chose as the exhibition link and why — if this email has multiple exhibitions, confirm this URL is specifically for THIS exhibition and not borrowed from another one in the same email",
      "location": "how you matched the venue, or why no match was found",
      "dates": "how you identified the start and end dates",
      "openings": "how you identified opening/event details, or null if none"
    }
  }
]

Return only the raw JSON array, no markdown, no explanation.`
    }]
  })

  try {
    const text = response.content[0].text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
    const parsed = JSON.parse(text)
    const listings = Array.isArray(parsed) ? parsed : [parsed]
    return { listings, images, links }
  } catch {
    return { listings: [], images, links }
  }
}

function makeKey() {
  return Math.random().toString(36).slice(2, 11)
}

function toPortableText(text) {
  if (!text) return []
  return text.split(/\n{2,}/).filter(p => p.trim()).map(paragraph => ({
    _type: 'block',
    _key: makeKey(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: makeKey(), text: paragraph.trim(), marks: [] }],
  }))
}

const OPENING_RECEPTION_TERMS = ['reception', 'opening night', 'opening event', 'opening party', 'artist reception', 'join us', 'opening']

function normalizeOpeningTitle(title) {
  const lower = title.toLowerCase()
  if (lower === 'closing reception') return title

  const matchedTerm = OPENING_RECEPTION_TERMS.find(t => lower.includes(t))
  if (!matchedTerm) return title

  // Strip the matched opening term plus common filler words, keep the rest
  const extra = lower
    .replace(matchedTerm, '')
    .replace(/\b(and|&|\+|with|for|the|an|a|our|this|please|join|us|to)\b/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (extra.length > 2) {
    return `Opening Reception & ${extra.charAt(0).toUpperCase()}${extra.slice(1)}`
  }

  return 'Opening Reception'
}

async function createDraft(data, subject, fromEmail, messageId, candidateImages, candidateLinks, locationName, warnings = []) {
  const importLines = [
    `Imported: ${new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}`,
    `From: ${fromEmail}`,
    `Email: "${subject}"`,
    data.locationId ? `Venue: ${locationName || data.locationId}` : '⚠ No venue match — please assign manually',
    data.decisions?.dates     ? `Dates: ${data.decisions.dates}` : null,
    '',
    'Decisions:',
    data.decisions?.title     ? `Title: ${data.decisions.title}` : null,
    data.decisions?.artist    ? `Artist: ${data.decisions.artist}` : null,
    data.decisions?.image     ? `Image: ${data.decisions.image}` : null,
    data.url
      ? (data.decisions?.url ? `Link: ${data.decisions.url}` : null)
      : data.galleryUrl
        ? `Link: No exhibition URL found — using gallery homepage as fallback`
        : `Link: No exhibition URL found — please add manually`,
    data.decisions?.location  ? `Location: ${data.decisions.location}` : null,
    data.decisions?.openings  ? `Openings: ${data.decisions.openings}` : null,
  ].filter(Boolean)

  const doc = {
    _type: 'listing',
    _id: `drafts.${crypto.randomUUID()}`,
    importNotes: importLines.join('\n'),
    ...(warnings.length && { importWarnings: warnings.join('\n') }),
    ...(messageId && { emailMessageId: messageId }),
    ...(() => {
      // Prefer Claude's per-exhibition candidates; fall back to top images from email
      let urls = Array.isArray(data.candidateImageUrls) && data.candidateImageUrls.length
        ? data.candidateImageUrls.slice(0, 3)
        : candidateImages?.slice(0, 3).map(i => i.src) || []
      // Always ensure the selected image is in the list
      if (data.imageUrl && !urls.includes(data.imageUrl)) urls[2] = data.imageUrl
      return urls.length ? { candidateImageUrls: urls } : {}
    })(),
    ...(candidateLinks?.length && {
      importLinks: candidateLinks.slice(0, 8).map(l => ({ _key: makeKey(), text: l.text, url: l.url })),
    }),
  }

  if (data.title) {
    doc.Event = data.artist ? `${data.artist}: ${data.title}` : data.title
  }
  if (data.locationId) doc.Location = { _type: 'reference', _ref: data.locationId, _weak: true }
  // Prefer the specific exhibition URL; fall back to gallery homepage if nothing else found
  const eventUrl = data.url || data.galleryUrl
  if (eventUrl) doc.EventUrl = cleanUrl(eventUrl)
  if (data.imageUrl) doc.EventImageUrl = data.imageUrl
  if (data.startDate) doc.StartDate = data.startDate
  if (data.endDate) doc.EndDate = data.endDate
  if (data.description) doc.Notes = toPortableText(data.description)
  if (data.openings?.length) {
    doc.openings = data.openings
      .filter(o => o.date)
      .map(o => {
        const time = o.time || (o.startTime ? `${o.startTime}${o.endTime ? `–${o.endTime}` : ''}` : null)
        return {
          _key: makeKey(),
          title: normalizeOpeningTitle(o.title || o.description || 'Opening Reception'),
          date: o.date,
          ...(time && { time }),
          ...(o.note && { note: o.note }),
        }
      })
  }

  return await getSanityClient().create(doc)
}

async function processEmail(parsed, locations) {
  const subject = parsed.subject || '(no subject)'
  const fromEmail = parsed.from?.value?.[0]?.address || 'unknown'
  const messageId = parsed.messageId || null

  // Skip if already imported
  if (messageId) {
    const existing = await getSanityClient().fetch(
      `*[_type == "listing" && emailMessageId == $messageId][0]{ _id }`,
      { messageId }
    )
    if (existing) {
      console.log(`Skipping (already imported): "${subject}"`)
      return [{ success: true, subject, skipped: true }]
    }
  }

  console.log(`Processing: "${subject}"`)
  const browserLink = extractBrowserLink(parsed.html)
  console.log(`  → Calling Claude for "${subject}"...`)
  const { listings, images, links } = await extractListingData(subject, parsed.text, parsed.html, locations)
  console.log(`  → Claude found ${listings.length} exhibition(s) in "${subject}"`)
  if (browserLink) links.unshift(browserLink)

  // Upload image attachment if no image URL found in body
  let attachmentImageUrl = null
  if (parsed.attachments?.length) {
    const imgAttachment = parsed.attachments.find(a => a.contentType?.startsWith('image/'))
    if (imgAttachment) {
      try {
        const asset = await getSanityClient().assets.upload('image', imgAttachment.content, {
          filename: imgAttachment.filename,
          contentType: imgAttachment.contentType,
        })
        attachmentImageUrl = asset.url
      } catch {}
    }
  }

  if (listings.length === 0) {
    console.warn(`  → No exhibitions extracted from "${subject}"`)
    return [{ success: false, subject, error: 'No exhibitions found in this email' }]
  }

  const emailResults = []
  for (const data of listings) {
    if (!data.imageUrl && attachmentImageUrl) data.imageUrl = attachmentImageUrl

    // Collect warnings — start with anything Claude flagged
    const warnings = Array.isArray(data.warnings) ? [...data.warnings] : []

    // Flag missing dates — only add if Claude didn't already flag it
    if (!data.startDate && !data.endDate && !warnings.some(w => w.toLowerCase().includes('date'))) {
      warnings.push('⚠️ Dates could not be extracted from this email')
    }

    // Add gallery homepage as first candidate link if Claude found one
    const listingLinks = [...links]
    if (data.galleryUrl && !listingLinks.some(l => l.url === data.galleryUrl)) {
      listingLinks.unshift({ text: 'Gallery website', url: data.galleryUrl })
    }

    if (data.url && looksLikeRedirect(data.url)) {
      data.url = await resolveRedirect(data.url)
    }
    const matchedLocation = data.locationId ? locations.find(l => l._id === data.locationId) : null
    const draft = await createDraft(data, subject, fromEmail, messageId, images, listingLinks, matchedLocation?.Name, warnings)
    emailResults.push({ success: true, subject, sanityId: draft._id, title: draft.Event || null, warnings })
  }
  return emailResults
}

function makeImapClient() {
  return new ImapFlow({
    host: 'imap.zoho.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.ZOHO_IMAP_USER,
      pass: process.env.ZOHO_IMAP_PASSWORD,
    },
    logger: false,
  })
}

export async function importEmailsFromZoho() {
  // Fetch locations and raw email sources (with UIDs) in parallel
  console.log('Fetching locations and connecting to IMAP...')
  const [locations, emailData] = await Promise.all([
    getSanityProductionClient().fetch(`*[_type == "location" && !(_id in path("drafts.**"))]{ _id, Name, Address }`),
    (async () => {
      const client = makeImapClient()
      await client.connect()
      const data = []
      try {
        const lock = await client.getMailboxLock('1. To Import')
        try {
          const uids = await client.search({ all: true }, { uid: true })
          console.log(`Found ${uids.length} email(s) in "1. To Import"`)
          for (const uid of uids) {
            const msg = await client.fetchOne(String(uid), { source: true }, { uid: true })
            data.push({ uid, source: msg.source })
          }
        } finally {
          lock.release()
        }
      } finally {
        await client.logout()
      }
      return data
    })(),
  ])
  console.log(`${locations.length} locations, ${emailData.length} email(s) to process`)

  // Parse all emails
  const parsedEmails = await Promise.all(
    emailData.map(async ({ uid, source }) => ({ uid, parsed: await simpleParser(source) }))
  )

  // Process all emails in parallel — Claude calls run concurrently
  const settled = await Promise.allSettled(
    parsedEmails.map(({ uid, parsed }) =>
      processEmail(parsed, locations).then(results => ({ uid, results }))
    )
  )

  const allResults = []
  const uidsToMove = [] // successfully handled (imported or skipped) — move to "Imported"

  settled.forEach((s, i) => {
    if (s.status === 'fulfilled') {
      const { uid, results } = s.value
      allResults.push(...results)
      // Move if all results succeeded (imported or skipped) — leave failures in "To Import"
      if (results.length > 0 && results.every(r => r.success)) {
        uidsToMove.push(uid)
      }
    } else {
      const subject = parsedEmails[i]?.parsed?.subject || '(no subject)'
      console.error(`Failed to process "${subject}":`, s.reason)
      allResults.push({ success: false, subject, error: s.reason?.message || 'Unknown error' })
    }
  })

  // Move handled emails to "Imported" folder
  if (uidsToMove.length > 0) {
    console.log(`Moving ${uidsToMove.length} email(s) to "2. Imported to Sanity"...`)
    const mover = makeImapClient()
    try {
      await mover.connect()
      const lock = await mover.getMailboxLock('1. To Import')
      try {
        // Create destination folder if it doesn't exist
        try { await mover.mailboxCreate('2. Imported to Sanity') } catch {}
        await mover.messageMove(uidsToMove.map(String), '2. Imported to Sanity', { uid: true })
        console.log(`Moved ${uidsToMove.length} email(s) to "2. Imported to Sanity"`)
      } finally {
        lock.release()
      }
    } catch (err) {
      console.error('Failed to move emails to "Imported":', err.message)
    } finally {
      await mover.logout()
    }
  }

  return allResults
}
