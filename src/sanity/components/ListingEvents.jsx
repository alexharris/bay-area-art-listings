import { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { IntentLink } from 'sanity/router'

const fmt = (d) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''

// "Events" tab on an exhibition: lists the event documents linked to it, plus a button
// to create a new one with this exhibition pre-filled.
export function ListingEvents({ document }) {
  const client = useClient({ apiVersion: '2024-12-26' })
  const [events, setEvents] = useState(null)
  const id = document.displayed?._id?.replace('drafts.', '')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    const load = () =>
      client
        .fetch(`*[_type == "event" && listing._ref == $id] | order(date asc) { _id, title, date, time, note }`, { id })
        .then((r) => !cancelled && setEvents(r))
    load()
    // Keep the list fresh as events are created or edited in the pane next to this one
    const sub = client.listen(`*[_type == "event" && listing._ref == $id]`, { id }, { visibility: 'query' }).subscribe(load)
    return () => {
      cancelled = true
      sub.unsubscribe()
    }
  }, [id, client])

  if (!id) return <div style={{ padding: '2rem', color: '#888' }}>Save the exhibition first.</div>

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
          {events === null ? 'Events' : `${events.length} Event${events.length !== 1 ? 's' : ''}`}
        </h2>
        <IntentLink
          intent="create"
          params={[{ type: 'event', template: 'event-for-listing' }, { listingId: id }]}
          style={{ fontSize: '0.85rem', fontWeight: 500, color: 'inherit' }}
        >
          + New event
        </IntentLink>
      </div>
      {events === null ? (
        <div style={{ color: '#888' }}>Loading…</div>
      ) : events.length === 0 ? (
        <div style={{ color: '#888' }}>No events linked to this exhibition yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {events.map((ev) => (
            <li key={ev._id} style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '0.5rem', opacity: ev.date < today ? 0.55 : 1 }}>
              <IntentLink intent="edit" params={{ id: ev._id, type: 'event' }} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontWeight: 500 }}>{ev.title || 'Untitled'}</div>
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.15rem' }}>
                  {[fmt(ev.date), ev.time].filter(Boolean).join(' • ')}
                </div>
                {ev.note && <div style={{ fontSize: '0.8rem', color: '#888' }}>{ev.note}</div>}
              </IntentLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
