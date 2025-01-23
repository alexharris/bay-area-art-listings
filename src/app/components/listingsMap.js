export default function listingsMap(data) {
  const listing = data.listing
  return (
      <div>
          <a
          href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(listing.Event)}&dates=${listing.Start}/${listing.End}&details=${encodeURIComponent(listing.Notes)}&location=${encodeURIComponent(listing.Location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          >
          Add to Google Calendar
          </a>
      </div>
  )
}