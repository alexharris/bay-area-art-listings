'use client'

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import CountySelector from './countySelector';
import FilterPresets from './filterPresets';
import SortSelector from './sortSelector';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Sidebar({
    // Display states
    showMenu,
    setShowMenu,
    displayedResults,
    listings,
    isMapView,
    setIsMapView,
    showCustomCalendar,
    setShowCustomCalendar,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    calendarTypeFilter,
    setCalendarTypeFilter,
    calendarTypeCounts,
    calendarDateRangeFilter,
    setCalendarDateRangeFilter,
    calendarDateRangePreset,
    setCalendarDateRangePreset,
    highlightsOnly,
    setHighlightsOnly,
    openHoursOnly,
    setOpenHoursOnly,
    selectedLocation,
    setSelectedLocation,
    selectedCounty,
    setSelectedCounty,
    sortMethod,
    setSortMethod,
    
    // Date ranges for presets
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfNextMonth,
    endOfNextMonth,
    
    // Functions
    updateCalendarDateRangeFilter,
    clearAllFilters,
    toggleOpenHoursOnly
}) {
    return (
        <div id="sidebar" className={`${showMenu ? 'inset-0': ''} flex flex-col lg:gap-4 fixed lg:sticky lg:top-4 w-full z-40 lg:w-[400px] ${isMapView ? 'lg:h-full' : ''}`}>
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
            lg:mr-4
            lg:inset-unset
            gap-2
            bg-white
            border-b
            border-gray-200
            border-dashed
            `}>
              hello
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
                {/* Stats indicator showing total vs. filtered listings */}
                <div className="flex flex-row items-center mt-10 text-md">
                    Viewing {displayedResults} of {listings.length} listings
                </div>
                <div className="flex flex-row py-8 lg:mt-0 items-center justify-between w-full">
                    <label htmlFor="searchTerm" className="pr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>                            
                    </label>
                    <input 
                        type="text" 
                        id="searchTerm"
                        className="border border-gray-300 rounded py-1 mr-1 flex-grow"
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>    
                
                <div className="pb-0 flex flex-row items-center">
                    <label className="pr-2 w-20">What</label>
                    <Select value={calendarTypeFilter} onValueChange={setCalendarTypeFilter}>
                        <SelectTrigger className="flex-grow">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="onview">
                                All exhibitions {calendarTypeFilter !== 'onview' && calendarTypeCounts['onview'] !== undefined ? `(${calendarTypeCounts['onview']})` : ''}
                            </SelectItem>
                            <SelectItem value="opening">
                                Upcoming exhibitions {calendarTypeFilter !== 'opening' && calendarTypeCounts['opening'] !== undefined ? `(${calendarTypeCounts['opening']})` : ''}
                            </SelectItem>
                            {/* <SelectItem value="closing">
                                Closing exhibitions {calendarTypeFilter !== 'closing' && calendarTypeCounts['closing'] !== undefined ? `(${calendarTypeCounts['closing']})` : ''}
                            </SelectItem> */}
                        </SelectContent>
                    </Select>
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
                            currentFilters={{
                                highlightsOnly: highlightsOnly,
                                openHoursOnly: openHoursOnly,
                                searchTerm: searchTerm,
                                selectedLocation: selectedLocation,
                                selectedCounty: selectedCounty,
                                calendarTypeFilter: calendarTypeFilter,
                                calendarDateRangeFilter: calendarDateRangeFilter,
                            }}
                            listings={listings}
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
                        currentFilters={{
                            highlightsOnly: highlightsOnly,
                            openHoursOnly: openHoursOnly,
                            searchTerm: searchTerm,
                            selectedLocation: selectedLocation,
                            selectedCounty: selectedCounty,
                            calendarTypeFilter: calendarTypeFilter,
                            calendarDateRangeFilter: calendarDateRangeFilter,
                        }}
                        listings={listings}
                    />                                       
                </div>   
                <hr className="my-2 border-gray-200"/>
                <label className="">
                    <input 
                        type="checkbox" 
                        className="mr-2"
                        checked={openHoursOnly} 
                        onChange={toggleOpenHoursOnly} 
                    />
                    Only open today
                </label>
                {/* Sort Selector */}
                <div className="flex flex-row items-center">
                    <SortSelector 
                        onSortChange={setSortMethod}
                        currentSort={sortMethod}
                    />
                </div>
                {/* Map/List View Toggle */}
                <div className="flex flex-row items-center">
                    <div className="flex border border-gray-300 rounded">
                        <button
                            onClick={() => setIsMapView(false)}
                            className={`px-3 py-1 text-sm ${
                                !isMapView 
                                    ? 'bg-gray-700 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            } rounded-l transition-colors`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setIsMapView(true)}
                            className={`px-3 py-1 text-sm ${
                                isMapView 
                                    ? 'bg-gray-700 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            } rounded-r transition-colors`}
                        >
                            Map
                        </button>
                    </div>
                </div>     
                <Button 
                    onClick={clearAllFilters}
                    variant="secondary"
                    className="self-start mb-4 mt-4"
                >
                    Clear All
                </Button>
                
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
    );
}