import { readFileSync } from 'fs'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim()
})

const client = new ImapFlow({
  host: 'imap.zoho.com', port: 993, secure: true,
  auth: { user: process.env.ZOHO_IMAP_USER, pass: process.env.ZOHO_IMAP_PASSWORD },
  logger: false,
})

await client.connect()

for (const folder of ['To Import', 'Newsletters/Added']) {
  try {
    const lock = await client.getMailboxLock(folder)
    const uids = await client.search({ all: true }, { uid: true })
    console.log(`\n${folder}: ${uids.length} emails`)
    for (const uid of uids.slice(-10)) {
      const msg = await client.fetchOne(String(uid), { envelope: true }, { uid: true })
      console.log(` - ${msg.envelope.subject}`)
    }
    lock.release()
  } catch (e) {
    console.log(`\n${folder}: error — ${e.message}`)
  }
}

await client.logout()
