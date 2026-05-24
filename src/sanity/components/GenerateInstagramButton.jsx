import { useCallback, useState } from 'react'
import { useClient, useFormValue } from 'sanity'
import { Stack, Button, Text, Box } from '@sanity/ui'
import { ImageIcon } from '@sanity/icons'

export function GenerateInstagramButton(props) {
  const client = useClient({ apiVersion: '2024-12-26' })
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const docId = useFormValue(['_id'])
  const currentImage = props.value

  const { projectId, dataset } = client.config()
  const previewUrl = currentImage?.asset?._ref
    ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${currentImage.asset._ref.replace('image-', '').replace(/-(\w+)$/, '.$1')}`
    : null

  const handleGenerate = useCallback(async () => {
    if (!docId) return
    setIsGenerating(true)
    setStatus(null)
    setErrorMsg(null)

    try {
      const response = await fetch(`/api/generate-og?id=${encodeURIComponent(docId)}`)

      if (response.status === 404) {
        throw new Error('No image found for this listing. Add an Event Image first.')
      }
      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`Generation failed (${response.status})${body ? ': ' + body : ''}`)
      }

      const blob = await response.blob()

      const asset = await client.assets.upload('image', blob, {
        filename: `instagram-${docId.replace('drafts.', '')}-${Date.now()}.png`,
      })

      await client
        .patch(docId)
        .set({
          instagramImage: {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
          },
        })
        .commit()

      setStatus('success')
    } catch (err) {
      console.error('Instagram image generation failed:', err)
      setErrorMsg(err.message)
      setStatus('error')
    } finally {
      setIsGenerating(false)
    }
  }, [docId, client])

  return (
    <Stack space={3}>
      {previewUrl && (
        <Box>
          <img
            src={previewUrl}
            alt="Instagram image"
            style={{ width: '100%', maxWidth: 300, display: 'block', borderRadius: 4 }}
          />
        </Box>
      )}
      <Box>
        <Button
          text={isGenerating ? 'Generating…' : 'Generate Instagram Image'}
          tone="primary"
          mode="ghost"
          icon={ImageIcon}
          disabled={isGenerating}
          onClick={handleGenerate}
        />
        {status === 'success' && (
          <Text size={1} muted style={{ marginTop: 6 }}>
            Generated and saved.
          </Text>
        )}
        {status === 'error' && (
          <Text size={1} style={{ marginTop: 6, color: 'red' }}>
            {errorMsg || 'Generation failed. Check the console.'}
          </Text>
        )}
      </Box>
    </Stack>
  )
}
