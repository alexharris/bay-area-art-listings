import {useState} from 'react'
import {useFormValue, useDocumentOperation} from 'sanity'
import {Button, Stack, Flex, Badge, Text, Box} from '@sanity/ui'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const short = {Monday:'Mon',Tuesday:'Tue',Wednesday:'Wed',Thursday:'Thu',Friday:'Fri',Saturday:'Sat',Sunday:'Sun'}

export function SyncHoursInput(props) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [changedDays, setChangedDays] = useState([])
  const [previousHours, setPreviousHours] = useState({})

  const googleId = useFormValue(['GoogleID'])
  const hoursManualOverride = useFormValue(['hoursManualOverride']) ?? false
  const currentHours = useFormValue(['Hours']) || {}
  const rawId = useFormValue(['_id']) || ''
  const publishedId = rawId.replace(/^drafts\./, '')

  const {patch} = useDocumentOperation(publishedId, 'location')

  const handleSync = () => {
    if (hoursManualOverride) {
      setStatus('overridden')
      return
    }

    setIsLoading(true)
    setStatus(null)
    setChangedDays([])

    fetch('/api/google-place', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({placeId: googleId}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !data.data) {
          console.error('Error fetching place data:', data.error)
          setStatus('error')
          return
        }

        const {Hours} = data.data

        const updatedDays = Hours
          ? days.filter(day => (currentHours[day] ?? null) !== (Hours[day] ?? null))
          : []

        if (!Hours || updatedDays.length === 0) {
          setStatus('match')
        } else {
          const patches = updatedDays
            .filter(day => Hours[day] !== undefined)
            .map(day => ({set: {[`Hours.${day}`]: Hours[day]}}))
          setPreviousHours({...currentHours})
          patch.execute(patches)
          setChangedDays(updatedDays)
          setStatus('applied')
        }
      })
      .catch((err) => {
        console.error('Sync error:', err)
        setStatus('error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const badgeTone = status === 'applied' || status === 'match'
    ? 'positive'
    : status === 'overridden'
      ? 'caution'
      : status === 'error'
        ? 'critical'
        : undefined

  const badgeLabel = status === 'applied'
    ? `Updated: ${changedDays.map(d => short[d]).join(', ')}`
    : status === 'match'
      ? 'Up to date'
      : status === 'overridden'
        ? 'Override active'
        : status === 'error'
          ? 'Error'
          : null

  return (
    <Stack space={2}>
      <Flex justify="flex-end" align="center" gap={2}>
        {badgeLabel && <Badge tone={badgeTone}>{badgeLabel}</Badge>}
        <Button
          tone="primary"
          text={isLoading ? 'Syncing…' : 'Sync from Google'}
          onClick={handleSync}
          disabled={!googleId || isLoading}
          title={!googleId ? 'No Google Place ID set on this location' : undefined}
          fontSize={1}
          padding={2}
          mode="ghost"
        />
      </Flex>
      {props.renderDefault(props)}
      {changedDays.length > 0 && (
        <Box paddingLeft={3}>
          <Stack space={1}>
            {changedDays.map(day => (
              <Text key={day} size={1} muted>
                {short[day]}: previously {previousHours[day] || 'not set'}
              </Text>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
