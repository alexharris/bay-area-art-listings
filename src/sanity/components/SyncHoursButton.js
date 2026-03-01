import {useState} from 'react'
import {Button, Stack, Flex, Text, Badge} from '@sanity/ui'

export function SyncHoursButton() {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)

  const handleSync = () => {
    setState('loading')
    setResult(null)

    fetch('/api/cron/refresh-hours', {method: 'POST'})
      .then(res => res.json())
      .then(data => {
        setResult(data)
        setState('done')
      })
      .catch(() => {
        setState('error')
      })
  }

  return (
    <Stack space={3}>
      <Flex align="center" gap={3}>
        <Button
          tone="primary"
          mode="ghost"
          text={state === 'loading' ? 'Syncing…' : 'Sync hours from Google'}
          onClick={handleSync}
          disabled={state === 'loading'}
          fontSize={1}
          padding={2}
        />
        {state === 'error' && <Badge tone="critical">Error</Badge>}
      </Flex>
      {state === 'done' && result && (
        <Text size={1} muted>
          {result.changed > 0
            ? `Updated ${result.changed} venue${result.changed !== 1 ? 's' : ''} of ${result.refreshed} checked.${result.errors > 0 ? ` ${result.errors} errors.` : ''}`
            : `No changes — ${result.refreshed} venues checked.${result.errors > 0 ? ` ${result.errors} errors.` : ''}`
          }
        </Text>
      )}
    </Stack>
  )
}
