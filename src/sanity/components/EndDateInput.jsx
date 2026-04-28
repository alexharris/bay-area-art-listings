import { useFormValue } from 'sanity'
import { Stack, Card, Text } from '@sanity/ui'

export function EndDateInput(props) {
  const startDate = useFormValue(['StartDate'])

  const matchesStart = props.value && startDate && props.value === startDate
  const beforeStart = props.value && startDate && props.value < startDate

  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      {matchesStart && (
        <Card tone="caution" padding={2} radius={2} border>
          <Text size={1}>Same as start date — remember to update</Text>
        </Card>
      )}
      {beforeStart && (
        <Card tone="critical" padding={2} radius={2} border>
          <Text size={1}>End date is before start date</Text>
        </Card>
      )}
    </Stack>
  )
}
