import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function HoursPopup({ 
  children,
  locationName, 
  locationHours, 
  locationUrl 
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 lg:w-96" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{locationName} Hours</h4>
          {locationHours ? (
            <ul className="text-xs lg:text-sm space-y-1">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const isToday = day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
                const hours = locationHours[day]
                  ? locationHours[day].replace(`${day}: `, '').replace(`${day}:`, '')
                  : 'Not specified';
                
                return (
                  <li key={day} className={`flex justify-between ${isToday ? 'bg-muted p-1 rounded' : ''}`}>
                    <span className="mr-4">{day}:</span>
                    <span className="text-right">
                      {hours}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>No hours information available.</p>
              {locationUrl && (
                <p className="mt-1">
                  <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit website for details
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}