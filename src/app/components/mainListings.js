'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import getListings from './getListings';
import getLocations from './getLocations';
import { useListings, useLocations } from '../../hooks/useListings';
import 'leaflet/dist/leaflet.css';
import { getFilteredListings } from '../../utils/filters';
import { applySorting } from '../../utils/sort';
import { getCalendarTypeCounts } from '../../utils/filterCounts';
import { formatDate, generateSlug } from '../../utils/shared';

import { X } from 'lucide-react';
import { FavoritesProvider, useFavorites } from '@/context/FavoritesContext';
import MobileHeader from './MobileHeader';
import MobileBottomBar from './MobileBottomBar';
import FilterChipRow from './FilterChipRow';
import Listing from './listing';
import MapView from './map/mapView';
import Sidebar from './sidebar/sidebar';
import LoadingSkeleton from './LoadingSkeleton';
import ContentToolbar from './ContentToolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const sortLabels = {
    closingSoon: 'End Date',
    openingSoon: 'Start Date',
    alphabetical: 'Alphabetical',
    recentlyAdded: 'Recently Added',
};

function DisplayListingsInner({ newsletterSettings, sharedSlug }) {
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

    const [sharedSlugNotFound, setSharedSlugNotFound] = useState(false);
    const [favoritesNoteDismissed, setFavoritesNoteDismissed] = useState(false);

    useEffect(() => {
        setFavoritesNoteDismissed(!!localStorage.getItem('favoritesNoteDismissed'));
    }, []);

    // Scroll to shared listing after data loads
    useEffect(() => {
        if (sharedSlug && listings && listings.length > 0) {
            const found = listings.some(item => generateSlug(item.Event) === sharedSlug);
            if (!found) {
                setSharedSlugNotFound(true);
            } else {
                setTimeout(() => {
                    document.getElementById(sharedSlug)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, [sharedSlug, listings]);

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
    const [openingTitleOnly, setOpeningTitleOnly] = useState(false);
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const { items: favoriteIds } = useFavorites();
    const favoriteCount = useMemo(
        () => (listings ? listings.filter(l => favoriteIds.includes(l._id)).length : 0),
        [listings, favoriteIds]
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCounty, setSelectedCounty] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyRadius, setNearbyRadius] = useState(10);
    const [locationError, setLocationError] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
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

    // Mobile UI state
    const [mobileSortOpen, setMobileSortOpen] = useState(false);
    const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

    // Use ref to track if initial setup is complete
    const isInitialized = useRef(false);

    // Memoize currentFilters to prevent unnecessary re-renders in child components
    // Use stringified date values for proper comparison
    const currentFilters = useMemo(() => ({
        highlightsOnly,
        onViewToday,
        endingSoonOnly,
        openingTodayOnly,
        openingTitleOnly,
        favoritesOnly,
        favoriteIds,
        searchTerm,
        selectedLocation,
        selectedCounty,
        calendarTypeFilter,
        calendarDateRangeFilter,
        userLocation,
        nearbyRadius,
    }), [
        highlightsOnly,
        onViewToday,
        endingSoonOnly,
        openingTodayOnly,
        openingTitleOnly,
        favoritesOnly,
        JSON.stringify(favoriteIds),
        searchTerm,
        selectedLocation,
        JSON.stringify(selectedCounty),
        calendarTypeFilter,
        calendarDateRangeFilter?.from?.getTime(),
        calendarDateRangeFilter?.to?.getTime(),
        userLocation?.lat,
        userLocation?.lng,
        nearbyRadius,
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
                openingTodayOnly: getFilteredListings({ ...currentFilters, openingTodayOnly: true }, listings).length,
                openingTitleOnly: getFilteredListings({ ...currentFilters, openingTitleOnly: true }, listings).length,
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

    // Scroll to top when entering map view so sticky sidebar aligns correctly
    useEffect(() => {
        if (isMapView) {
            window.scrollTo(0, 0);
        }
    }, [isMapView]);

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

    const getUserLocation = useCallback(() => {
        setLocationLoading(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setSelectedCounty([]);
                setLocationLoading(false);
            },
            (err) => {
                const msg =
                    err.code === 1 ? 'Permission denied' :
                    err.code === 2 ? 'Position unavailable' :
                    err.code === 3 ? 'Request timed out' :
                    'Location unavailable';
                setLocationError(msg);
                setLocationLoading(false);
            }
        );
    }, []);

    const clearUserLocation = useCallback(() => {
        setUserLocation(null);
        setLocationError(null);
    }, []);

    // Wraps setSelectedCounty to clear Near Me when a county is chosen
    const handleSetSelectedCounty = useCallback((county) => {
        setSelectedCounty(county);
        if (county && county.length > 0) {
            setUserLocation(null);
            setLocationError(null);
        }
    }, []);

    const clearAllFilters = useCallback(() => {
        // Reset all filters to their initial values
        setCalendarTypeFilter('onview');
        setHighlightsOnly(false);
        setOnViewToday(false);
        setEndingSoonOnly(false);
        setOpeningTodayOnly(false);
        setOpeningTitleOnly(false);
        setFavoritesOnly(false);
        setSearchTerm('');
        setSelectedLocation('');
        setSelectedCounty([]);
        setUserLocation(null);
        setLocationError(null);
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
            <Dialog open={sharedSlugNotFound} onOpenChange={setSharedSlugNotFound}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Show not found</DialogTitle>
                        <DialogDescription>
                            The exhibition you&rsquo;re looking for couldn&rsquo;t be found. It may have ended or been removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <button className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">
                                Browse listings
                            </button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Mobile Header */}
            <MobileHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            {/* Mobile Filter Chip Row */}
            <FilterChipRow
                calendarTypeFilter={calendarTypeFilter}
                setCalendarTypeFilter={setCalendarTypeFilter}
                calendarTypeCounts={calendarTypeCounts}
                calendarDateRangePreset={calendarDateRangePreset}
                setCalendarDateRangePreset={setCalendarDateRangePreset}
                calendarDateRangeFilter={calendarDateRangeFilter}
                setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                showCustomCalendar={showCustomCalendar}
                setShowCustomCalendar={setShowCustomCalendar}
                selectedCounty={selectedCounty}
                setSelectedCounty={handleSetSelectedCounty}
                onViewToday={onViewToday}
                setOnViewToday={setOnViewToday}
                endingSoonOnly={endingSoonOnly}
                setEndingSoonOnly={setEndingSoonOnly}
                openingTodayOnly={openingTodayOnly}
                setOpeningTodayOnly={setOpeningTodayOnly}
                specialFilterCounts={specialFilterCounts}
                currentFilters={currentFilters}
                listings={listings}
                startOfWeek={startOfWeek}
                endOfWeek={endOfWeek}
                startOfMonth={startOfMonth}
                endOfMonth={endOfMonth}
                startOfNextMonth={startOfNextMonth}
                endOfNextMonth={endOfNextMonth}
                updateCalendarDateRangeFilter={updateCalendarDateRangeFilter}
                openingTitleOnly={openingTitleOnly}
                setOpeningTitleOnly={setOpeningTitleOnly}
                favoritesOnly={favoritesOnly}
                setFavoritesOnly={setFavoritesOnly}
                favoriteCount={favoriteCount}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                userLocation={userLocation}
                nearbyRadius={nearbyRadius}
                setNearbyRadius={setNearbyRadius}
                locationError={locationError}
                locationLoading={locationLoading}
                getUserLocation={getUserLocation}
                clearUserLocation={clearUserLocation}
            />

            {/* Mobile Bottom Bar */}
            <MobileBottomBar
                isMapView={isMapView}
                setIsMapView={setIsMapView}
                mobileAboutOpen={mobileAboutOpen}
                setMobileAboutOpen={setMobileAboutOpen}
                newsletterSettings={newsletterSettings}
                mobileSortOpen={mobileSortOpen}
                setMobileSortOpen={setMobileSortOpen}
                sortMethod={sortMethod}
                setSortMethod={setSortMethod}
            />

            <div className={`flex flex-row w-full items-start pt-24 lg:pt-0 ${isMapView ? 'h-screen' : ''}`}>

                {/* Desktop Sidebar */ }
                <div
                    className="w-[400px] sticky top-0 pt-4 hidden lg:block h-screen border-r border-gray-200"
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
                        calendarDateRangeFilter={calendarDateRangeFilter}
                        setCalendarDateRangeFilter={setCalendarDateRangeFilter}
                        calendarDateRangePreset={calendarDateRangePreset}
                        setCalendarDateRangePreset={setCalendarDateRangePreset}
                        specialFilterCounts={specialFilterCounts}
                        onViewToday={onViewToday}
                        setOnViewToday={setOnViewToday}
                        openingTodayOnly={openingTodayOnly}
                        setOpeningTodayOnly={setOpeningTodayOnly}
                        endingSoonOnly={endingSoonOnly}
                        setEndingSoonOnly={setEndingSoonOnly}
                        openingTitleOnly={openingTitleOnly}
                        setOpeningTitleOnly={setOpeningTitleOnly}
                        favoritesOnly={favoritesOnly}
                        setFavoritesOnly={setFavoritesOnly}
                        favoriteCount={favoriteCount}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        selectedCounty={selectedCounty}
                        setSelectedCounty={handleSetSelectedCounty}
                        userLocation={userLocation}
                        nearbyRadius={nearbyRadius}
                        setNearbyRadius={setNearbyRadius}
                        locationError={locationError}
                        locationLoading={locationLoading}
                        getUserLocation={getUserLocation}
                        clearUserLocation={clearUserLocation}

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

                {/* Mobile inline sort */}
                {!isMapView && (
                    <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="font-medium text-gray-700">{displayedResults} exhibition{displayedResults !== 1 ? 's' : ''}</span>
                            {(calendarTypeFilter !== 'onview' || calendarDateRangePreset !== 'anytime' || selectedCounty.length > 0 || onViewToday || endingSoonOnly || openingTodayOnly || openingTitleOnly || searchTerm) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Clear all filters"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setMobileSortOpen(true)}
                            className="flex items-center gap-1 text-sm text-gray-500"
                        >
                            <span>{sortLabels[sortMethod] || sortMethod}</span>
                            <span className="text-xs opacity-50">▾</span>
                        </button>
                    </div>
                )}

                {loading ? (
                    <LoadingSkeleton count={5} />
                ) : (
                    <>

                        {favoritesOnly && !isMapView && !favoritesNoteDismissed && (
                            <div className="mx-3 mt-3 bg-gray-50 rounded p-3 flex gap-2 text-sm text-gray-600">
                                <span className="text-base leading-snug flex-shrink-0">⭐</span>
                                <div>
                                    The exhibitions are saved locally in your browser. Clearing your browser&rsquo;s Local Storage will clear your saved items, for better or worse.
                                    <br />
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('favoritesNoteDismissed', 'true');
                                            setFavoritesNoteDismissed(true);
                                        }}
                                        className="underline mt-1 inline-block"
                                    >
                                        ok whatever
                                    </button>
                                </div>
                            </div>
                        )}

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
                                    selectedCounty={selectedCounty}
                                    searchTerm={searchTerm}
                                    userLocation={userLocation}
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
                                highlightSlug={sharedSlug}
                            />
                        ) : null}
                    </>
                )}


            </div>
        </div>
        </>
    );

}

export default function DisplayListings({ newsletterSettings, sharedSlug }) {
    return (
        <FavoritesProvider>
            <DisplayListingsInner newsletterSettings={newsletterSettings} sharedSlug={sharedSlug} />
        </FavoritesProvider>
    );
}
