import { useState } from 'react';
import CalendarLink from './calendarLink';

export default function Listings({ listings, formatDate }) {
    const [showDetails, setShowDetails] = useState({});

    console.log(listings)

    return (
      <ul id="list-view" className="w-full">
        {
          listings.map((item, index) => (
            <li className="border-b min-h-40 border-dashed border-gray-300 py-4 w-full relative flex flex-col lg:flex-row justify-between gap-4" key={index}>
              <div className="w-full lg:w-1/3 flex flex-col justify-between">
                <h2 className="font-bold">{item.Event}{item.Highlight && '★'}</h2>
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
              <div className="flex flex-col gap-2 w-full lg:w-1/3 text-left items-start justify-between">
                
                  {formatDate(item.StartDate)} - {formatDate(item.EndDate)}                     
                  <span className="underline flex flex-row gap-1 items-center cusror-pointer" >                    
                    <CalendarLink listing={item} location="" />                    
                  </span>                                                                             
                
              </div>
              <div className="flex flex-col justify-between w-full lg:w-1/3">              
              {item.locationName.toLowerCase() === 'various' 
                ? <div className="flex flex-row">
                    {item.locationName}                   
                  </div> 
                : <>
                    <div className="flex flex-row items-center gap-1">
                      {item.locationName}                   
                    </div> 


     
                    <div className="flex flex-row items-center gap-2">
                      <a
                        className="flex flex-row gap-1 items-center"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-8 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {/* {item.locationAddress} */}
                      </a>
            
                      <a className="underline flex flex-row gap-1 items-center" 
                        href={item.locationUrl}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-8 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>                        
                        {/* {item.locationUrl} */}
                        
                      </a>
                      <span className="underline flex flex-row gap-1 items-center" 
                        href={item.locationUrl}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-clock w-8 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>                      
                      </span>                       
                    </div>                             
                  </>                  
              }                                                
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
