'use client'

import { useState, useEffect, useRef } from 'react';
import getListings from './getListings';
import getLocations from './getLocations';
import CalendarLink from './calendarLink';
import DatePicker from './datePicker';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { format, set, setDay } from 'date-fns';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";


// Dynamically import MapContainer, TileLayer, Marker, and Popup from react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    if (date.getFullYear() === currentYear) {
        return format(date, 'MMMM d');
    }
    return format(date, 'MMMM d, yyyy');
}




export default function displayListings() {
    // Initial data
    const [listings, setListings] = useState([]);
    const [locations, setLocations] = useState([]);    
    // Filtering
    const [calendarTypeFilter, setCalendarTypeFilter] = useState('onview'); // onview, opening, closing
    const [calendarDateRangeFilter, setCalendarDateRangeFilter] = useState([]); // actual date range to filter on    
    const [filteredListings, setFilteredListings] = useState([]);
    const [highlightsOnly, setHighlightsOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    //  Sorting
    const [sortDate, setSortDate] = useState([]);
    // Display
    const [calendarDateRangePreset, setCalendarDateRangePreset] = useState('thisweek');
    const [showDetails, setShowDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [isMapView, setIsMapView] = useState(false);
    const [L, setL] = useState(null);
    const [displayedResults, setDisplayedResults] = useState(0); // number of results
    const [showMenu, setShowMenu] = useState(false);


    // Date Variables
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);    

    // Load initial data
    useEffect(() => {
        async function fetchData() {
            try {
                // Set Data
                const data = await getListings();
                setListings(data);
                const locationData = await getLocations();
                setLocations(locationData); 
                // Set Filter Status
                setCalendarTypeFilter('onview');
                setCalendarDateRangeFilter({ from: startOfWeek, to: endOfWeek });
                setCalendarDateRangePreset('thisweek');
            } catch (error) {
                console.error('Data retrieval failed:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);  

    // Update filtered listings when filters change
    useEffect(() => {
        const filteredListings = listings
            .filter(item => highlightsOnly ? item.Highlight : true)
            .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
            .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(item => {
                const startDate = new Date(item.StartDate);
                const endDate = new Date(item.EndDate);
                if (calendarTypeFilter === 'onview') {
                    return (startDate <= calendarDateRangeFilter.to && endDate >= calendarDateRangeFilter.from);
                } else if (calendarTypeFilter === 'opening') {
                    return startDate >= calendarDateRangeFilter.from && startDate <= calendarDateRangeFilter.to;
                } else if (calendarTypeFilter === 'closing') {
                    return endDate >= calendarDateRangeFilter.from && endDate <= calendarDateRangeFilter.to;
                }
                return true;
            });
        setDisplayedResults(filteredListings.length);
        setFilteredListings(filteredListings);
    }, [calendarDateRangeFilter, calendarTypeFilter, highlightsOnly, searchTerm, listings, selectedLocation]);

    // Toggle map view
    useEffect(() => {
        if (isMapView) {
            // Dynamically import Leaflet and related assets
            import('leaflet').then(L => {
                setL(L);
            });
        }
    }, [isMapView]);

    // Toggle highlights filter
    function toggleHighlights() {
        setHighlightsOnly(!highlightsOnly);
    }

    // function filterListings(listingsToFilter = listings) {
    //     let filtered = [...listingsToFilter];

    //     if (calendarTypeFilter === 'onview') {
    //         filtered = filtered.filter(item => {
    //             const startDate = new Date(item.StartDate);
    //             const endDate = new Date(item.EndDate);
    //             return (startDate <= calendarDateRangeFilter.to && endDate >= calendarDateRangeFilter.from);
    //         });
    //     } else if (calendarTypeFilter === 'opening') {
    //         filtered = filtered.filter(item => {
    //             const startDate = new Date(item.StartDate);
    //             return startDate >= calendarDateRangeFilter.from && startDate <= calendarDateRangeFilter.to;
    //         });
    //     } else if (calendarTypeFilter === 'closing') {
    //         filtered = filtered.filter(item => {
    //             const endDate = new Date(item.EndDate);
    //             return endDate >= calendarDateRangeFilter.from && endDate <= calendarDateRangeFilter.to;
    //         });
    //     }

    //     setFilteredListings(filtered);
    // }    

    // useEffect(() => {
    //     filterListings();
    // }, [sortDate, calendarTypeFilter, listings, highlightsOnly]);
    function updateCalendarDateRangeFilter(dateRange){
        const adjustedFilter = {
            from: new Date(dateRange.from).setHours(0, 1, 0, 0),
            to: new Date(dateRange.to).setHours(23, 59, 0, 0)
        };
        setCalendarDateRangeFilter(adjustedFilter);
        setCalendarDateRangePreset('custom');
    }


    return (
   
          
        <div className="flex flex-row w-full gap-8 items-start">

            {/* Sidebar */}
            <div className={`${showMenu ? 'flex' : 'hidden'} flex-col fixed md:sticky md:top-2 md:flex inset-0 z-40 p-2 md:inset-unset md:w-96 gap-4 bg-gray-50 `}>
                

                <svg className="absolute top-2 right-2 md:hidden icon-link" onClick={() => setShowMenu(prev => !prev)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>                                    
                    
                
                <div className="flex flex-col grow pb-2 border-b border-gray-200 mt-8 md:mt-0">
                    <label htmlFor="searchTerm" className="text-sm uppercase font-bold pb-2">Search</label>
                    <input 
                        type="text" 
                        id="searchTerm"
                        className="p-1 border"
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>   
                <div className="pb-2 border-b border-gray-200">
                    <div className="uppercase text-sm pb-2 font-bold">Calendar</div>
                    <div className="flex flex-row gap-2 mb-2">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="calendarTypeFilter">Type</label>
                            <div id="calendarTypeFilter" className="p-1 border cursor-pointer">
                                <div onClick={() => setCalendarTypeFilter('onview')} className={calendarTypeFilter === 'onview' ? 'bg-gray-200' : ''}>On View</div>
                                <div onClick={() => setCalendarTypeFilter('opening')} className={calendarTypeFilter === 'opening' ? 'bg-gray-200' : ''}>Opening</div>
                                <div onClick={() => setCalendarTypeFilter('closing')} className={calendarTypeFilter === 'closing' ? 'bg-gray-200' : ''}>Closing</div>
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="filterResults">Date Range</label>
                            <div id="filterResults" className="p-1 border cursor-pointer">
                                <div onClick={() => { setCalendarDateRangeFilter({ from: new Date().setHours(0, 0, 0, 0), to: new Date().setHours(23, 59, 59, 999) }); setCalendarDateRangePreset('today'); }} className={calendarDateRangePreset === 'today' ? 'bg-gray-200' : ''}>Today</div>
                                <div onClick={() => { setCalendarDateRangeFilter({ from: startOfWeek.setHours(0, 0, 0, 0), to: endOfWeek.setHours(23, 59, 59, 999) }); setCalendarDateRangePreset('thisweek'); }} className={calendarDateRangePreset === 'thisweek' ? 'bg-gray-200' : ''}>This Week</div>
                                <div onClick={() => { setCalendarDateRangeFilter({ from: startOfMonth.setHours(0, 0, 0, 0), to: endOfMonth.setHours(23, 59, 59, 999) }); setCalendarDateRangePreset('thismonth'); }} className={calendarDateRangePreset === 'thismonth' ? 'bg-gray-200' : ''}>This Month</div>
                                <div onClick={() => { setCalendarDateRangeFilter({ from: startOfNextMonth.setHours(0, 0, 0, 0), to: endOfNextMonth.setHours(23, 59, 59, 999) }); setCalendarDateRangePreset('nextmonth'); }} className={calendarDateRangePreset === 'nextmonth' ? 'bg-gray-200' : ''}>Next Month</div>                                
                                <div className={calendarDateRangePreset === 'custom' ? 'bg-gray-200' : ''}>Custom</div>
                            </div>
                        </div>                       
                    </div>
                    <div className='border px-1'>
                        <DayPicker
                            mode="range"
                            onSelect={(dateRange) => updateCalendarDateRangeFilter(dateRange)}
                            selected={calendarDateRangeFilter}
                            required
                            showOutsideDays
                        />                        
                    </div>
                </div>
                <div className="flex flex-col pb-2 border-b border-gray-200">
                    <div className="uppercase text-sm pb-2 font-bold">Location</div>
                    <label htmlFor="locationFilter">Venue</label>
                    <select 
                        id="locationFilter" 
                        onChange={(e) => setSelectedLocation(e.target.value)} 
                        className="p-1 bg-white border"
                    >
                        <option value="">All Locations</option>
                        {locations.map((location, index) => (
                            <option key={index} value={location.Name}>{location.Name}</option>
                        ))}
                    </select>
                </div>                 
                <label className="p-2">
                    <input 
                        type="checkbox" 
                        className="mr-2"
                        checked={highlightsOnly} 
                        onChange={toggleHighlights} 
                    />
                    Sarah Hotchkiss is excited about it
                </label>
                <button 
                    onClick={() => {
                        setHighlightsOnly(false);
                        setSearchTerm('');
                        setSelectedLocation('');
                        setCalendarTypeFilter('onview');
                        setCalendarDateRangeFilter({ from: startOfWeek, to: endOfWeek });
                        setSortDate({from: new Date(), to: new Date()});
                    }} 
                    className="border p-2 block"
                >
                    Clear All Filters
                </button>                    
            </div>
            

            {/* Main Col */}
            <div className="w-full">
                {loading ? (
                    <div className="spinner animate-spin text-3xl text-center w-full">
                        🎨
                    </div>
                ) : (
                    <>  
                    <div className="flex flex-row justify-between items-center border-b border-black pb-2">

                        <div className="flex md:hidden icon-link">

                            <svg onClick={() => setShowMenu(prev => !prev)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>

                        </div>    
                        <div>
                            <p>{displayedResults} results found</p>
                        </div>     
                        <div className="flex flex-row gap-4">
                            <span 
                                className={isMapView ? '' : 'font-bold'} 
                                onClick={() => setIsMapView(false)}
                            >
                                List
                            </span>
                            <span 
                                className={isMapView ? 'font-bold' : ''} 
                                onClick={() => setIsMapView(true)}
                            >
                                Map
                            </span>
                        </div>                                              
                    </div>

                        {isMapView && L ? (
                            <div id="map-view" className="w-full">
                                <div className="h-[50vh] border w-full">
                                <MapContainer center={[37.7749, -122.4194]} zoom={8} scrollWheelZoom={true} className="h-[50vh] border w-full">
                                    <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    { 
                                    filteredListings
                                        .filter(item => highlightsOnly ? item.Highlight : true)
                                        .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
                                        .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((item, index) => {
                                            const location = locations.find(loc => loc.Name === item.locationName);
                                            
                                            return location && location.Geolocation ? (
                                                <Marker 
                                                    key={index} 
                                                    position={[location.Geolocation.lat, location.Geolocation.lng]} 
                                                    icon={L.icon({
                                                        iconUrl: item.Highlight 
                                                            ? "data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 25.3167C20.1833 19.8333 23.3333 15.1667 23.3333 11.6667C23.3333 9.19131 22.35 6.81734 20.5997 5.067C18.8493 3.31666 16.4754 2.33333 14 2.33333C11.5246 2.33333 9.15068 3.31666 7.40034 5.067C5.65 6.81734 4.66667 9.19131 4.66667 11.6667C4.66667 15.1667 7.81667 19.7167 14 25.3167Z' fill='%23D9D9D9' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 15.1667C15.933 15.1667 17.5 13.5997 17.5 11.6667C17.5 9.73367 15.933 8.16667 14 8.16667C12.067 8.16667 10.5 9.73367 10.5 11.6667C10.5 13.5997 12.067 15.1667 14 15.1667Z' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cg clip-path='url(%23clip0_1_2)'%3E%3Cpath d='M21 1.16667L22.8025 4.81833L26.8333 5.4075L23.9167 8.24833L24.605 12.2617L21 10.3658L17.395 12.2617L18.0833 8.24833L15.1667 5.4075L19.1975 4.81833L21 1.16667Z' fill='%23FFF700' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_1_2'%3E%3Crect width='14' height='14' fill='white' transform='translate(14)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A"
                                                            : "data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 25.3167C20.1833 19.8333 23.3333 15.1667 23.3333 11.6667C23.3333 9.19131 22.35 6.81734 20.5997 5.067C18.8493 3.31666 16.4754 2.33333 14 2.33333C11.5246 2.33333 9.15068 3.31666 7.40034 5.067C5.65 6.81734 4.66667 9.19131 4.66667 11.6667C4.66667 15.1667 7.81667 19.7167 14 25.3167Z' fill='%23D9D9D9' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 15.1667C15.933 15.1667 17.5 13.5997 17.5 11.6667C17.5 9.73367 15.933 8.16667 14 8.16667C12.067 8.16667 10.5 9.73367 10.5 11.6667C10.5 13.5997 12.067 15.1667 14 15.1667Z' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A",
                                                    })}
                                                >
                                                    <Popup>
                                                        <div><b>{item.Event}</b><br /><a href={'/location/' + item.Location._ref}>{item.locationName}</a><br />{item.locationAddress}</div>
                                                    </Popup>
                                                </Marker>
                                            ) : null;
                                        })
                                    }
                                </MapContainer>
                                </div>

                            </div>
                        ) : (
                            <ul id="list-view" className="w-full">
                                {
                                    filteredListings
                                        .map((item, index) => (
                                            <li className="border-b border-dashed border-black py-4 w-full relative" key={index}>
                                                <h2 className="font-bold text-xl pr-8"><a className="" href={'/listing/' + item._id}>{item.Event}</a>{item.Highlight && '★'}</h2>
                                                <a className="underline" href={'/location/' + item.Location._ref}>{item.locationName}</a> 
                                                <div>{formatDate(item.StartDate)} - {formatDate(item.EndDate)}</div>
                                                {item.Notes && <div className="mt-2">Notes: {item.Notes}</div>}
                                                <CalendarLink listing={item} location="" />
                                                <button className="text-gray-500 mt-2" onClick={() => setShowDetails(prev => ({ ...prev, [index]: !prev[index] }))}>
                                                    {showDetails[index] ? 'Hide Details' : 'Show Details'}
                                                </button>
                                                {showDetails[index] && (
                                                    <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                                                        <div className="prose">
                                                            {/* <div>URL: <a href={item.URL}>{item.URL}</a></div> */}
                                                            <div>Venue: {item.locationName}</div>
                                                            <div>Address: {item.locationAddress}</div>
                                                            <div>Website: <a className="underline" href={item.locationUrl}>{item.locationUrl}</a></div>                                                    
                                                            
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                    ))
                                }
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    
    )
}


