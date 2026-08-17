import { readFileSync } from 'fs'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim()
})

const subject = process.argv[2]
if (!subject) { console.error('Usage: node scripts/inspect-email.mjs "subject line"'); process.exit(1) }

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
    if (!parsed.subject?.toLowerCase().includes(subject.toLowerCase())) continue

    console.log(`Subject: ${parsed.subject}`)
    console.log(`From: ${parsed.from?.text}`)
    console.log(`\n--- TEXT BODY ---\n${parsed.text?.slice(0, 3000)}`)
  }
} finally {
  lock.release()
  await client.logout()
}
