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
import AddEmailForm from './old/addEmailForm';
import { getFilteredListings } from '../../utils/filters';
import { sortListingsChronologically, applySorting } from '../../utils/sort'; 
import { extractPortableTextContent } from '../../utils/helpers';
import MobileIconMenu from './mobileIconMenu';
import MobileFilterBottomSheet from './mobileFilterBottomSheet';
import Link from "next/link";
import Listing from './listing';
import FilterPresets from './filterPresets';
import TodaysHoursStatus from './TodaysHoursStatus';
import SortSelector from './sortSelector';
import MapView from './MapView';

// Feature flags
const sidebarCalendarIsEnabled = true; // Set to false to disable calendar features

// Don't show year if its the current year
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
    // Get today's date in US West Coast (Pacific Time)
    const today = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    // Always use a fresh copy of today's date for calculations to avoid mutation issues

    // Calculate start and end of week using a new Date instance
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);

    // Calculate start and end of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Calculate start and end of next month
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
    //  Sorting
    const [sortDate, setSortDate] = useState([]);
    // Display
    const [calendarDateRangePreset, setCalendarDateRangePreset] = useState('custom');
    const [showDetails, setShowDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [isMapView, setIsMapView] = useState(false);
    const [displayedResults, setDisplayedResults] = useState(0); // number of results
    const [showMenu, setShowMenu] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showCustomCalendar, setShowCustomCalendar] = useState(false);
    const [sortMethod, setSortMethod] = useState('openingSoon');


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
                
                // Only set calendar filters if the feature flag is enabled
                // if (sidebarCalendarIsEnabled) {
                // Set calendar date range to cover the next ten years
                const tenYearsFromNow = new Date(startOfMonth);
                tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
                setCalendarDateRangeFilter({ from: startOfMonth, to: tenYearsFromNow });
                setCalendarDateRangePreset('everything');
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

        const filteredListings = getFilteredListings(filters, listings);
        const sortedListings = applySorting(filteredListings, sortMethod);
        
        setFilteredListings(sortedListings);
        setDisplayedResults(filteredListings.length);
        
    }, [calendarDateRangeFilter, calendarTypeFilter, highlightsOnly, openHoursOnly, searchTerm, listings, selectedLocation, selectedCounty, sortMethod]);

    function toggleOpenHoursOnly() {
        setOpenHoursOnly(!openHoursOnly);
    }

    // Toggle map view
    function toggleMapView() {
        const newMapView = !isMapView;
        setIsMapView(newMapView);
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

    function clearAllFilters() {
        // Reset all filters to their initial values
        setCalendarTypeFilter('onview');
        setHighlightsOnly(false);
        setOpenHoursOnly(false);
        setSearchTerm('');
        setSelectedLocation('');
        setSelectedCounty({});
        setSortMethod('openingSoon');
        
        // Reset calendar date range to initial state (10 years from start of month)
        const tenYearsFromNow = new Date(startOfMonth);
        tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
        setCalendarDateRangeFilter({ from: startOfMonth, to: tenYearsFromNow });
        setCalendarDateRangePreset('everything');
        
        // Close custom calendar if open
        setShowCustomCalendar(false);
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
                    <div className="flex flex-row py-8 lg:mt-0 items-center">
                        <label htmlFor="searchTerm" className="w-24 pr-2">
                            Search
                        </label>
                        <input 
                            type="text" 
                            id="searchTerm"
                            className="border border-gray-300 rounded px-2 py-1"
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>    
                    <div className="pb-0 flex flex-row items-center">
                        <label htmlFor="calendarTypeDropdown" className="pr-2 w-24">What</label>
                        <select
                            id="calendarTypeDropdown"
                            value={calendarTypeFilter}
                            onChange={e => setCalendarTypeFilter(e.target.value)}
                            className="border border-gray-300 bg-white rounded px-2 py-1 flex-grow"                           
                        >
                            <option value="onview">All exhibitions</option>
                            <option value="opening">Upcoming exhibitions</option>
                            {/* <option value="closing">Closing exhibitions</option> */}
                            
                        </select>
                    </div>
                    <div className="flex flex-col w-full">
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
                        <div>
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
                        Only show venues open today
                    </label>
                    
                    <button 
                        onClick={clearAllFilters}
                        className="self-start border-b border-black mb-4"
                    >
                        Clear All
                    </button>
                    
                                
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

            </div>

            {/* Main Col */}
            <div id="main-col" className="flex flex-col justify-start w-full flex-shrink">
                {loading ? (
                    <div className="animate-pulse text-5xl flex items-center justify-center w-full h-[70vh]">
                        🎨
                    </div>
                ) : (
                    <>  
                        {/* Top bar */}
                        <div className="flex flex-col justify-between align-bottom items-center  sticky top-0 z-30 bg-white">                    
                            <div className="flex flex-row items-center justify-between w-full border-b border-dashed border-black py-2">
                                <div className="flex flex-row gap-1 lg:items-start">
                                    <DisplayFilters                                 
                                        type={calendarTypeFilter}
                                        presetRange={calendarDateRangePreset}
                                        customRange={calendarDateRangeFilter}
                                        displayedResults={displayedResults}
                                        selectedCounty={selectedCounty}
                                    />                                    
                                    <span className="hidden lg:block text-xs">({displayedResults})</span>
                                </div>
                                <SortSelector 
                                    onSortChange={setSortMethod}
                                    currentSort={sortMethod}
                                />
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

                        {displayedResults > 0 && isMapView ? (
                            <MapView 
                                filteredListings={filteredListings}
                                locations={locations}
                                highlightsOnly={highlightsOnly}
                                selectedLocation={selectedLocation}
                                searchTerm={searchTerm}
                            />
                        ) : displayedResults > 0 ? (
                            <Listing listings={filteredListings} formatDate={formatDate} />                            
                        ) : null}
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

