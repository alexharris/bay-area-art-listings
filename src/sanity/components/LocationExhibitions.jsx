import { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { IntentLink } from 'sanity/router'

export function LocationExhibitions({ document }) {
  const client = useClient({ apiVersion: '2024-12-26' })
  const [exhibitions, setExhibitions] = useState(null)

  useEffect(() => {
    const rawId = document.displayed?._id
    if (!rawId) return
    const id = rawId.replace('drafts.', '')

    client
      .fetch(
        `*[_type == "listing" && Location._ref == $id] | order(StartDate desc) {
          _id, Event, StartDate, EndDate
        }`,
        { id }
      )
      .then(setExhibitions)
  }, [document.displayed?._id])

  if (exhibitions === null) {
    return <div style={{ padding: '2rem', color: '#888' }}>Loading…</div>
  }

  if (exhibitions.length === 0) {
    return <div style={{ padding: '2rem', color: '#888' }}>No exhibitions found for this location.</div>
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
        {exhibitions.length} Exhibition{exhibitions.length !== 1 ? 's' : ''}
      </h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {exhibitions.map((ex) => {
          const start = ex.StartDate ? new Date(ex.StartDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
          const end = ex.EndDate ? new Date(ex.EndDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
          const dateRange = [start, end].filter(Boolean).join(' – ')

          return (
            <li key={ex._id} style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '0.5rem' }}>
              <IntentLink
                intent="edit"
                params={{ id: ex._id }}
                style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
              >
                <div style={{ fontWeight: 500 }}>{ex.Event || 'Untitled'}</div>
                {dateRange && <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.15rem' }}>{dateRange}</div>}
              </IntentLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
