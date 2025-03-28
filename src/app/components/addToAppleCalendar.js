function downloadAppleCalendarEvent(icsEvent) {
    // Event details (customize these)
    console.log(icsEvent)
  

    function formatDateToICS(date) {
        const dateObj = new Date(date);
        const pad = (num) => num.toString().padStart(2, '0');
        const year = dateObj.getUTCFullYear();
        const month = pad(dateObj.getUTCMonth() + 1);
        const day = pad(dateObj.getUTCDate());
        const hours = pad(dateObj.getUTCHours());
        const minutes = pad(dateObj.getUTCMinutes());
        const seconds = pad(dateObj.getUTCSeconds());
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
      }
  
    // Create the .ics file content with VTIMEZONE
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Apple Inc.//macOS 14.0//EN',
      'BEGIN:VEVENT',
      `UID:${crypto.randomUUID()}@yourapp`, // Globally unique ID
      `DTSTAMP:${formatDateToICS(new Date().toISOString())}`, // UTC format
      `DTSTART;TZID=America/Los_Angeles:${formatDateToICS(icsEvent.startTime)}`,
      `DTEND;TZID=America/Los_Angeles:${formatDateToICS(icsEvent.endTime)}`,
      `SUMMARY:${icsEvent.title}`,
      `LOCATION:${icsEvent.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  
    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${icsEvent.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  

  export default function addToAppleCalendar(data) {
    return (
        <button onClick={() => downloadAppleCalendarEvent(data.data)} className="mt-4 p-2 bg-blue-500 text-white rounded">
            Apple Calendar
        </button>
    );
}
