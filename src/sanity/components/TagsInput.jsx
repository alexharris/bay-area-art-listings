import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { set, unset, useClient } from 'sanity'
import { Autocomplete, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { CloseIcon } from '@sanity/icons'

const normalize = (t) => t.trim().toLowerCase().replace(/\s+/g, ' ')

// Free-form tags with suggestions from tags already used on other listings.
// Type to filter existing tags; Enter picks the highlighted one or adds the typed text as a new tag.
export function TagsInput({ value = [], onChange, elementProps }) {
  const client = useClient({ apiVersion: '2024-12-26' })
  const id = useId()
  const [existing, setExisting] = useState([])
  const [query, setQuery] = useState('')
  const [resetKey, setResetKey] = useState(0)
  const inputRef = useRef(null)
  const refocus = useRef(false)

  useEffect(() => {
    client
      .fetch(`array::unique(*[_type == "listing" && defined(tags)].tags[])`)
      .then((tags) => setExisting((tags || []).filter(Boolean).sort((a, b) => a.localeCompare(b))))
  }, [client])

  // After adding a tag the Autocomplete is remounted to clear it; keep focus in the field
  useEffect(() => {
    if (refocus.current) {
      inputRef.current?.focus()
      refocus.current = false
    }
  }, [resetKey])

  const options = useMemo(() => {
    const q = normalize(query)
    const available = existing.filter((t) => !value.includes(t))
    const opts = available.map((t) => ({ value: t }))
    if (q && !available.includes(q) && !value.includes(q)) opts.unshift({ value: q, isNew: true })
    return opts
  }, [existing, value, query])

  const add = (raw) => {
    const tag = normalize(raw)
    if (tag && !value.includes(tag)) onChange(set([...value, tag]))
    setQuery('')
    refocus.current = true
    setResetKey((k) => k + 1)
  }

  const remove = (tag) => {
    const next = value.filter((t) => t !== tag)
    onChange(next.length ? set(next) : unset())
  }

  return (
    <Stack space={2}>
      {value.length > 0 && (
        <Flex gap={2} wrap="wrap">
          {value.map((tag) => (
            <Card key={tag} radius={2} tone="primary" border paddingLeft={2}>
              <Flex align="center" gap={1}>
                <Text size={1}>{tag}</Text>
                <Button icon={CloseIcon} mode="bleed" padding={2} fontSize={0} onClick={() => remove(tag)} aria-label={`Remove ${tag}`} />
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
      <Autocomplete
        key={resetKey}
        ref={inputRef}
        id={`${elementProps?.id || id}-tags`}
        placeholder="Add a tag…"
        openButton
        options={options}
        onQueryChange={(q) => setQuery(q || '')}
        onSelect={add}
        filterOption={(q, opt) => opt.isNew || opt.value.includes(normalize(q || ''))}
        renderOption={(opt) => (
          <Card as="button" padding={3}>
            <Box>
              <Text size={1}>{opt.isNew ? `Add “${opt.value}”` : opt.value}</Text>
            </Box>
          </Card>
        )}
      />
    </Stack>
  )
}
