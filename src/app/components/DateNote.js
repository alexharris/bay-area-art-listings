import { Badge } from '@/components/ui/badge';

export default function DateNote({ startDate, endDate }) {
  // Get current date in LA timezone as YYYY-MM-DD string
  const getTodayInLA = () => {
    const now = new Date();
    return now.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  };

  // Convert date string to YYYY-MM-DD format in LA timezone  
  const getEventDateInLA = (dateString) => {
    // Handle different date formats
    let date;
    if (typeof dateString === 'string') {
      // If it's already in YYYY-MM-DD format, append time to avoid timezone issues
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(dateString + 'T12:00:00');
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  };

  const todayLA = getTodayInLA();
  const eventStartDateLA = getEventDateInLA(startDate);
  const eventEndDateLA = getEventDateInLA(endDate);


  // Check if event is opening today by comparing date strings
  const isOpeningToday = eventStartDateLA === todayLA;

  // Check if event is ending soon (within 7 days)
  const today = new Date(todayLA + "T00:00:00");
  const endDateObj = new Date(eventEndDateLA + "T00:00:00");
  const diffTime = endDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isEndingSoon = diffDays >= 0 && diffDays <= 7;

  // Return opening today message first (higher priority)
  if (isOpeningToday) {
    return (
      <Badge variant="outline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mr-1 stroke-orange-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>        
        Starting Today
      </Badge>
    );
  }

  // Return ending soon message
  if (isEndingSoon) {
    return (
      <Badge variant="outline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mr-1 stroke-orange-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>        
        Ending Soon
      </Badge>
    );
  }

  return null;
}


