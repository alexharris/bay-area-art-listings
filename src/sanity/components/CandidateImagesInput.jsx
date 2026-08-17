import { useCallback, useState } from 'react'
import { useClient, useFormValue } from 'sanity'
import { Stack, Button, Text, Grid, Box, Card } from '@sanity/ui'

export function CandidateImagesInput(props) {
  const client = useClient({ apiVersion: '2024-12-26' })
  const docId = useFormValue(['_id'])
  const currentImageUrl = useFormValue(['EventImageUrl'])
  const urls = props.value || []
  const [loading, setLoading] = useState(null)
  const [manualSelected, setManualSelected] = useState(null)

  const handleSelect = useCallback(async (url, index) => {
    setLoading(index)
    try {
      await client.patch(docId).set({ EventImageUrl: url }).commit()
      setManualSelected(index)
    } catch (err) {
      console.error('Failed to set image URL:', err)
    } finally {
      setLoading(null)
    }
  }, [client, docId])

  if (!urls.length) return null

  return (
    <Stack space={3}>
      <Text size={1} weight="semibold">Candidate Images — click to set as Event Image URL</Text>
      <Grid columns={3} gap={3}>
        {urls.map((url, i) => {
          const isActive = manualSelected === i || (manualSelected === null && currentImageUrl === url)
          return (
            <Card key={i} border radius={2} padding={2} tone={isActive ? 'positive' : 'default'}>
              <Stack space={2}>
                <Box style={{ height: 120, overflow: 'hidden', borderRadius: 2, outline: isActive ? '2px solid #43d675' : 'none' }}>
                  <img
                    src={url}
                    alt={`Candidate ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </Box>
                <Button
                  text={isActive ? '✓ Selected' : loading === i ? 'Setting…' : 'Use this image'}
                  mode="ghost"
                  tone={isActive ? 'positive' : 'primary'}
                  disabled={loading !== null}
                  onClick={() => handleSelect(url, i)}
                  style={{ width: '100%' }}
                />
              </Stack>
            </Card>
          )
        })}
      </Grid>
    </Stack>
  )
}
