import { Stack, Text, Card } from '@sanity/ui'
import { WarningOutlineIcon } from '@sanity/icons'

export function ImportWarningsInput({ value }) {
  if (!value) return null

  const warnings = value.split('\n').filter(w => w.trim())
  if (!warnings.length) return null

  return (
    <Card tone="caution" padding={3} radius={2} border>
      <Stack space={2}>
        {warnings.map((warning, i) => (
          <Text key={i} size={2} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            {warning}
          </Text>
        ))}
      </Stack>
    </Card>
  )
}
