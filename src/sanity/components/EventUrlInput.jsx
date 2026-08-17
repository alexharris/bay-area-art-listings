import { Stack, Text } from '@sanity/ui'

export function EventUrlInput(props) {
  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      {!props.value && (
        <Text size={1} style={{ color: '#d4a017' }}>
          No exhibition URL found — please add manually
        </Text>
      )}
    </Stack>
  )
}
