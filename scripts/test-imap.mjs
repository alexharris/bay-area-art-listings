import { ImapFlow } from 'imapflow';
import { readFileSync } from 'fs';

// Load .env.local manually
const env = readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && !key.startsWith('#')) process.env[key.trim()] = val.join('=').trim();
});

const client = new ImapFlow({
  host: 'imap.zoho.com',
  port: 993,
  secure: true,
  auth: {
    user: process.env.ZOHO_IMAP_USER,
    pass: process.env.ZOHO_IMAP_PASSWORD,
  },
  logger: false,
});

try {
  await client.connect();
  console.log('✓ Connected to Zoho IMAP');

  const folders = await client.list();
  console.log('✓ Folders found:', folders.map(f => f.name).join(', '));

  await client.logout();
} catch (err) {
  console.error('✗ Connection failed:', err.message);
}
