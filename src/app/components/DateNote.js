import { Badge } from '@/components/ui/badge';

export default function DateNote({ 
  startDate, 
  endDate, 
  endingSoonOnly,
  setEndingSoonOnly,
  openingTodayOnly,
  setOpeningTodayOnly
}) {
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
      <Badge 
        variant="outline" 
        className="cursor-pointer hover:bg-orange-50 border-orange-300 transition-colors"
        onClick={() => setOpeningTodayOnly(!openingTodayOnly)}
      >
        Starting Today
      </Badge>
    );
  }

  // Return ending soon message
  if (isEndingSoon) {
    return (
      <Badge 
        variant="outline" 
        className="cursor-pointer hover:bg-red-50 border-red-300 transition-colors"
        onClick={() => setEndingSoonOnly(!endingSoonOnly)}
      >
        Ending Soon
      </Badge>
    );
  }

  return null;
}


