import { readFileSync } from 'fs'
import { ImapFlow } from 'imapflow'

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
const folders = await client.list()
for (const f of folders) {
  console.log(`path: "${f.path}" | name: "${f.name}"`)
}
await client.logout()
