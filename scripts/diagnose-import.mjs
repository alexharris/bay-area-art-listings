import { readFileSync } from 'fs'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import Anthropic from '@anthropic-ai/sdk'

const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim()
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
    const subject = parsed.subject || '(no subject)'
    const content = parsed.text || ''

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Extract art exhibition information from this email and return a JSON object.

Email subject: ${subject}

Email body:
${content}

Return only a JSON object with these fields (use null for anything not found):
{
  "title": "exhibition title",
  "url": "exhibition website URL",
  "imageUrl": "URL of an exhibition image if linked in the email (not an email tracking pixel)",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "openings": [
    {
      "title": "e.g. Opening Reception",
      "date": "YYYY-MM-DD",
      "time": "e.g. 6–9pm",
      "note": "any extra detail or null"
    }
  ],
  "description": "the full exhibition description text, plain text only"
}

Return only the raw JSON, no markdown, no explanation.`
      }]
    })

    console.log(`\n=== ${subject} ===`)
    console.log(response.content[0].text)
  }
} finally {
  lock.release()
  await client.logout()
}
