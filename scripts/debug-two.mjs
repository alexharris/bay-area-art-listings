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
const targets = ['neoscape', 'Deborah Brown']

const client = new ImapFlow({
  host: 'imap.zoho.com', port: 993, secure: true,
  auth: { user: process.env.ZOHO_IMAP_USER, pass: process.env.ZOHO_IMAP_PASSWORD },
  logger: false,
})

await client.connect()
const lock = await client.getMailboxLock('Newsletters/Added')


try {
  const uids = await client.search({ all: true }, { uid: true })
  const recent = uids.slice(-10)

  for (const uid of recent) {
    const msg = await client.fetchOne(String(uid), { source: true }, { uid: true })
    const parsed = await simpleParser(msg.source)
    const subject = parsed.subject || ''

    if (!targets.some(t => subject.includes(t))) continue

    console.log(`\n=== ${subject} ===`)
    console.log(`Text length: ${parsed.text?.length}, HTML length: ${parsed.html?.length}`)

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Extract art exhibition information from this email and return a JSON object.

Email subject: ${subject}

Email body:
${parsed.text || ''}

Return only a JSON object with these fields (use null for anything not found):
{
  "title": "exhibition title",
  "url": "exhibition website URL",
  "imageUrl": "URL of an exhibition image if linked in the email (not an email tracking pixel)",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "openings": [...],
  "description": "the full exhibition description text, plain text only"
}

Return only the raw JSON, no markdown, no explanation.`
      }]
    })

    const raw = response.content[0].text
    console.log('\nRaw Claude response:')
    console.log(raw)

    try {
      const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
      const parsed2 = JSON.parse(stripped)
      console.log('\nParsed OK:', JSON.stringify(parsed2, null, 2).slice(0, 500))
    } catch (e) {
      console.log('\nJSON PARSE FAILED:', e.message)
    }
  }
} finally {
  lock.release()
  await client.logout()
}
