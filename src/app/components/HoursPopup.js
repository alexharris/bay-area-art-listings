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
            <>
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
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p className="text-xs text-gray-600">
                    We are just babies. Please double-check hours for this location on{' '}
                    {locationUrl ? (
                      <a 
                        href={locationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        their website
                      </a>
                    ) : (
                      'their website'
                    )}.
                  </p>
                </div>
              </div>
            </>
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