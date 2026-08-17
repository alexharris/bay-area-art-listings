import { readFileSync } from 'fs'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim()
})

const targets = ['Linda Christensen', 'Deborah Brown']

const client = new ImapFlow({
  host: 'imap.zoho.com', port: 993, secure: true,
  auth: { user: process.env.ZOHO_IMAP_USER, pass: process.env.ZOHO_IMAP_PASSWORD },
  logger: false,
})

await client.connect()
const lock = await client.getMailboxLock('To Import')

try {
  const uids = await client.search({ all: true }, { uid: true })

  for (const uid of uids) {
    const msg = await client.fetchOne(String(uid), { source: true }, { uid: true })
    const parsed = await simpleParser(msg.source)
    const subject = parsed.subject || ''
    if (!targets.some(t => subject.includes(t))) continue

    console.log(`\n=== ${subject} ===`)
    console.log(`HTML length: ${parsed.html?.length}`)
    console.log(`Attachments: ${parsed.attachments?.length}`)

    // Show all img tags raw
    const allImgs = [...(parsed.html || '').matchAll(/<img([^>]+)>/gi)]
    console.log(`\nAll <img> tags found: ${allImgs.length}`)
    for (const m of allImgs) {
      const tag = m[1]
      const src = (tag.match(/src=["']([^"']{0,120})/i) || [])[1] || '(no src)'
      const alt = (tag.match(/alt=["']([^"']*)/i) || [])[1] || ''
      const width = (tag.match(/width=["']?(\d+)/i) || [])[1] || '?'
      const height = (tag.match(/height=["']?(\d+)/i) || [])[1] || '?'
      console.log(`  src: ${src.slice(0, 80)}`)
      console.log(`  alt: "${alt}" | ${width}x${height}`)
    }

    // Show attachments
    if (parsed.attachments?.length) {
      console.log('\nAttachments:')
      for (const a of parsed.attachments) {
        console.log(`  ${a.filename} | ${a.contentType} | ${a.size} bytes | cid: ${a.cid}`)
      }
    }
  }
} finally {
  lock.release()
  await client.logout()
}
