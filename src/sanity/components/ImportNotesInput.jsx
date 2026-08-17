import { Stack, Text, Box } from '@sanity/ui'

export function ImportNotesInput({ value }) {
  if (!value) return null

  const lines = value.split('\n').map(l => l.replace(/^•\s*/, ''))

  return (
    <Box
      padding={3}
      style={{
        height: 260,
        overflowY: 'auto',
        resize: 'vertical',
        border: '1px solid var(--card-border-color)',
        borderRadius: 3,
      }}
    >
    <Stack space={1}>
      {lines.map((line, i) => {
        if (!line.trim()) return <Box key={i} style={{ height: 8 }} />

        // Section header like "Decisions:"
        if (/^Decisions:$/.test(line.trim())) {
          return (
            <Text key={i} size={1} style={{ fontWeight: 700, marginTop: 4 }}>
              {line}
            </Text>
          )
        }

        // Warning lines
        if (line.startsWith('⚠')) {
          return (
            <Text key={i} size={1} style={{ color: '#f59e0b' }}>
              {line}
            </Text>
          )
        }

        // Lines like "Title: ...", "Imported: ...", "From: ...", etc.
        const headerMatch = line.match(/^([^:⚠]+)(:)(.*)/)
        if (headerMatch) {
          return (
            <Text key={i} size={1} as="div" style={{ display: 'flex', gap: 0 }}>
              <span style={{ fontWeight: 700 }}>{headerMatch[1]}</span>
              <span>{headerMatch[2]}</span>
              <span>{headerMatch[3]}</span>
            </Text>
          )
        }

        return <Text key={i} size={1}>{line}</Text>
      })}
    </Stack>
    </Box>
  )
}
