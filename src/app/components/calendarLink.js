export default function calendarLink(data) {
    const listing = data.listing
    console.log(listing.Event)
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