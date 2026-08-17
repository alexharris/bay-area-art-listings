import { useState } from 'react'
import { Stack, Box, Text } from '@sanity/ui'

export function ImportLinksInput({ value }) {
  const [open, setOpen] = useState(false)
  if (!value?.length) return null

  return (
    <Stack space={2}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          color: 'inherit',
        }}
      >
        <span style={{ fontSize: 10 }}>{open ? '▼' : '▶'}</span>
        Candidate Links ({value.length})
      </button>
      {open && (
        <Stack space={2} style={{ paddingLeft: 16 }}>
          {value.map((link, i) => (
            <Box key={i}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#2276fc', textDecoration: 'underline', wordBreak: 'break-all' }}
              >
                {link.text || link.url}
              </a>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
