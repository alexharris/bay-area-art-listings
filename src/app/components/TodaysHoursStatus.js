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
        <span><span className="text-gray-500">Today</span><br />{displayOpenHours}</span>
      </span>
    </HoursPopup>
  );
}
