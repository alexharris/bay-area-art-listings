'use client'

import { useState, useEffect } from 'react';
import getListings from './getListings';
import getLocations from './getLocations';
import 'leaflet/dist/leaflet.css';
import { getFilteredListings } from '../../utils/filters';
import { applySorting } from '../../utils/sort'; 
import { getCalendarTypeCounts } from '../../utils/filterCounts';

import MobileHeader from './MobileHeader';
import MobileSidebarOverlay from './sidebar/mobileSidebarOverlay';
import Listing from './listing';
import MapView from './map/mapView';
import Sidebar from './sidebar/sidebar';

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
    const [selectedCounty, setSelectedCounty] = useState([]);
    //  Sorting
    // Display
    const [calendarDateRangePreset, setCalendarDateRangePreset] = useState('custom');
    const [loading, setLoading] = useState(true);
    const [isMapView, setIsMapView] = useState(false);
    const [displayedResults, setDisplayedResults] = useState(0); // number of results
    const [showMenu, setShowMenu] = useState(false);

    const [showCustomCalendar, setShowCustomCalendar] = useState(false);
    const [sortMethod, setSortMethod] = useState('closingSoon');
    const [calendarTypeCounts, setCalendarTypeCounts] = useState({});
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);


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
                setCalendarDateRangePreset('anytime');
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

        // Calculate calendar type counts for the "What" dropdown
        if (listings && listings.length > 0) {
            const typeCounts = getCalendarTypeCounts(filters, listings);
            setCalendarTypeCounts(typeCounts);
        }
        
    }, [calendarDateRangeFilter, calendarTypeFilter, highlightsOnly, openHoursOnly, searchTerm, listings, selectedLocation, selectedCounty, sortMethod]);

    // Auto-adjust sort method based on calendar type filter
    useEffect(() => {
        if (calendarTypeFilter === 'opening') {
            setSortMethod('openingSoon');
        } else if (calendarTypeFilter === 'onview' && sortMethod === 'openingSoon') {
            // Only switch back to closingSoon if we're currently on openingSoon
            // This prevents overriding user's manual sort selection
            setSortMethod('closingSoon');
        }
    }, [calendarTypeFilter]);

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
        setSelectedCounty([]);
        setSortMethod('closingSoon');
        
        // Reset calendar date range to initial state (10 years from start of month)
        const tenYearsFromNow = new Date(startOfMonth);
        tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
        setCalendarDateRangeFilter({ from: startOfMonth, to: tenYearsFromNow });
        setCalendarDateRangePreset('anytime');
        
        // Close custom calendar if open
        setShowCustomCalendar(false);
    }

    function closeMobileSidebar() {
        setMobileSidebarOpen(false);
    }


    return (
        <>
            {/* Mobile Header */}
            <MobileHeader 
                onSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                sidebarOpen={mobileSidebarOpen}
            />

            {/* Mobile Sidebar Overlay */}
            <MobileSidebarOverlay 
                isOpen={mobileSidebarOpen} 
                onClose={() => setMobileSidebarOpen(false)}
            >
                <Sidebar                    
                    // Display states
                    showLogo={false}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    displayedResults={displayedResults}
                    listings={listings}
                    isMapView={isMapView}
                    setIsMapView={setIsMapView}
                    showCustomCalendar={showCustomCalendar}
                    setShowCustomCalendar={setShowCustomCalendar}
                    
                    // Filter states
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    calendarTypeFilter={calendarTypeFilter}
                    setCalendarTypeFilter={setCalendarTypeFilter}
                    calendarTypeCounts={calendarTypeCounts}
                    calendarDateRangeFilter={calendarDateRangeFilter}
                    setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                    calendarDateRangePreset={calendarDateRangePreset}
                    setCalendarDateRangePreset={setCalendarDateRangePreset}
                    highlightsOnly={highlightsOnly}
                    setHighlightsOnly={setHighlightsOnly}
                    openHoursOnly={openHoursOnly}
                    setOpenHoursOnly={setOpenHoursOnly}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    selectedCounty={selectedCounty}
                    setSelectedCounty={setSelectedCounty}
                    sortMethod={sortMethod}
                    setSortMethod={setSortMethod}
                    
                    // Date ranges for presets
                    startOfWeek={startOfWeek}
                    endOfWeek={endOfWeek}
                    startOfMonth={startOfMonth}
                    endOfMonth={endOfMonth}
                    startOfNextMonth={startOfNextMonth}
                    endOfNextMonth={endOfNextMonth}
                    
                    // Functions
                    updateCalendarDateRangeFilter={updateCalendarDateRangeFilter}
                    clearAllFilters={clearAllFilters}
                    toggleOpenHoursOnly={toggleOpenHoursOnly}
                    closeMobileSidebar={closeMobileSidebar}
                />
            </MobileSidebarOverlay>
          
            <div className={`flex flex-row w-full items-start lg:gap-4 ${isMapView ? 'h-screen' : ''}`}>

                {/* Desktop Sidebar */ }
                <div
                    className="w-[400px] sticky top-0 pt-4 hidden lg:block h-screen"
                >         
                    <Sidebar                    
                        // Display states
                        showMenu={showMenu}
                        setShowMenu={setShowMenu}
                        displayedResults={displayedResults}
                        listings={listings}
                        isMapView={isMapView}
                        setIsMapView={setIsMapView}
                        showCustomCalendar={showCustomCalendar}
                        setShowCustomCalendar={setShowCustomCalendar}
                        
                        // Filter states
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        calendarTypeFilter={calendarTypeFilter}
                        setCalendarTypeFilter={setCalendarTypeFilter}
                        calendarTypeCounts={calendarTypeCounts}
                        calendarDateRangeFilter={calendarDateRangeFilter}
                        setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                        calendarDateRangePreset={calendarDateRangePreset}
                        setCalendarDateRangePreset={setCalendarDateRangePreset}
                        highlightsOnly={highlightsOnly}
                        setHighlightsOnly={setHighlightsOnly}
                        openHoursOnly={openHoursOnly}
                        setOpenHoursOnly={setOpenHoursOnly}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        selectedCounty={selectedCounty}
                        setSelectedCounty={setSelectedCounty}
                        sortMethod={sortMethod}
                        setSortMethod={setSortMethod}
                        
                        // Date ranges for presets
                        startOfWeek={startOfWeek}
                        endOfWeek={endOfWeek}
                        startOfMonth={startOfMonth}
                        endOfMonth={endOfMonth}
                        startOfNextMonth={startOfNextMonth}
                        endOfNextMonth={endOfNextMonth}
                        
                        // Functions
                        updateCalendarDateRangeFilter={updateCalendarDateRangeFilter}
                        clearAllFilters={clearAllFilters}
                        toggleOpenHoursOnly={toggleOpenHoursOnly}
                        closeMobileSidebar={closeMobileSidebar}
                    />
                </div>   

            {/* Main Col */}
            <div id="main-col" className={`flex flex-col justify-start w-full flex-shrink ${isMapView ? 'h-screen' : 'min-h-screen'}`}>
                {loading ? (
                    <div className="animate-pulse text-5xl flex items-center justify-center w-full h-[70vh]">
                        🎨
                    </div>
                ) : (
                    <>  

                        {displayedResults === 0 && 
                            <div className="text-center flex-grow flex flex-col justify-center text-2xl py-36">
                                <p className="pb-4">No Results</p>
                                <p className="pb-4">¯\_(ツ)_/¯</p>
                                <p>Try changing your filters.</p>
                            </div>
                        }            

                        {displayedResults > 0 && isMapView ? (
                            <div className="h-full flex-1">
                                <MapView 
                                    filteredListings={filteredListings}
                                    locations={locations}
                                    highlightsOnly={highlightsOnly}
                                    selectedLocation={selectedLocation}
                                    searchTerm={searchTerm}
                                />
                            </div>
                        ) : displayedResults > 0 ? (
                            <>
                            <div className=" p-3 text-sm bg-gray-100 text-center md:hidden">A directory of visual arts exhibitions in the Bay Area</div>
                            <Listing listings={filteredListings} formatDate={formatDate} />                            
                            </>
                        ) : null}
                    </>
                )}

            
            </div>
        </div>
        </>
    );
    
}

