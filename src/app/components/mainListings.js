'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import getListings from './getListings';
import getLocations from './getLocations';
import { useListings, useLocations } from '../../hooks/useListings';
import 'leaflet/dist/leaflet.css';
import { getFilteredListings } from '../../utils/filters';
import { applySorting } from '../../utils/sort';
import { getCalendarTypeCounts } from '../../utils/filterCounts';
import { formatDate } from '../../utils/shared';

import MobileHeader from './MobileHeader';
import MobileBottomBar from './MobileBottomBar';
import Listing from './listing';
import MapView from './map/mapView';
import Sidebar from './sidebar/sidebar';
import LoadingSkeleton from './LoadingSkeleton';
import ContentToolbar from './ContentToolbar';

export default function DisplayListings({ newsletterSettings }) {
    // Get today's date in US West Coast (Pacific Time) - memoized to prevent recreation
    const today = useMemo(() => {
        return new Date(
            new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
        );
    }, []);

    // Calculate dates once - memoized to prevent infinite loops
    const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth } = useMemo(() => {
        // Calculate start and end of week
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);

        // Calculate start and end of month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Calculate start and end of next month
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        
        return { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth };
    }, [today]);


    // Fetch data with SWR caching (instant on repeat visits)
    const { listings, isLoading: listingsLoading } = useListings();
    const { locations, isLoading: locationsLoading } = useLocations();
    const loading = listingsLoading || locationsLoading;

    // Filtering
    const [calendarTypeFilter, setCalendarTypeFilter] = useState('onview'); // onview, opening, closing
    const [calendarDateRangeFilterInternal, setCalendarDateRangeFilterInternal] = useState(null); // actual date range to filter on
    
    // Wrap the setter to prevent updates if dates haven't actually changed
    const setCalendarDateRangeFilter = useCallback((newRange) => {
        setCalendarDateRangeFilterInternal(prev => {
            // If both are null/undefined, no update needed
            if (!prev && !newRange) return prev;
            // If one is null and the other isn't, update
            if (!prev || !newRange) return newRange;
            // Compare timestamps to see if dates actually changed
            const fromSame = prev.from?.getTime() === newRange.from?.getTime();
            const toSame = prev.to?.getTime() === newRange.to?.getTime();
            // Only update if dates are different
            return (fromSame && toSame) ? prev : newRange;
        });
    }, []);
    
    const calendarDateRangeFilter = calendarDateRangeFilterInternal;
    
    const [filteredListings, setFilteredListings] = useState([]);
    const [highlightsOnly, setHighlightsOnly] = useState(false);
    const [onViewToday, setOnViewToday] = useState(false);
    const [endingSoonOnly, setEndingSoonOnly] = useState(false);
    const [openingTodayOnly, setOpeningTodayOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCounty, setSelectedCounty] = useState([]);
    //  Sorting
    // Display
    const [calendarDateRangePreset, setCalendarDateRangePreset] = useState('custom');
    const [isMapView, setIsMapView] = useState(false);
    const [displayedResults, setDisplayedResults] = useState(0); // number of results
    const [showMenu, setShowMenu] = useState(false);

    const [showCustomCalendar, setShowCustomCalendar] = useState(false);
    const [sortMethod, setSortMethod] = useState('closingSoon');
    const [calendarTypeCounts, setCalendarTypeCounts] = useState({});
    const [specialFilterCounts, setSpecialFilterCounts] = useState({
        onViewToday: 0,
        endingSoonOnly: 0,
        openingTodayOnly: 0
    });

    // Use ref to track if initial setup is complete
    const isInitialized = useRef(false);

    // Memoize currentFilters to prevent unnecessary re-renders in child components
    // Use stringified date values for proper comparison
    const currentFilters = useMemo(() => ({
        highlightsOnly,
        onViewToday,
        endingSoonOnly,
        openingTodayOnly,
        searchTerm,
        selectedLocation,
        selectedCounty,
        calendarTypeFilter,
        calendarDateRangeFilter,
    }), [
        highlightsOnly, 
        onViewToday, 
        endingSoonOnly, 
        openingTodayOnly, 
        searchTerm, 
        selectedLocation, 
        JSON.stringify(selectedCounty), 
        calendarTypeFilter, 
        calendarDateRangeFilter?.from?.getTime(), 
        calendarDateRangeFilter?.to?.getTime()
    ]);

    // Set initial calendar filter defaults
    useEffect(() => {
        if (!isInitialized.current) {
            const tenYearsFromNow = new Date(startOfMonth);
            tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
            setCalendarDateRangeFilter({ from: startOfMonth, to: tenYearsFromNow });
            setCalendarDateRangePreset('anytime');
            isInitialized.current = true;
        }
    }, [startOfMonth, setCalendarDateRangeFilter]);  

    // Update filtered listings when filters change
    useEffect(() => {
        // Don't run until initialized
        if (!calendarDateRangeFilter) return;
        
        const filteredListings = getFilteredListings(currentFilters, listings);
        const sortedListings = applySorting(filteredListings, sortMethod);
        
        setFilteredListings(sortedListings);
        setDisplayedResults(filteredListings.length);

        // Calculate calendar type counts for the "What" dropdown
        if (listings && listings.length > 0) {
            const typeCounts = getCalendarTypeCounts(currentFilters, listings);
            
            // Only update if counts actually changed
            setCalendarTypeCounts(prev => {
                if (JSON.stringify(prev) === JSON.stringify(typeCounts)) return prev;
                return typeCounts;
            });
            
            // Calculate special filter counts - showing how many items match each filter
            const newSpecialCounts = {
                onViewToday: getFilteredListings({ ...currentFilters, onViewToday: true }, listings).length,
                endingSoonOnly: getFilteredListings({ ...currentFilters, endingSoonOnly: true }, listings).length,
                openingTodayOnly: getFilteredListings({ ...currentFilters, openingTodayOnly: true }, listings).length
            };
            
            // Only update if counts actually changed
            setSpecialFilterCounts(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newSpecialCounts)) return prev;
                return newSpecialCounts;
            });
        }
        
    }, [currentFilters, listings, sortMethod, calendarDateRangeFilter]);

    // Auto-adjust sort method based on calendar type filter
    useEffect(() => {
        if (calendarTypeFilter === 'opening' || calendarTypeFilter === 'hasOpenings') {
            setSortMethod(prev => prev === 'openingSoon' ? prev : 'openingSoon');
        } else if (calendarTypeFilter === 'onview') {
            setSortMethod(prev => prev === 'openingSoon' ? 'closingSoon' : prev);
        }
    }, [calendarTypeFilter]);

    // Toggle map view
    const toggleMapView = useCallback(() => {
        setIsMapView(prev => !prev);
    }, []);

    const updateCalendarDateRangeFilter = useCallback((dateRange) => {
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
    }, [setCalendarDateRangeFilter]);

    const clearAllFilters = useCallback(() => {
        // Reset all filters to their initial values
        setCalendarTypeFilter('onview');
        setHighlightsOnly(false);
        setOnViewToday(false);
        setEndingSoonOnly(false);
        setOpeningTodayOnly(false);
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
    }, [startOfMonth, setCalendarDateRangeFilter]);


    return (
        <>
            {/* Mobile Header */}
            <MobileHeader
                isMapView={isMapView}
                setIsMapView={setIsMapView}
            />

            {/* Mobile Bottom Bar */}
            <MobileBottomBar
                calendarTypeFilter={calendarTypeFilter}
                setCalendarTypeFilter={setCalendarTypeFilter}
                calendarTypeCounts={calendarTypeCounts}
                specialFilterCounts={specialFilterCounts}
                calendarDateRangeFilter={calendarDateRangeFilter}
                setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                calendarDateRangePreset={calendarDateRangePreset}
                setCalendarDateRangePreset={setCalendarDateRangePreset}
                onViewToday={onViewToday}
                setOnViewToday={setOnViewToday}
                endingSoonOnly={endingSoonOnly}
                setEndingSoonOnly={setEndingSoonOnly}
                openingTodayOnly={openingTodayOnly}
                setOpeningTodayOnly={setOpeningTodayOnly}
                selectedCounty={selectedCounty}
                setSelectedCounty={setSelectedCounty}
                showCustomCalendar={showCustomCalendar}
                setShowCustomCalendar={setShowCustomCalendar}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortMethod={sortMethod}
                setSortMethod={setSortMethod}
                displayedResults={displayedResults}
                listings={listings}
                currentFilters={currentFilters}
                startOfWeek={startOfWeek}
                endOfWeek={endOfWeek}
                startOfMonth={startOfMonth}
                endOfMonth={endOfMonth}
                startOfNextMonth={startOfNextMonth}
                endOfNextMonth={endOfNextMonth}
                updateCalendarDateRangeFilter={updateCalendarDateRangeFilter}
                clearAllFilters={clearAllFilters}
            />
          
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
                        showCustomCalendar={showCustomCalendar}
                        setShowCustomCalendar={setShowCustomCalendar}
                        newsletterSettings={newsletterSettings}
                        currentFilters={currentFilters}

                        // Filter states
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        calendarTypeFilter={calendarTypeFilter}
                        setCalendarTypeFilter={setCalendarTypeFilter}
                        calendarTypeCounts={calendarTypeCounts}
                        specialFilterCounts={specialFilterCounts}
                        calendarDateRangeFilter={calendarDateRangeFilter}
                        setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                        calendarDateRangePreset={calendarDateRangePreset}
                        setCalendarDateRangePreset={setCalendarDateRangePreset}
                        highlightsOnly={highlightsOnly}
                        setHighlightsOnly={setHighlightsOnly}
                        onViewToday={onViewToday}
                        setOnViewToday={setOnViewToday}
                        endingSoonOnly={endingSoonOnly}
                        setEndingSoonOnly={setEndingSoonOnly}
                        openingTodayOnly={openingTodayOnly}
                        setOpeningTodayOnly={setOpeningTodayOnly}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        selectedCounty={selectedCounty}
                        setSelectedCounty={setSelectedCounty}

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
                    />
                </div>   

            {/* Main Col */}
            <div id="main-col" className={`flex flex-col justify-start w-full flex-shrink pb-16 lg:pb-0 ${isMapView ? 'h-screen' : 'min-h-screen'}`}>
                <ContentToolbar
                    sortMethod={sortMethod}
                    setSortMethod={setSortMethod}
                    isMapView={isMapView}
                    setIsMapView={setIsMapView}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
                {loading ? (
                    <LoadingSkeleton count={5} />
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
                            <Listing
                                listings={filteredListings}
                                formatDate={formatDate}
                                onViewToday={onViewToday}
                                setOnViewToday={setOnViewToday}
                                endingSoonOnly={endingSoonOnly}
                                setEndingSoonOnly={setEndingSoonOnly}
                                openingTodayOnly={openingTodayOnly}
                                setOpeningTodayOnly={setOpeningTodayOnly}
                            />
                        ) : null}
                    </>
                )}

            
            </div>
        </div>
        </>
    );
    
}

