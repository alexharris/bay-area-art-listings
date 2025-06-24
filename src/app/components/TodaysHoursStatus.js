import React from 'react';

export default function OpenStatus({ locationHours, locationUrl }) {
  if (!locationHours) {
    return (
      <a className="flex flex-row items-center gap-1 underline" href={locationUrl}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 feather feather-circle fill-gray-600" viewBox="0 0 24 24" stroke="smoke" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
        Check site for hours
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
      <span className="flex flex-row items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 feather feather-circle fill-red-600" viewBox="0 0 24 24" stroke="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
        Closed today
      </span>
    );
  }

  return (
    <span className="flex flex-row items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-green-600 feather feather-circle" viewBox="0 0 24 24" stroke="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
      Today: {displayOpenHours}
    </span>
  );
}
