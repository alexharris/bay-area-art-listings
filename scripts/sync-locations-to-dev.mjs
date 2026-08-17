import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'

const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim()
})

const production = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-12-26',
})

const development = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-12-26',
})

const locations = await production.fetch(`*[_type == "location" && !(_id in path("drafts.**"))]`)
console.log(`Found ${locations.length} locations in production`)

const transaction = development.transaction()
for (const loc of locations) {
  transaction.createOrReplace(loc)
}
await transaction.commit()
console.log(`Synced ${locations.length} locations to development dataset`)
