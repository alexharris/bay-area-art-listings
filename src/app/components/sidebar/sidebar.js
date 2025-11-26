'use client'

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useState } from "react";
import CountySelector from './countySelector';
import FilterPresets from '../filterPresets';
import SortSelector from './sortSelector';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import AboutContent from '../aboutContent';

export default function Sidebar({
    // Display states
    showLogo = true,
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
    toggleOpenHoursOnly,
    closeMobileSidebar
}) {
    const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
    
    return (
        <div 
            id="sidebar" 
            className="flex flex-col px-4 space-y-4 max-h-full overflow-y-auto"
        >
                {/* Logo at the top of the sidebar */}
                {showLogo && (
                    <div className="flex flex-col justify-center items-center w-full mb-4">
                        <Link href="/">
                            <img 
                                src="/art-board-logo.png" 
                                alt="Art Board"     
                                className="h-32 lg:h-48"                       
                            />
                        </Link>
                    </div>
                )}
                <p className="mb-4 hidden md:block">A directory of visual arts exhibitions in the Bay Area.</p>
                <div className="flex flex-row lg:mt-0 items-center justify-between w-full">
                    <label htmlFor="searchTerm" className="pr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>                            
                    </label>
                    <Input 
                        type="text" 
                        id="searchTerm"
                        className="flex-grow"
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder="Search exhibitions..."
                    />
                </div>    
                
                <div className="pb-0 flex flex-row items-center">
                    <label className="pr-2 w-20 text-sm">What</label>
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
                <label className="text-sm">
                    <input 
                        type="checkbox" 
                        className="mr-2"
                        checked={openHoursOnly} 
                        onChange={toggleOpenHoursOnly} 
                    />
                    Only open today
                </label>
                {/* Stats indicator showing total vs. filtered listings */}
                <div className="flex flex-row gap-2 justify-end">
                    <div className="flex flex-row items-center text-sm">
                        {displayedResults} of {listings.length} listings
                    </div>                 
                    <Button 
                        onClick={clearAllFilters}
                        variant="outline"
                        size="sm"
                        className="self-start"
                    >
                        Reset
                    </Button>                
                </div>
                <Button 
                    variant="secondary"
                    className="w-full md:hidden"
                    onClick={closeMobileSidebar}
                >
                    View {displayedResults} Results
                </Button>
                <hr className="my-2 border-dashed" />
                {/* Sort Selector */}
                <div className="flex flex-row items-center">
                  <SortSelector 
                      onSortChange={setSortMethod}
                      currentSort={sortMethod}
                  />
                </div>
                {/* Map/List View Toggle */}
                <div className="flex flex-row items-center">
                  <ToggleGroup 
                    type="single" 
                    value={isMapView ? "map" : "list"}
                    onValueChange={(value) => {
                      if (value) {
                        setIsMapView(value === "map");
                        // Close mobile sidebar when switching views
                        if (closeMobileSidebar && window.innerWidth < 1024) {
                          setTimeout(() => closeMobileSidebar(), 300);
                        }
                      }
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <ToggleGroupItem value="list">
                      List
                    </ToggleGroupItem>
                    <ToggleGroupItem value="map">
                      Map
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>    
                <button 
                    className="mt-8 text-blue-800 underline text-left" 
                    onClick={() => setAboutDialogOpen(true)}
                >
                    About
                </button>
                
                <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
                    <DialogPortal>
                        <DialogOverlay className="z-[60]" />
                        <DialogPrimitive.Content
                            className="fixed left-[50%] top-[50%] z-[60] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[85vh] overflow-y-auto"
                        >
                            <DialogHeader>
                                <DialogTitle className="sr-only">About</DialogTitle>
                            </DialogHeader>
                            <AboutContent />
                            <DialogPrimitive.Close className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M18 6 6 18"/>
                                    <path d="m6 6 12 12"/>
                                </svg>
                                <span className="sr-only">Close</span>
                            </DialogPrimitive.Close>
                        </DialogPrimitive.Content>
                    </DialogPortal>
                </Dialog>
        </div>
    );
}