import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'

const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim()
})

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-12-26',
})

const drafts = await sanity.fetch(`*[_id in path("drafts.**") && _type == "listing"]{ _id }`)
console.log(`Found ${drafts.length} draft listings`)

if (drafts.length === 0) process.exit(0)

const transaction = sanity.transaction()
for (const doc of drafts) {
  transaction.delete(doc._id)
}
await transaction.commit()
console.log(`Deleted ${drafts.length} draft listings`)
