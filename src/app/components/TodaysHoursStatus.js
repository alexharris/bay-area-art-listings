import React from 'react';
import HoursPopup from './HoursPopup';

export default function TodaysHoursStatus({ locationHours, locationUrl, locationName }) {
  if (!locationHours) {
    return (
      <a className="flex flex-row items-center gap-1 text-sm" href={locationUrl} target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 feather feather-circle fill-gray-600 mt-1 shrink-0" viewBox="0 0 24 24" stroke="smoke" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
        <span>Check site for hours</span>
      </a>
    );
  }

  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[today.getDay()];
  const openHours = locationHours[todayName];
  
  // Check if the item has open hours for today
  const displayOpenHours = openHours 
    ? openHours.replace(`${todayName}: `, '').replace(`${todayName}:`, '') 
    : null;
  
  if (!openHours || openHours.toLowerCase().includes('closed')) {
    return (
      <HoursPopup
        locationName={locationName}
        locationHours={locationHours}
        locationUrl={locationUrl}
      >
        <span className="flex flex-row items-start gap-1 text-sm my-2 cursor-pointer">
          <span><span className="text-gray-500">Today</span><br />Closed</span>
        </span>
      </HoursPopup>
    );
  }

  return (
    <HoursPopup
      locationName={locationName}
      locationHours={locationHours}
      locationUrl={locationUrl}
    >
      <span className="flex flex-row items-start gap-1 text-sm my-2 cursor-pointer">
        <span>
          <span className="text-gray-500">Today</span><br />
          <span className="flex flex-row items-start gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {displayOpenHours}

          </span>
        </span>
      </span>
    </HoursPopup>
  );
}
