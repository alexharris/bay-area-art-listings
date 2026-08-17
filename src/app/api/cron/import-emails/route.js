import { importEmailsFromZoho } from '@/lib/importEmails'

export async function GET() {
  try {
    const results = await importEmailsFromZoho()
    const succeeded = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`Email import: ${succeeded.length} imported, ${failed.length} failed`)
    if (failed.length) console.error('Failed imports:', failed)

    return Response.json({ imported: succeeded.length, failed: failed.length, results })
  } catch (err) {
    console.error('Email import cron failed:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
