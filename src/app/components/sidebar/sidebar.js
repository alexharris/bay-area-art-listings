'use client'

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useState } from "react";
import CountySelector from './countySelector';
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
    specialFilterCounts = { onViewToday: 0, endingSoonOnly: 0, openingTodayOnly: 0, openingTitleOnly: 0 },
    calendarDateRangeFilter,
    setCalendarDateRangeFilter,
    calendarDateRangePreset,
    setCalendarDateRangePreset,
    onViewToday,
    setOnViewToday,
    openingTodayOnly,
    setOpeningTodayOnly,
    endingSoonOnly,
    setEndingSoonOnly,
    openingTitleOnly,
    setOpeningTitleOnly,
    selectedLocation,
    setSelectedLocation,
    selectedCounty,
    setSelectedCounty,
    userLocation,
    nearbyRadius,
    setNearbyRadius,
    locationError,
    locationLoading,
    getUserLocation,
    clearUserLocation,

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
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
                {/* Logo at the top of the sidebar */}
                {showLogo && (
                    <div className="flex flex-col justify-center items-center w-full">
                        <Link href="/">
                            <img 
                                src="/art-board-logo.png" 
                                alt="Art Board"     
                                className="h-32 lg:h-40"                       
                            />
                        </Link>
                    </div>
                )}
                <p className="hidden md:block">A directory of visual arts exhibitions in the Bay Area.</p>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${openingTitleOnly ? 'bg-yellow-200 border-yellow-300 text-black' : !openingTitleOnly && specialFilterCounts.openingTitleOnly === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            onClick={() => (specialFilterCounts.openingTitleOnly > 0 || openingTitleOnly) && setOpeningTitleOnly(!openingTitleOnly)}
                            disabled={!openingTitleOnly && specialFilterCounts.openingTitleOnly === 0}
                        >
                            ☀️ Has Events
                            {!openingTitleOnly && specialFilterCounts.openingTitleOnly > 0 && <span className="opacity-50">({specialFilterCounts.openingTitleOnly})</span>}
                        </button>
                        {openingTitleOnly && (
                            <button onClick={() => setOpeningTitleOnly(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear openings filter">×</button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${onViewToday ? 'bg-green-300 border-green-400 text-black' : !onViewToday && specialFilterCounts.onViewToday === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            onClick={() => (specialFilterCounts.onViewToday > 0 || onViewToday) && setOnViewToday(!onViewToday)}
                            disabled={!onViewToday && specialFilterCounts.onViewToday === 0}
                        >
                            🟢 On View Today
                            {!onViewToday && specialFilterCounts.onViewToday > 0 && <span className="opacity-50">({specialFilterCounts.onViewToday})</span>}
                        </button>
                        {onViewToday && (
                            <button onClick={() => setOnViewToday(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear on view today filter">×</button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${openingTodayOnly ? 'bg-green-300 border-green-400 text-black' : !openingTodayOnly && specialFilterCounts.openingTodayOnly === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            onClick={() => (specialFilterCounts.openingTodayOnly > 0 || openingTodayOnly) && setOpeningTodayOnly(!openingTodayOnly)}
                            disabled={!openingTodayOnly && specialFilterCounts.openingTodayOnly === 0}
                        >
                            👁️ Starting Today
                            {!openingTodayOnly && specialFilterCounts.openingTodayOnly > 0 && <span className="opacity-50">({specialFilterCounts.openingTodayOnly})</span>}
                        </button>
                        {openingTodayOnly && (
                            <button onClick={() => setOpeningTodayOnly(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear opening today filter">×</button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${endingSoonOnly ? 'bg-red-300 border-red-400 text-black' : !endingSoonOnly && specialFilterCounts.endingSoonOnly === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            onClick={() => (specialFilterCounts.endingSoonOnly > 0 || endingSoonOnly) && setEndingSoonOnly(!endingSoonOnly)}
                            disabled={!endingSoonOnly && specialFilterCounts.endingSoonOnly === 0}
                        >
                            ⏳ Ending Soon
                            {!endingSoonOnly && specialFilterCounts.endingSoonOnly > 0 && <span className="opacity-50">({specialFilterCounts.endingSoonOnly})</span>}
                        </button>
                        {endingSoonOnly && (
                            <button onClick={() => setEndingSoonOnly(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear ending soon filter">×</button>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-100"></div>
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
          
                <CountySelector
                    onCountyChange={setSelectedCounty}
                    selectedCountyProp={selectedCounty}
                    currentFilters={currentFilters}
                    listings={listings}
                    userLocation={userLocation}
                    nearbyRadius={nearbyRadius}
                    setNearbyRadius={setNearbyRadius}
                    locationError={locationError}
                    locationLoading={locationLoading}
                    getUserLocation={getUserLocation}
                    clearUserLocation={clearUserLocation}
                    chipStyle
                />
                {/* Stats indicator showing total vs. filtered listings */}
                <div className="border-t border-gray-100 pt-3 flex flex-row items-center justify-between">
                    <span className="text-sm text-gray-500">
                        {displayedResults} of {listings.length} listings
                    </span>
                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Fixed bottom section with About and Newsletter */}
            <div className="mx-4 py-4 border-t border-gray-200 bg-white">
                <div className="flex flex-col gap-2">
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