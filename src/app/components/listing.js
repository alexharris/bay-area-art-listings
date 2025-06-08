import { useState, useEffect, useRef } from 'react';
import CalendarLink from './calendarLink';

export default function Listings({ listings, formatDate }) {
    const [showDetails, setShowDetails] = useState({});
    const [showHoursPopup, setShowHoursPopup] = useState(null);
    const popupRef = useRef(null);

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowHoursPopup(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    console.log(listings)

    return (
      <ul id="list-view" className="w-full">
        {
          listings.map((item, index) => (
            <li className="border-b min-h-40 border-dashed border-gray-400 py-5 w-full relative flex flex-col lg:flex-row justify-between gap-2 lg:gap-4" key={index}>
              <div className="w-full lg:w-1/2 flex flex-col justify-between">
                <h2 className="text-2xl lg:text-3xl mb-2 lg:mb-0">{item.Event}{item.Highlight && '★'}</h2>
                {item.Notes && <div className="mt-2">Notes: {item.Notes}</div>}
                  <div>
                    {item.locationHours && (
                      <div className="leading-tight">
                        {(() => {
                          const today = new Date();
                          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          const todayName = days[today.getDay()];
                          const openHours = item.locationHours[todayName];
                          // Check if the item has open hours for today
                          const displayOpenHours = openHours 
                            ? openHours.replace(`${todayName}: `, '').replace(`${todayName}:`, '') 
                            : null;
                          
                          if (!openHours || openHours.toLowerCase().includes('closed')) {
                            return <span className="flex flex-row items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 feather feather-circle fill-red-600" viewBox="0 0 24 24" stroke="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                              Closed today
                            </span>;
                          }
                          return <span className="flex flex-row items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-green-600 feather feather-circle" viewBox="0 0 24 24" stroke="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                            Today: {displayOpenHours}
                            </span>;
                        })()}
                      </div>
                    )} 
                    {!item.locationHours && 
                      <a className="flex flex-row items-center gap-1 underline" href={item.locationUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 feather feather-circle fill-gray-600" viewBox="0 0 24 24" stroke="smoke" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                        Check site for hours
                      </a>
                    }
                  </div>                 
              </div>
              <div className="flex flex-col items-start justify-between w-full lg:w-1/4">              
              {item.locationName.toLowerCase() === 'various' 
                ? <div className="flex flex-row">
                    {item.locationName}
                  </div> 
                : <>
                    <div className="flex flex-row items-center gap-1 mb-1 lg:mb-0">
                      <a href={item.locationUrl}>{item.locationName}</a>                   
                    </div> 
                    <div className="flex flex-row items-center gap-2">
                      <a
                        className="flex flex-row gap-1 items-center"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {/* {item.locationAddress} */}
                      </a>
            
                      <a className="underline flex flex-row gap-1 items-center" 
                        href={item.locationUrl}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>                        
                        {/* {item.locationUrl} */}
                                    
                                    </a>
                                    <div className="relative">
                                    {item.locationHours ? (
                                      <span 
                                      className="underline flex flex-row gap-1 items-center cursor-pointer" 
                                      onClick={() => setShowHoursPopup(showHoursPopup === index ? null : index)}
                                      title="View hours"
                                      >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-clock w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>                      
                                      </span>
                                    ) : (
                                      <span className="flex flex-row gap-1 items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-clock w-6 lg:w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>                      
                                      </span>
                                    )}
                                    
                                    {showHoursPopup === index && (
                                      <div 
                                      ref={popupRef}
                                      className="absolute z-50 top-full -left-16 lg:-right-20 lg:right-0 mt-1 p-3 bg-white shadow-lg border border-black w-96"
                                      >
                                      <button 
                                        onClick={() => setShowHoursPopup(null)}   
                                        className="absolute top-1 right-1 p-1 text-gray-500 hover:text-gray-800"
                                        aria-label="Close"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      </button>
                                      <h4 className="font-semibold mb-2">{item.locationName} Hours</h4>
                                      {item.locationHours ? (
                                        <ul className="text-sm space-y-1">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                  const isToday = day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
                                  const hours = item.locationHours[day]
                                    ? item.locationHours[day].replace(`${day}: `, '').replace(`${day}:`, '')
                                    : 'Not specified';
                                  const isClosed = hours.toLowerCase().includes('closed');
                                  
                                  return (
                                    <li key={day} className={`flex justify-between ${isToday ? 'bg-gray-200 p-1' : ''}`}>
                                      <span className="mr-4">{day}:</span>
                                      <span>
                                        {hours}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <div className="text-sm text-gray-600">
                                <p>No hours information available.</p>
                                {item.locationUrl && (
                                  <p className="mt-1">
                                    <a href={item.locationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                      Visit website for details
                                    </a>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>                             
                  </>                  
              }                                                
              </div>              
              <div className="flex flex-col gap-2 w-full lg:w-1/4 text-left items-start justify-between">
                
                  <span>{formatDate(item.StartDate)} - {formatDate(item.EndDate)}</span>
                  <CalendarLink listing={item} location="" />
                
              </div>

              {/*               
              <button className="text-gray-500 mt-2 w-full text-left" onClick={() => setShowDetails(prev => ({ ...prev, [index]: !prev[index] }))}>
                {showDetails[index] ? 'Hide Details' : 'Details'}
              </button> */}
              {showDetails[index] && (
                <div className="border-t border-dashed border-gray-100 mt-2">
                  <div className="prose">
           
                      <a
                        className="underline flex flex-row gap-1 items-center"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {item.locationAddress}
                      </a>
            
                      <a className="underline flex flex-row gap-1 items-center" 
                        href={item.locationUrl}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-globe"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>                        
                        {item.locationUrl}
                        
                      </a>
                    </div>
                  </div>
              
              )}
            </li>
          ))
        }
      </ul>
    );
}
