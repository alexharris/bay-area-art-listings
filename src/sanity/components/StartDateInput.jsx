import { useEffect, useRef } from 'react'
import { useFormValue, useDocumentOperation } from 'sanity'

export function StartDateInput(props) {
  const rawId = useFormValue(['_id']) || ''
  const publishedId = rawId.replace(/^drafts\./, '')
  const endDate = useFormValue(['EndDate'])
  const lastAutofilled = useRef(null)

  const { patch } = useDocumentOperation(publishedId, 'listing')

  useEffect(() => {
    if (props.value && !endDate && props.value !== lastAutofilled.current) {
      lastAutofilled.current = props.value
      patch.execute([{ set: { EndDate: props.value } }])
    }
  }, [props.value, endDate])

  return props.renderDefault(props)
}
