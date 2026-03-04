import {useState} from 'react'
import {useFormValue, useDocumentOperation} from 'sanity'
import {Button, Stack, Flex, Badge, Text, Box, Card} from '@sanity/ui'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const short = {Monday:'Mon',Tuesday:'Tue',Wednesday:'Wed',Thursday:'Thu',Friday:'Fri',Saturday:'Sat',Sunday:'Sun'}

export function GoogleSyncPanel(props) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [changedDays, setChangedDays] = useState([])
  const [changedFields, setChangedFields] = useState([])
  const [previousHours, setPreviousHours] = useState({})

  const googleId = useFormValue(['GoogleID'])
  const hoursManualOverride = useFormValue(['hoursManualOverride']) ?? false
  const currentHours = useFormValue(['Hours']) || {}
  const currentName = useFormValue(['Name']) || ''
  const currentAddress = useFormValue(['Address']) || ''
  const currentGeolocation = useFormValue(['Geolocation'])
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
    setChangedFields([])

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

        const {Hours, Name, Address, Geolocation} = data.data

        const updatedDays = Hours
          ? days.filter(day => (currentHours[day] ?? null) !== (Hours[day] ?? null))
          : []

        const updatedFields = []
        if (Name && Name !== currentName) updatedFields.push('Name')
        if (Address && Address !== currentAddress) updatedFields.push('Address')
        if (Geolocation && (Geolocation.lat !== currentGeolocation?.lat || Geolocation.lng !== currentGeolocation?.lng)) updatedFields.push('Geolocation')

        if (updatedDays.length === 0 && updatedFields.length === 0) {
          setStatus('match')
        } else {
          const patches = []
          if (updatedFields.includes('Name')) patches.push({set: {Name}})
          if (updatedFields.includes('Address')) patches.push({set: {Address}})
          if (updatedFields.includes('Geolocation')) patches.push({set: {Geolocation: {_type: 'geopoint', lat: Geolocation.lat, lng: Geolocation.lng}}})
          updatedDays
            .filter(day => Hours[day] !== undefined)
            .forEach(day => patches.push({set: {[`Hours.${day}`]: Hours[day]}}))
          setPreviousHours({...currentHours})
          patch.execute(patches)
          setChangedDays(updatedDays)
          setChangedFields(updatedFields)
          setStatus('applied')
        }
      })
      .catch((err) => {
        console.error('Sync error:', err)
        setStatus('error')
      })
      .finally(() => setIsLoading(false))
  }

  const badgeTone = status === 'applied' || status === 'match'
    ? 'positive'
    : status === 'overridden'
      ? 'caution'
      : status === 'error'
        ? 'critical'
        : undefined

  const badgeLabel = status === 'applied'
    ? `Updated: ${[...changedFields, ...changedDays.map(d => short[d])].join(', ')}`
    : status === 'match'
      ? 'Up to date'
      : status === 'overridden'
        ? 'Override active — no changes applied'
        : status === 'error'
          ? 'Error — check console'
          : null

  return (
    <Stack space={5}>
      {props.renderDefault(props)}

      <Card padding={4} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Text size={1} weight="semibold">What gets updated</Text>
          <Stack space={2}>
            <Text size={1} muted>
              <strong>Name</strong> — the venue's display name as listed on Google
            </Text>
            <Text size={1} muted>
              <strong>Address</strong> — the formatted street address from Google
            </Text>
            <Text size={1} muted>
              <strong>Geolocation</strong> — latitude and longitude coordinates used for the map
            </Text>
            <Text size={1} muted>
              <strong>Hours</strong> — opening hours for each day of the week, pulled from Google's current listing
            </Text>
          </Stack>
          <Text size={1} muted>
            Only fields that differ from what's currently stored will be changed. To prevent Google from overwriting any of these, check <strong>Manual Override</strong> on the Hours tab.
          </Text>
        </Stack>
      </Card>

      <Stack space={3}>
        <Flex align="center" gap={3}>
          <Button
            tone="primary"
            text={isLoading ? 'Syncing…' : 'Sync from Google'}
            onClick={handleSync}
            disabled={!googleId || isLoading}
            title={!googleId ? 'Enter a Google Place ID above to enable sync' : undefined}
          />
          {badgeLabel && <Badge tone={badgeTone}>{badgeLabel}</Badge>}
        </Flex>

        {(changedDays.length > 0 || changedFields.length > 0) && (
          <Box paddingLeft={1}>
            <Stack space={1}>
              {changedFields.map(field => (
                <Text key={field} size={1} muted>{field} updated</Text>
              ))}
              {changedDays.map(day => (
                <Text key={day} size={1} muted>
                  {short[day]}: previously {previousHours[day] || 'not set'}
                </Text>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Stack>
  )
}
