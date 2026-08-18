import { importEmailsFromZoho } from '@/lib/importEmails'

export const maxDuration = 300

export async function POST() {
  try {
    const results = await importEmailsFromZoho()
    return Response.json({ ok: true, results })
  } catch (err) {
    console.error('Manual email import failed:', err)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
