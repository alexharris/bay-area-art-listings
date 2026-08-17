import { useState } from 'react'
import { Stack, Box, Text, Button, Card, Spinner } from '@sanity/ui'
import { DownloadIcon } from '@sanity/icons'

export function ImportTool() {
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [results, setResults] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  async function runImport() {
    setStatus('running')
    setResults(null)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/import-emails', { method: 'POST' })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Import failed')
      setResults(data.results || [])
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  const imported = results?.filter(r => r.success && !r.skipped) || []
  const skipped  = results?.filter(r => r.skipped) || []
  const failed   = results?.filter(r => !r.success) || []

  // Group imported results by email subject so multi-show emails are obvious
  const emailGroups = imported.reduce((acc, r) => {
    if (!acc[r.subject]) acc[r.subject] = []
    acc[r.subject].push(r)
    return acc
  }, {})
  const emailCount = Object.keys(emailGroups).length

  return (
    <Box padding={5} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Stack space={5}>
        <Stack space={2}>
          <Text size={4} weight="bold">Import Emails</Text>
          <Text size={2} muted>
            Pulls emails from the "To Import" folder in Zoho and creates draft listings in Sanity.
          </Text>
        </Stack>

        <Button
          text={status === 'running' ? 'Importing…' : 'Run Import'}
          tone="primary"
          icon={status === 'running' ? Spinner : DownloadIcon}
          disabled={status === 'running'}
          onClick={runImport}
          style={{ width: 'fit-content' }}
        />

        {status === 'error' && (
          <Card tone="critical" padding={4} radius={2}>
            <Text size={2}>Error: {errorMsg}</Text>
          </Card>
        )}

        {status === 'done' && results.length === 0 && (
          <Card tone="caution" padding={4} radius={2}>
            <Text size={2}>No emails found in "To Import" folder.</Text>
          </Card>
        )}

        {status === 'done' && results.length > 0 && (
          <Stack space={4}>
            {/* Summary counts */}
            <Box style={{ display: 'flex', gap: 16 }}>
              {imported.length > 0 && (
                <Card tone="positive" padding={4} radius={2} style={{ flex: 1, textAlign: 'center' }}>
                  <Stack space={2} style={{ alignItems: 'center' }}>
                    <Text size={4} weight="bold">{imported.length}</Text>
                    <Text size={1} muted>Imported</Text>
                    {emailCount > 0 && (
                      <Text size={1} muted>from {emailCount} email{emailCount !== 1 ? 's' : ''}</Text>
                    )}
                  </Stack>
                </Card>
              )}
              {skipped.length > 0 && (
                <Card tone="caution" padding={4} radius={2} style={{ flex: 1, textAlign: 'center' }}>
                  <Stack space={2} style={{ alignItems: 'center' }}>
                    <Text size={4} weight="bold">{skipped.length}</Text>
                    <Text size={1} muted>Already imported</Text>
                  </Stack>
                </Card>
              )}
              {failed.length > 0 && (
                <Card tone="critical" padding={4} radius={2} style={{ flex: 1, textAlign: 'center' }}>
                  <Stack space={2} style={{ alignItems: 'center' }}>
                    <Text size={4} weight="bold">{failed.length}</Text>
                    <Text size={1} muted>Failed</Text>
                  </Stack>
                </Card>
              )}
            </Box>

            {/* Imported: grouped by email */}
            {imported.length > 0 && (
              <Stack space={2}>
                {Object.entries(emailGroups).map(([subject, items]) => (
                  <Card key={subject} padding={3} radius={2} border>
                    <Stack space={2}>
                      {items.length > 1 ? (
                        <>
                          <Text size={1} muted style={{ fontStyle: 'italic' }}>
                            {subject} — {items.length} shows
                          </Text>
                          {items.map((r, i) => (
                            <Text key={i} size={1} style={{ paddingLeft: 12 }}>
                              ✓ {r.title || '(untitled)'}
                            </Text>
                          ))}
                        </>
                      ) : (
                        <Text size={1}>✓ {items[0].title || subject}</Text>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}

            {/* Skipped */}
            {skipped.length > 0 && (
              <Stack space={2}>
                {skipped.map((r, i) => (
                  <Card key={i} padding={3} radius={2} border>
                    <Text size={1} muted>↩ Already imported: {r.subject}</Text>
                  </Card>
                ))}
              </Stack>
            )}

            {/* Failed */}
            {failed.length > 0 && (
              <Stack space={2}>
                {failed.map((r, i) => (
                  <Card key={i} padding={3} radius={2} border tone="critical">
                    <Text size={1}>✗ {r.subject}: {r.error}</Text>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
