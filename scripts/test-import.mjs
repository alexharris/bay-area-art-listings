import { readFileSync } from 'fs'

// Load .env.local
const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim()
})

const { importEmailsFromZoho } = await import('../src/lib/importEmails.js')

console.log('Starting email import test...')
const results = await importEmailsFromZoho()

if (results.length === 0) {
  console.log('No emails found in "To Import" folder.')
} else {
  for (const r of results) {
    if (r.success) {
      console.log(`✓ Imported: "${r.subject}" → Sanity draft ${r.sanityId}`)
    } else {
      console.error(`✗ Failed: "${r.subject}" — ${r.error}`)
    }
  }
}
