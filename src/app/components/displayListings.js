'use client'

import { useState, useEffect, useRef } from 'react';
import getListings from './getListings';
import getLocations from './getLocations';
import CalendarLink from './calendarLink';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { format, set, setDay } from 'date-fns';
import { DayPicker, Select } from "react-day-picker";
import DisplayFilters from './displayFilters';
import CountySelector from './countySelector';
import "react-day-picker/style.css";
import AddEmailForm from './addEmailForm';
import { getFilteredListings } from '../../utils/filters';
import { sortListingsChronologically } from '../../utils/sort'; 
import { extractPortableTextContent } from '../../utils/helpers';
import MobileIconMenu from './mobileIconMenu';
import MobileFilterBottomSheet from './mobileFilterBottomSheet';
import Link from "next/link";
import Listing from './listing';
import FilterPresets from './filterPresets';
import TodaysHoursStatus from './TodaysHoursStatus';

// Dynamically import MapContainer, TileLayer, Marker, and Popup from react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Feature flags
const sidebarCalendarIsEnabled = true; // Set to false to disable calendar features
const simpleDateSelectEnable = false; // Set to true to enable simple date select



// TODO
// dont show year if its the current year
function formatDate(dateString) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function DisplayListings() {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);   


    // Initial data
    const [listings, setListings] = useState([]);
    const [locations, setLocations] = useState([]);    
    // Filtering
    const [calendarTypeFilter, setCalendarTypeFilter] = useState('onview'); // onview, opening, closing
    const [calendarDateRangeFilter, setCalendarDateRangeFilter] = useState([]); // actual date range to filter on    
    const [filteredListings, setFilteredListings] = useState([]);
    const [highlightsOnly, setHighlightsOnly] = useState(false);
    const [openHoursOnly, setOpenHoursOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCounty, setSelectedCounty] = useState({});
    // Map popup pagination state
    const [popupPages, setPopupPages] = useState({});
    //  Sorting
    const [sortDate, setSortDate] = useState([]);
    // Display
    const [calendarDateRangePreset, setCalendarDateRangePreset] = useState('custom');
    const [showDetails, setShowDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [isMapView, setIsMapView] = useState(false);
    const [L, setL] = useState(null);
    const [displayedResults, setDisplayedResults] = useState(0); // number of results
    const [showMenu, setShowMenu] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showCustomCalendar, setShowCustomCalendar] = useState(false);



    // Add this new effect to handle URL parameters
    useEffect(() => {
        console.log('Checking URL parameters and setting initial state...');
        // Only run in the browser
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            
            // Handle searchTerm parameter
            if (params.has('searchTerm')) {
                setSearchTerm(params.get('searchTerm'));
            }
            
            // Handle selectedLocation parameter
            if (params.has('selectedLocation')) {
                setSelectedLocation(params.get('selectedLocation'));
            }
            
            // Handle selectedCounty parameter
            // if (params.has('selectedCounty')) {
            //     console.log('Selected County:', params.get('selectedCounty'));
            //     setSelectedCounty(params.get('selectedCounty'));
            // }
            
            // Handle highlightsOnly parameter
            if (params.has('highlightsOnly')) {
                setHighlightsOnly(params.get('highlightsOnly') === 'true');
            }

            // Handle openHoursOnly parameter
            if (params.has('openHoursOnly')) {
                setOpenHoursOnly(params.get('openHoursOnly') === 'true');
            }
            
            // Handle calendarTypeFilter parameter
            if (params.has('calendarTypeFilter')) {
                const type = params.get('calendarTypeFilter');
                if (['onview', 'opening', 'closing'].includes(type)) {
                    setCalendarTypeFilter(type);
                }
            } else {
                // Default to 'onview' if no type is specified
                setCalendarTypeFilter('onview');    
            }

            // Handle date range parameters
            if (params.has('dateFrom') && params.has('dateTo')) {
                try {
                    const from = new Date(params.get('dateFrom'));
                    const to = new Date(params.get('dateTo'));                    
                    
                    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
                        updateCalendarDateRangeFilter({
                            from: params.get('dateFrom'),
                            to: params.get('dateTo')
                        });                        
                    }
                } catch (e) {
                    console.error('Invalid date format in URL parameters:', e);
                }
            }
            
            // Handle view mode parameter
            if (params.has('view')) {
                setIsMapView(params.get('view') === 'map');
            }
        }
    }, []);


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
                // setCalendarTypeFilter('onview');
                
                // Only set calendar filters if the feature flag is enabled
                // if (sidebarCalendarIsEnabled) {
                setCalendarDateRangeFilter({ from: startOfMonth, to: endOfMonth });
                setCalendarDateRangePreset('thismonth');
                // }
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
        // Create an object of all of the filter variables
        const filters = {
            highlightsOnly: highlightsOnly,
            openHoursOnly: openHoursOnly,
            searchTerm: searchTerm,
            selectedLocation: selectedLocation,
            selectedCounty: selectedCounty,
            calendarTypeFilter: calendarTypeFilter,
            calendarDateRangeFilter: calendarDateRangeFilter,
        };

        // const filteredListings = listings
        //     .filter(item => highlightsOnly ? item.Highlight : true)
        //     .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
        //     .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
        //     .filter(item => selectedCounty[0] ? selectedCounty[0].zipcodes.some(zipcode => item.locationAddress.includes(zipcode)) : true)
        //     .filter(item => {
        //         const startDate = new Date(item.StartDate);
        //         const endDate = new Date(item.EndDate);
        //         if (calendarTypeFilter === 'onview') {
        //             return (startDate <= calendarDateRangeFilter.to && endDate >= calendarDateRangeFilter.from);
        //         } else if (calendarTypeFilter === 'opening') {
        //             return startDate >= calendarDateRangeFilter.from && startDate <= calendarDateRangeFilter.to;
        //         } else if (calendarTypeFilter === 'closing') {
        //             return endDate >= calendarDateRangeFilter.from && endDate <= calendarDateRangeFilter.to;
        //         }
        //         return true;
        //     });
        
        const filteredListings = getFilteredListings(filters, listings);
        const sortedListings = sortListingsChronologically(filteredListings)
        const sortedListingsAlphabetically = filteredListings.sort((a, b) => a.Event.localeCompare(b.Event));
        // Sort listings by end date (soonest first)
        const sortedListingsBySoonestEndDate = filteredListings.sort((a, b) => {
            // Convert end dates to Date objects for comparison
            const endDateA = new Date(a.EndDate);
            const endDateB = new Date(b.EndDate);
            // Sort by ascending order (soonest first)
            return endDateA - endDateB;
        });
        
        setFilteredListings(sortedListingsBySoonestEndDate);
        setDisplayedResults(filteredListings.length);
        
        // getListingsForThisWeek(filters, listings);

        console.log('updating url params when filters change')

        // Update URL parameters based on filters
        const params = new URLSearchParams();

        // // Only add non-default values to URL params
        if (searchTerm) params.set('searchTerm', searchTerm);
        if (selectedLocation) params.set('selectedLocation', selectedLocation);
        if (selectedCounty && selectedCounty[0] && selectedCounty[0].county) {
            params.set('selectedCounty', selectedCounty[0].county);
        }
        if (highlightsOnly) params.set('highlightsOnly', 'true');

        if (openHoursOnly) params.set('openHoursOnly', 'true');

        if (calendarTypeFilter && calendarTypeFilter !== 'opening') {
            params.set('calendarTypeFilter', calendarTypeFilter);
        }

        // only need to display the date range in the URL if it's not the default month range
        if (calendarDateRangeFilter.from && calendarDateRangeFilter.to) {
            const today = new Date();
            const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            startOfCurrentMonth.setHours(0, 0, 0, 0);
            endOfCurrentMonth.setHours(0,0,0,0);
            
            const isDefaultMonthRange = 
                calendarDateRangeFilter.from.getTime() === startOfCurrentMonth.getTime() && 
                calendarDateRangeFilter.to.getTime() === endOfCurrentMonth.getTime();
            

            if (!isDefaultMonthRange) {
                params.set('dateFrom', format(new Date(calendarDateRangeFilter.from), 'yyyy-MM-dd'));
                params.set('dateTo', format(new Date(calendarDateRangeFilter.to), 'yyyy-MM-dd'));
            }
        }

        if (isMapView) params.set('view', 'map');

        // // Only update URL if we have params, otherwise clear the search params
        const newUrl = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        window.history.pushState({}, '', newUrl);


    }, [calendarDateRangeFilter, calendarTypeFilter, highlightsOnly, openHoursOnly, searchTerm, listings, selectedLocation, selectedCounty]);

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

    function toggleOpenHoursOnly() {
        setOpenHoursOnly(!openHoursOnly);
    }

    // Toggle map view
    function toggleMapView() {
        const newMapView = !isMapView;
        setIsMapView(newMapView);
        
        // Update URL without reloading
        const params = new URLSearchParams(window.location.search);
        if (newMapView) {
            params.set('view', 'map');
        } else {
            params.delete('view');
        }
        
        const newUrl = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        window.history.pushState({}, '', newUrl);
        
        // Add event listener for popstate if not already added (for browser back/forward button support)
        if (typeof window !== 'undefined' && !window._popstateListenerAdded) {
            window.addEventListener('popstate', () => {
                // When the user navigates with browser buttons, update the UI accordingly
                const params = new URLSearchParams(window.location.search);
                const isMapFromUrl = params.get('view') === 'map';
                if (isMapFromUrl !== isMapView) {
                    setIsMapView(isMapFromUrl);
                }
            });
            window._popstateListenerAdded = true;
        }
    }

    function updateCalendarDateRangeFilter(dateRange){
        // Handle dates properly to avoid timezone issues
        let fromDate, toDate;
        
        if (typeof dateRange.from === 'string') {
            // Parse date strings properly to maintain the correct day
            const [year, month, day] = dateRange.from.split('-').map(Number);
            fromDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        } else {
            // If it's already a Date object
            fromDate = new Date(dateRange.from);
        }
        fromDate.setHours(0, 0, 0, 0);
        
        if (typeof dateRange.to === 'string') {
            const [year, month, day] = dateRange.to.split('-').map(Number);
            toDate = new Date(year, month - 1, day);
        } else {
            toDate = new Date(dateRange.to);
        }
        toDate.setHours(23, 59, 59, 999);
        
        const adjustedFilter = {
            from: fromDate,
            to: toDate
        };
        
        setCalendarDateRangeFilter(adjustedFilter);
        setCalendarDateRangePreset('custom');
    }


    return (
   
          
        <div className="flex flex-row w-full items-start lg:gap-4">

            {/* Sidebar */ }
            
            <div id="sidebar" className={`${showMenu ? 'inset-0': ''} flex flex-col lg:gap-4 fixed lg:sticky lg:top-4 w-full z-40 lg:w-[430px]`}>
                {/* Filter Menu */}
                <div className={`${showMenu ? 'translate-x-0 inset-0 ' : '-translate-x-full hidden'}   
                transform
                lg:transform-none
                transition-transform
                duration-300
                flex
                flex-col
                overflow-scroll
                lg:flex
                right-8
                left-0
                z-40 
                p-2
                lg:p-0
                mr-0
                lg:mr-8
                lg:inset-unset
                gap-2
                bg-white
                border-b
                border-gray-200
                border-dashed
                `}>
                    {/* Logo at the top of the sidebar */}
                    <div className="flex items-start">
                        <Link href="/">
                            <img 
                                src="/baal-handwritten-logo.png" 
                                alt="Bay Area Art List Logo"     
                                className="h-24"                       
                            />
                        </Link>
                    </div>
                    <svg className="absolute top-2 right-2 lg:hidden icon-link" onClick={() => setShowMenu(prev => !prev)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>                                    


                    {simpleDateSelectEnable &&
                        <div className="pb-1">
                            <span 
                                onClick={() => {
                                    setCalendarTypeFilter('onview');
                                    const todayFrom = new Date();
                                    todayFrom.setHours(0, 0, 0, 0);
                                    const todayTo = new Date();
                                    todayTo.setHours(23, 59, 59, 999);
                                    setCalendarDateRangeFilter({ from: todayFrom, to: todayTo }); 
                                    setCalendarDateRangePreset('today');
                                    setShowAdvancedFilters(false);
                                }}
                                className={`cursor-pointer hover:underline ${
                                    calendarTypeFilter === 'onview' && 
                                    calendarDateRangeFilter.from && 
                                    calendarDateRangeFilter.from.toDateString() === new Date().toDateString() ? 
                                    'font-bold' : ''
                                }`}                                
                            >
                                On view today
                            </span>                               
                            <br />                             
                            <span 
                                onClick={() => {
                                    setCalendarTypeFilter('opening');
                                    const june = new Date();
                                    june.setMonth(5); // June is month 5 (0-indexed)
                                    const startOfMonth = new Date(june.getFullYear(), 5, 1);
                                    startOfMonth.setHours(0, 0, 0, 0);
                                    const endOfMonth = new Date(june.getFullYear(), 5 + 1, 0);
                                    endOfMonth.setHours(23, 59, 59, 999);
                                    setCalendarDateRangeFilter({ from: startOfMonth, to: endOfMonth });
                                    setCalendarDateRangePreset('custom')
                                    setShowAdvancedFilters(false);
                                }}
                                className={`cursor-pointer hover:underline ${
                                    calendarTypeFilter === 'opening' && 
                                    calendarDateRangeFilter.from && 
                                    calendarDateRangeFilter.from.getMonth() === 5 && 
                                    calendarDateRangeFilter.from.getDate() === 1 ? 
                                    'font-bold' : ''
                                }`}                                
                            >
                                Opening in June
                            </span>   
                            <br />
                            <span 
                                onClick={() => {
                                    setCalendarTypeFilter('closing');
                                    const june = new Date();
                                    june.setMonth(5); // June is month 5 (0-indexed)
                                    const startOfMonth = new Date(june.getFullYear(), 5, 1);
                                    startOfMonth.setHours(0, 0, 0, 0);
                                    const endOfMonth = new Date(june.getFullYear(), 5 + 1, 0);
                                    endOfMonth.setHours(23, 59, 59, 999);
                                    setCalendarDateRangeFilter({ from: startOfMonth, to: endOfMonth });
                                    setCalendarDateRangePreset('custom');
                                    setShowAdvancedFilters(false);
                                }}
                                className={`cursor-pointer hover:underline ${
                                    calendarTypeFilter === 'closing' && 
                                    calendarDateRangeFilter.from && 
                                    calendarDateRangeFilter.from.getMonth() === 5 && 
                                    calendarDateRangeFilter.from.getDate() === 1 ? 
                                    'font-bold' : ''
                                }`}                                
                            >
                                Closing in June
                            </span>   
                            <br />
                            <span 
                                onClick={() => {
                                    setCalendarTypeFilter('opening');
                                    const date = new Date();
                                    date.setMonth(6); 
                                    const startOfMonth = new Date(date.getFullYear(), 6, 1);
                                    startOfMonth.setHours(0, 0, 0, 0);
                                    const endOfMonth = new Date(date.getFullYear(), 6 + 1, 0);
                                    endOfMonth.setHours(23, 59, 59, 999);
                                    setCalendarDateRangeFilter({ from: startOfMonth, to: endOfMonth });
                                    setCalendarDateRangePreset('custom');
                                    setShowAdvancedFilters(false);
                                }}
                                className={`cursor-pointer hover:underline ${
                                    calendarTypeFilter === 'opening' && 
                                    calendarDateRangeFilter.from && 
                                    calendarDateRangeFilter.from.getMonth() === 6 && 
                                    calendarDateRangeFilter.from.getDate() === 1 ? 
                                    'font-bold' : ''
                                }`}                                
                            >
                                Opening in July
                            </span>                               
                            <br />
                            <span 
                                onClick={() => {
                                    setCalendarTypeFilter('closing');
                                    const date = new Date();
                                    date.setMonth(6); 
                                    const startOfMonth = new Date(date.getFullYear(), 6, 1);
                                    startOfMonth.setHours(0, 0, 0, 0);
                                    const endOfMonth = new Date(date.getFullYear(), 6 + 1, 0);
                                    endOfMonth.setHours(23, 59, 59, 999);
                                    setCalendarDateRangeFilter({ from: startOfMonth, to: endOfMonth });
                                    setCalendarDateRangePreset('custom');
                                    setShowAdvancedFilters(false);
                                }}
                                className={`cursor-pointer hover:underline ${
                                    calendarTypeFilter === 'closing' && 
                                    calendarDateRangeFilter.from && 
                                    calendarDateRangeFilter.from.getMonth() === 6 && 
                                    calendarDateRangeFilter.from.getDate() === 1 ? 
                                    'font-bold' : ''
                                }`}                                
                            >
                                Closing in July
                            </span>                               
                            <br />                                                       
                            <span 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
                                className="flex flex-row items-center"
                            >   
                                <svg className={`${showAdvancedFilters ? 'translate rotate-90' : ''} `} width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                    <path d="M0.330059 9.33014L0.330059 0.669885L7.83006 5.00001L0.330059 9.33014Z" fill="black"/>
                                </svg>
                                <span className="pl-1">Advanced Filters</span>
                            </span>                          
                        </div>
                    } 
                    <div className="flex flex-col w-full">
                        <label htmlFor="filterResults" className="sr-only">Date Range</label>
                        <div id="filterResults">
                            <FilterPresets 
                                className="hidden lg:block"
                                setShowCustomCalendar={setShowCustomCalendar}
                                calendarDateRangePreset={calendarDateRangePreset}
                                setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                                setCalendarDateRangePreset={setCalendarDateRangePreset}
                                startOfWeek={startOfWeek}
                                endOfWeek={endOfWeek}
                                startOfMonth={startOfMonth}
                                endOfMonth={endOfMonth}
                                startOfNextMonth={startOfNextMonth}
                                endOfNextMonth={endOfNextMonth}
                            />
                        </div>
                    </div>   
                    {showCustomCalendar &&
                        <div >
                            <DayPicker
                                mode="range"
                                onSelect={(dateRange) => updateCalendarDateRangeFilter(dateRange)}
                                selected={calendarDateRangeFilter}
                                required
                                showOutsideDays
                            />                        
                        </div>
                    }                                                
               
                    <div className="flex flex-col">
                        <CountySelector 
                            onCountyChange={setSelectedCounty} 
                            selectedCountyProp={selectedCounty} 
                        />                                       
                    </div>   
                    <label className="pb-2">
                        <input 
                            type="checkbox" 
                            className="mr-2"
                            checked={openHoursOnly} 
                            onChange={toggleOpenHoursOnly} 
                        />
                        Hide closed
                    </label>                                  
                    <div className="flex flex-row pb-2 lg:mt-0 gap-2 items-center">
                        <label htmlFor="searchTerm" className="flex flex-row items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 14L11.1 11.1" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg> <span className="sr-only">Search</span>
                        </label>
                        <input 
                            type="text" 
                            id="searchTerm"
                            className="border-b border-gray-600"
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>                       
                    <span 
                        onClick={() => {
                            setHighlightsOnly(false);
                            setSearchTerm('');
                            setSelectedLocation('');
                            // Reset county filter - this will also trigger the useEffect in CountySelector
                            setSelectedCounty([]);
                            setOpenHoursOnly(false);
                            setCalendarTypeFilter('onview');
                            
                            // Create proper Date objects for startOfWeek and endOfWeek
                            const weekFrom = new Date(startOfWeek);
                            weekFrom.setHours(0, 0, 0, 0);
                            const weekTo = new Date(endOfWeek);
                            weekTo.setHours(23, 59, 59, 999);
                            
                            setCalendarDateRangeFilter({ from: weekFrom, to: weekTo });
                            setCalendarDateRangePreset('thisWeek');
                            
                            // Clear URL parameters
                            window.history.pushState({}, '', window.location.pathname);
                        }} 
                        className="underline cursor-pointer mb-4 inline-block text-gray-800 text-sm"
                    >
                        Clear All
                    </span>
                                
                    <button 
                        onClick={() => {
                            setShowMenu(false);
                        }} 
                        className={`${showMenu ? 'block lg:hidden' : 'hidden'} button`}
                    >
                    View Results ({displayedResults})
                    </button>                             
                </div>
                {/* dark mobile sidebar background */}
                {showMenu && (
                    <div 
                        className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" 
                        onClick={() => setShowMenu(false)}
                    ></div>
                )}            
                <a className="hidden lg:block" href="/about" >About</a>
                {/* <div className="hidden lg:block">
                    <AddEmailForm /> 
                </div> */}
            </div>

            {/* Main Col */}
            <div id="main-col" className="flex flex-col justify-start w-full flex-shrink">
                {loading ? (
                    <div className="animate-pulse text-5xl flex items-center justify-center w-full h-[70vh]">
                        🎨
                    </div>
                ) : (
                    <>  
                        <div className="flex flex-row justify-between align-bottom items-center border-b border-dashed border-black pb-2 mb-2">
                    
                            <div className="flex flex-row items-center justify-between w-full">
                                <div className="flex flex-row gap-2 lg:items-center w-full lg:w-2/3">
                                    <DisplayFilters                                 
                                        type={calendarTypeFilter}
                                        presetRange={calendarDateRangePreset}
                                        customRange={calendarDateRangeFilter}
                                        displayedResults={displayedResults}
                                        selectedCounty={selectedCounty}
                                    />                                    
                                    <span className="hidden lg:block">{displayedResults} results</span>
                                </div>
                                {/* <svg className="icon-link block lg:hidden w-[24px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>                          */}
                                <div className="hidden lg:flex flex-row gap-2 items-center">
                                    <div className="flex items-center">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="w-5 h-5 mr-2 cursor-pointer" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="1.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                            onClick={() => isMapView && toggleMapView()}
                                        >
                                            <line x1="8" y1="6" x2="21" y2="6"></line>
                                            <line x1="8" y1="12" x2="21" y2="12"></line>
                                            <line x1="8" y1="18" x2="21" y2="18"></line>
                                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                        </svg>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={isMapView} 
                                                onChange={toggleMapView} 
                                            />
                                            <div className="w-10 h-5 bg-gray-100 border border-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-700 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-100"></div>
                                        </label>
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="w-5 h-5 ml-2 cursor-pointer" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="1.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                            onClick={() => !isMapView && toggleMapView()}
                                        >
                                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                                            <line x1="8" y1="2" x2="8" y2="18"></line>
                                            <line x1="16" y1="6" x2="16" y2="22"></line>
                                        </svg>
                                    </div>
                                </div>
                            </div>                                             
                        </div>
                        {displayedResults === 0 && 
                            <div className="text-center flex-grow flex flex-col justify-center text-2xl py-36">
                                <p className="pb-4">No Results</p>
                                <p className="pb-4">¯\_(ツ)_/¯</p>
                                <p>Try changing your filters.</p>
                            </div>
                        }            

                        {displayedResults > 0 && isMapView && L ? (
                            <div id="map-view" className="w-full">
                                <div className="h-[70vh] border w-full">
                                <MapContainer center={[37.7749, -122.4194]} zoom={9} scrollWheelZoom={true} className="h-[70vh] border w-full z-0">
                                    <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    { 
                                    (() => {
                                        // Filter listings
                                        const filteredItems = filteredListings
                                            .filter(item => highlightsOnly ? item.Highlight : true)                                        
                                            .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
                                            .filter(item => item.locationName.toLowerCase() !== 'various')
                                            .filter(item => {
                                                const searchLower = searchTerm.toLowerCase();
                                                
                                                return item.Event.toLowerCase().includes(searchLower) || 
                                                       item.locationName.toLowerCase().includes(searchLower) || 
                                                       item.locationAddress.toLowerCase().includes(searchLower) ||
                                                       extractPortableTextContent(item.Notes).toLowerCase().includes(searchLower) ||
                                                       item.locationUrl.toLowerCase().includes(searchLower);
                                            });
                                        
                                        // Group listings by location coordinates
                                        const locationGroups = {};
                                        
                                        filteredItems.forEach(item => {
                                            const location = locations.find(loc => loc.Name === item.locationName);
                                            if (location && location.Geolocation) {
                                                const key = `${location.Geolocation.lat},${location.Geolocation.lng}`;
                                                if (!locationGroups[key]) {
                                                    locationGroups[key] = {
                                                        position: [location.Geolocation.lat, location.Geolocation.lng],
                                                        locationName: item.locationName,
                                                        locationAddress: item.locationAddress,
                                                        items: []
                                                    };
                                                }
                                                locationGroups[key].items.push(item);
                                            }
                                        });
                                        
                                        return Object.entries(locationGroups).map(([key, group], groupIndex) => {
                                            // Get current page for this group or set to 0 if not yet defined
                                            const currentPage = popupPages[key] || 0;
                                            const totalItems = group.items.length;
                                            const currentItem = group.items[currentPage];
                                            
                                            const handlePrevious = () => {
                                                setPopupPages({
                                                    ...popupPages,
                                                    [key]: (currentPage - 1 + totalItems) % totalItems
                                                });
                                            };
                                            
                                            const handleNext = () => {
                                                setPopupPages({
                                                    ...popupPages,
                                                    [key]: (currentPage + 1) % totalItems
                                                });
                                            };
                                            
                                            return (
                                                <Marker 
                                                    key={key} 
                                                    position={group.position}
                                                    icon={L.icon({
                                                        iconUrl: totalItems > 1 
                                                            ? "data:image/svg+xml,%3Csvg width='20' height='16' viewBox='0 0 20 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.00001 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8.00001 1.33333C4.31811 1.33333 1.33334 4.3181 1.33334 8C1.33334 11.6819 4.31811 14.6667 8.00001 14.6667Z' fill='%239ACD32' stroke='black' strokeWidth='0.666667' strokeLinecap='round' strokeLinejoin='round'/%3E%3Cpath d='M10 14.6667C13.6819 14.6667 16.6667 11.6819 16.6667 8C16.6667 4.3181 13.6819 1.33333 10 1.33333C6.31811 1.33333 3.33334 4.3181 3.33334 8C3.33334 11.6819 6.31811 14.6667 10 14.6667Z' fill='%239ACD32' stroke='black' strokeWidth='0.666667' strokeLinecap='round' strokeLinejoin='round'/%3E%3Cpath d='M12 14.6667C15.6819 14.6667 18.6667 11.6819 18.6667 8C18.6667 4.3181 15.6819 1.33333 12 1.33333C8.31811 1.33333 5.33334 4.3181 5.33334 8C5.33334 11.6819 8.31811 14.6667 12 14.6667Z' fill='%239ACD32' stroke='black' strokeWidth='0.666667' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E%0A"
                                                            : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='yellowgreen' fill-opacity='1' stroke='currentColor' strokeWidth='1' strokeLinecap='round' strokeLinejoin='round' class='feather feather-circle'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E"
                                                    })}
                                                >
                                                    <Popup>
                                                        <div className="popup-content flex flex-col gap-2">
                                                            {currentItem.EventUrl
                                                                ? <a 
                                                                    href={currentItem.EventUrl}
                                                                    target="_blank"
                                                                    className="text-xl lg:text-xl mb-2 lg:mb-0"
                                                                    >
                                                                    <h2>{currentItem.Event}</h2>
                                                                    </a>
                                                                : <span
                                                                    className="text-2xl lg:text-3xl mb-2 lg:mb-0"
                                                                    >
                                                                    <h2>{currentItem.Event}</h2>
                                                                    </span>
                                                            }  
                                                            <span className="font-semibold">
                                                                {currentItem.DateOverride || `${formatDate(currentItem.StartDate)} - ${formatDate(currentItem.EndDate)}`}
                                                            </span>                                                            
                                                            <a
                                                                className="flex flex-row gap-1 items-center text-black"
                                                                href={currentItem.locationUrl} 
                                                                target="_blank"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-globe w-4" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>                        
                                                                {currentItem.locationName}
                                                            </a>
                                                            
                                                            <a
                                                                className="flex flex-row gap-1 items-center text-black"
                                                                target='_blank'
                                                                href={currentItem.locationUrl}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-4" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                                {currentItem.locationAddress}
                                                            </a>
                                                            <TodaysHoursStatus locationHours={currentItem.locationHours} locationUrl={currentItem.locationUrl} />
                                                            
                                                            {totalItems > 1 && (
                                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                                                    <button 
                                                                        onClick={handlePrevious}
                                                                        className="text-sm px-2 hover:bg-gray-100 flex flex-row gap-1 items-center"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Prev
                                                                    </button>
                                                                    <span className="text-xs text-gray-500">
                                                                        {currentPage + 1} of {totalItems}
                                                                    </span>
                                                                    <button 
                                                                        onClick={handleNext}
                                                                        className="text-sm px-2 hover:bg-gray-100 flex flex-row gap-1 items-center"
                                                                    >
                                                                        Next <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            );
                                        });
                                    })()
                                    }
                                </MapContainer>
                                </div>
                            </div>
                        ) : (
                            <Listing listings={filteredListings} formatDate={formatDate} />                            
                        )}
                    </>
                )}
                
          
                <MobileIconMenu 
                    toggleBottomSheet={() => setShowBottomSheet(true)} 
                    isMapView={isMapView}
                    displayedResults={displayedResults}
                    toggleMapView={toggleMapView}
                    isBottomSheetOpen={showBottomSheet}
                />
                
                {/* Mobile Filter Bottom Sheet */}
                <MobileFilterBottomSheet
                    isOpen={showBottomSheet}
                    onClose={() => setShowBottomSheet(false)}
                    calendarTypeFilter={calendarTypeFilter}
                    setCalendarTypeFilter={setCalendarTypeFilter}
                    calendarDateRangeFilter={calendarDateRangeFilter}
                    setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                    calendarDateRangePreset={calendarDateRangePreset}
                    setCalendarDateRangePreset={setCalendarDateRangePreset}
                    highlightsOnly={highlightsOnly}
                    setHighlightsOnly={setHighlightsOnly}
                    openHoursOnly={openHoursOnly}
                    setOpenHoursOnly={setOpenHoursOnly}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showAdvancedFilters={showAdvancedFilters}
                    setShowAdvancedFilters={setShowAdvancedFilters}
                    showCustomCalendar={showCustomCalendar}
                    setShowCustomCalendar={setShowCustomCalendar}
                    selectedCounty={selectedCounty}
                    setSelectedCounty={setSelectedCounty}
                    displayedResults={displayedResults}
                    setShowMenu={setShowMenu}
                />
            
            </div>
        </div>
    );
    
}

