'use client'

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useState } from "react";
import CountySelector from './countySelector';
import CalendarTypeSelector from './CalendarTypeSelector';
import FilterBadges from './FilterBadges';
import FilterPresets from '../filterPresets';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import AboutContent from '../aboutContent';

export default function Sidebar({
    // Display states
    showLogo = true,
    showMenu,
    setShowMenu,
    displayedResults,
    listings,
    showCustomCalendar,
    setShowCustomCalendar,
    newsletterSettings,
    currentFilters,

    // Filter states
    calendarTypeFilter,
    setCalendarTypeFilter,
    calendarTypeCounts,
    specialFilterCounts = { onViewToday: 0, endingSoonOnly: 0, openingTodayOnly: 0 },
    calendarDateRangeFilter,
    setCalendarDateRangeFilter,
    calendarDateRangePreset,
    setCalendarDateRangePreset,
    highlightsOnly,
    setHighlightsOnly,
    onViewToday,
    setOnViewToday,
    endingSoonOnly,
    setEndingSoonOnly,
    openingTodayOnly,
    setOpeningTodayOnly,
    selectedLocation,
    setSelectedLocation,
    selectedCounty,
    setSelectedCounty,

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
}) {
    const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
    const [newsletterDialogOpen, setNewsletterDialogOpen] = useState(false);
    
    return (
        <div 
            id="sidebar" 
            className="flex flex-col max-h-full"
        >
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
                {/* Logo at the top of the sidebar */}
                {showLogo && (
                    <div className="flex flex-col justify-center items-center w-full mb-4">
                        <Link href="/">
                            <img 
                                src="/art-board-logo.png" 
                                alt="Art Board"     
                                className="h-32 lg:h-40"                       
                            />
                        </Link>
                    </div>
                )}
                <p className="mb-4 hidden md:block">A directory of visual arts exhibitions in the Bay Area.</p>
                <CalendarTypeSelector
                    calendarTypeFilter={calendarTypeFilter}
                    setCalendarTypeFilter={setCalendarTypeFilter}
                    calendarTypeCounts={calendarTypeCounts}
                />
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
                            currentFilters={currentFilters}
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
                        currentFilters={currentFilters}
                        listings={listings}
                    />
                </div>
                <FilterBadges
                    onViewToday={onViewToday}
                    setOnViewToday={setOnViewToday}
                    endingSoonOnly={endingSoonOnly}
                    setEndingSoonOnly={setEndingSoonOnly}
                    openingTodayOnly={openingTodayOnly}
                    setOpeningTodayOnly={setOpeningTodayOnly}
                    specialFilterCounts={specialFilterCounts}
                />
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
            </div>

            {/* Fixed bottom section with About and Newsletter */}
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <div className="flex flex-row gap-4">
                    <button 
                        className="underline text-left" 
                        onClick={() => setAboutDialogOpen(true)}
                    >
                        About
                    </button>
                    <button 
                        className="underline text-left" 
                        onClick={() => setNewsletterDialogOpen(true)}
                    >
                        Newsletter
                    </button>
                </div>
            </div>
            
            {/* Dialogs */}
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                                    <path d="M18 6 6 18"/>
                                    <path d="m6 6 12 12"/>
                                </svg>
                                <span className="sr-only">Close</span>
                            </DialogPrimitive.Close>
                        </DialogPrimitive.Content>
                    </DialogPortal>
                </Dialog>

                <Dialog open={newsletterDialogOpen} onOpenChange={setNewsletterDialogOpen}>
                    <DialogPortal>
                        <DialogOverlay className="z-[60]" />
                        <DialogPrimitive.Content
                            className="fixed left-[50%] top-[50%] z-[60] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
                        >
                            <DialogHeader>
                                <DialogTitle>{newsletterSettings?.title || 'Subscribe to Newsletter'}</DialogTitle>
                            </DialogHeader>
                            {newsletterSettings?.description && (
                                <p className="text-sm text-muted-foreground">{newsletterSettings.description}</p>
                            )}
                            <form
                                action="https://buttondown.com/api/emails/embed-subscribe/artboard"
                                method="post"
                                className="embeddable-buttondown-form space-y-4"
                            >
                                <div className="space-y-2">
                                    <label htmlFor="bd-email" className="text-sm font-medium">
                                        Enter your email
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        id="bd-email"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Subscribe
                                </Button>
                            </form>
                            <DialogPrimitive.Close className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
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