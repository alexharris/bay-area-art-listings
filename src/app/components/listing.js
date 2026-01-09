import { useState } from 'react';
import CalendarLink from './CalendarLink';
import NotesRenderer from './NotesRenderer';
import DateNote from './DateNote';
import HoursPopup from './HoursPopup';
import TodaysHoursStatus from './TodaysHoursStatus';
import CityFromPlaceId from './CityFromPlaceId';
import { Badge } from '@/components/ui/badge';

// Generate URL-friendly slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function Listings({ 
  listings, 
  formatDate, 
  onViewToday,
  setOnViewToday,
  sfArtWeekOnly,
  setSfArtWeekOnly,
  endingSoonOnly,
  setEndingSoonOnly,
  openingTodayOnly,
  setOpeningTodayOnly
}) {
  const [showDetails, setShowDetails] = useState({});

  // Helper function to check if show is on view and gallery is open today
  // Now uses pre-computed value from getListings for better performance
  const shouldShowOpenToday = (item) => {
    return item.isOnViewToday === true;
  };

  return (
    <ul id="list-view" className="w-full px-3 md:p-2 lg:p-0">
      {listings.map((item, index) => (
        <li className="border-b min-h-40 border-dashed border-gray-400 pt-5 pb-6 w-full relative flex flex-col md:flex-row justify-between gap-2 lg:gap-4" key={index}>

          
          {/* Left Column - Event and Note */}
          {item.EventUrl
            ? <div className="flex flex-col lg:flex-row lg:gap-4 justify-start mb-2 lg:mb-0 w-full lg:w-2/3">
              {/* Thumbnail Image */}
              {item.eventImageUrl && (
                <div className=" flex-shrink-0 mb-3 lg:mb-0">
                  <img 
                    src={item.eventImageUrl} 
                    alt={item.eventImageCaption || item.Event}
                    className="max-h-56 w-auto lg:max-h-none lg:w-36 lg:h-36 object-cover"
                  />
                  {item.eventImageCaption && (
                    <p className="text-xs text-gray-600 mt-1">{item.eventImageCaption}</p>
                  )}
                </div>
              )}         
              <div className="flex flex-col justify-between">
                <div className="flex flex-col">
                  <a 
                    href={item.EventUrl}
                    target="_blank"
                    className="text-2xl lg:text-3xl mb-2 lg:mb-0"
                  >
                    <h2 className=""><span className="inline-block float-left">{item.Event}</span></h2>
                  </a>
                  {item.sfawUrl && (
                    <a href={item.sfawUrl} className="text-sm underline  flex flex-row mt-2" target="_blank">
                      SF Art Week <svg className="feather feather-external-link w-4 pb-1 ml-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>                      
                    </a>
                  )}                  
                  
                  <NotesRenderer notes={item.Notes} itemIndex={index} />
                </div>
                <div className="flex gap-3 items-center">
                  <a className="self-start" href={item.EventUrl} target="_blank">
                    <svg className="feather feather-external-link w-6 lg:w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" ><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>                      
                  </a>
                  {shouldShowOpenToday(item) && (
                    <Badge 
                      className="bg-green-300 hover:bg-green-400 text-black cursor-pointer transition-colors"
                      onClick={() => setOnViewToday(!onViewToday)}
                    >
                      On View Today
                    </Badge>
                  )}                  
                  {item.sfawUrl && (
                    <Badge 
                      className="bg-yellow-300 hover:bg-yellow-400 text-black cursor-pointer transition-colors"
                      onClick={() => setSfArtWeekOnly(!sfArtWeekOnly)}
                    >
                      SF Art Week
                    </Badge>
                  )}

                  {/* <a 
                    href={`/show/${generateSlug(item.Event)}`}
                    className="text-sm underline hover:no-underline"
                  >
                    View details
                  </a> */}
                </div>                      
              </div>
              </div>       
            : <div className="flex flex-col justify-between mb-2 lg:mb-0 w-full lg:w-1/2">
                <span className="text-2xl lg:text-3xl mb-2 lg:mb-0">
                  <h2>{item.Event}</h2>
                </span>
                <NotesRenderer notes={item.Notes} itemIndex={index} />
                {(item.sfawUrl || shouldShowOpenToday(item)) && (
                  <div className="mt-2 flex gap-3 items-center">
                    {item.sfawUrl && (
                      <Badge 
                        className="bg-[#FFEB3B] hover:bg-[#FDD835] text-black cursor-pointer transition-colors"
                        onClick={() => setSfArtWeekOnly(!sfArtWeekOnly)}
                      >
                        SF Art Week
                      </Badge>
                    )}
                    {shouldShowOpenToday(item) && (
                      <Badge 
                        className="bg-green-400 hover:bg-green-500 text-black cursor-pointer transition-colors"
                        onClick={() => setOnViewToday(!onViewToday)}
                      >
                        Open Today
                      </Badge>
                    )}
                  </div>
                )}
              </div>
          }
          
          {/* Right Side Container - Date and Location stacked */}
          <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-2 lg:gap-4 w-full lg:w-1/2">
          
          {/* Middle Column - Date Info  */}
          <div className="flex flex-col gap-2 w-full text-left items-start justify-start">      
            <div className="flex flex-col items-start gap-1">
              <div className="font-semibold">
                {item.DateOverride || `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`}
              </div>         
            </div>

            <div className="flex flex-row gap-2 items-start">
              <CalendarLink listing={item} location="" />
              <DateNote 
                startDate={item.StartDate} 
                endDate={item.EndDate}
                endingSoonOnly={endingSoonOnly}
                setEndingSoonOnly={setEndingSoonOnly}
                openingTodayOnly={openingTodayOnly}
                setOpeningTodayOnly={setOpeningTodayOnly}
              />
            </div>
          </div>

          {/* Right Column - Location Info */}
          <div className="w-full">              
            <div className="bg-gray-50 rounded p-4 mr-4 h-full flex flex-col justify-between">
              {item.locationName.toLowerCase() === 'various' 
                ? <div className="flex flex-row font-semibold">
                    {item.eventUrl
                      ? <a 
                          href={item.eventUrl}
                          target="_blank"
                        >
                          {item.locationName}
                        </a>
                      : <span>{item.locationName}</span>
                    }                     
                  </div> 
                : <>
                    <div className="flex flex-col items-start gap-1 mb-1 lg:mb-0">
                      <div>
                        <a 
                          href={item.locationUrl}
                          target="_blank"
                          className="font-semibold"
                        >
                          {item.locationName}
                        </a>              
                      </div> 
 
                      <CityFromPlaceId 
                        googlePlaceId={item.googlePlaceId} 
                        fallbackAddress={item.locationAddress} 
                      />
                      
                      <TodaysHoursStatus 
                        locationHours={item.locationHours}
                        locationUrl={item.locationUrl}
                        locationName={item.locationName}
                      />
                    </div>    
                    
                    <div className="flex flex-row items-center gap-2 mt-1">
                      <a
                        className="flex flex-row gap-1 items-center"
                        href={item.googlePlaceId 
                          ? `https://www.google.com/maps/place/?q=place_id:${item.googlePlaceId}` 
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationName + ' ' + item.locationAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {/* {item.locationAddress} */}
                      </a>
            
                      <a 
                        className="underline flex flex-row gap-1 items-center" 
                        href={item.locationUrl}
                        target="_blank"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-globe w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>                        
                      </a>
                      
                      <div>
                        {item.locationHours ? (
                          <HoursPopup
                            locationName={item.locationName}
                            locationHours={item.locationHours}
                            locationUrl={item.locationUrl}
                          >
                            <span 
                              className="underline flex flex-row gap-1 items-center cursor-pointer" 
                              title="View hours"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-clock w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>                      
                            </span>
                          </HoursPopup>
                        ) : (
                          <span className="flex flex-row gap-1 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-clock w-6 lg:w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>                      
                          </span>
                        )}                                   
                      </div>
                      
                      {item.locationInstagram && (
                        <a
                          className="underline flex flex-row gap-1 items-center"
                          href={`https://instagram.com/${item.locationInstagram.replace(/^@/, '')}`}
                          target="_blank"
                          title="Instagram"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-instagram w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>
                          </svg>
                        </a>
                      )}
                    </div>                             
                  </>                  
              }        
            </div>                                        
          </div>
          
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
      ))}
    </ul>
  );
}
