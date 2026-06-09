'use client'

import { useState } from "react";
import CountySelector from './countySelector';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Sheet, SheetPortal, SheetTitle } from "@/components/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import AboutContent from '../aboutContent';

export default function Sidebar({
    // Display states
    isMapView,
    setIsMapView,
    activeView = 'exhibitions',
    setActiveView,
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
    comingUpOnly,
    setComingUpOnly,
    openingTitleOnly,
    setOpeningTitleOnly,
    hasShowOnly,
    setHasShowOnly,
    favoritesOnly,
    setFavoritesOnly,
    favoriteCount,
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
    const [whenDrawerOpen, setWhenDrawerOpen] = useState(false);
    const [whenTab, setWhenTab] = useState('presets');

    const isEventsView = activeView === 'events';
    const whenActive = calendarDateRangePreset !== 'anytime';
    const whenLabels = { anytime: 'Anytime', today: 'Today', next7: 'Next 7 Days', thismonth: 'This Month', nextmonth: 'Next Month', custom: 'Custom dates' };
    const whenLabel = whenActive ? (whenLabels[calendarDateRangePreset] || calendarDateRangePreset) : 'Anytime';
    const clearWhen = () => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const futureDate = new Date(); futureDate.setFullYear(futureDate.getFullYear() + 10); futureDate.setHours(23, 59, 59, 999);
        setCalendarDateRangeFilter({ from: now, to: futureDate });
        setCalendarDateRangePreset('anytime');
        setShowCustomCalendar(false);
    };

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

                {/* View toggle */}
                <div className="flex items-stretch border border-gray-300 rounded-lg overflow-hidden text-sm">
                    <button
                        onClick={() => setActiveView('exhibitions')}
                        className={`flex-1 flex items-center justify-center py-2 border-r border-gray-300 transition-colors ${activeView === 'exhibitions' ? 'font-medium text-black bg-yellow-50' : 'text-black'}`}
                    >
                        Exhibitions
                    </button>
                    <button
                        onClick={() => setActiveView('events')}
                        className={`flex-1 flex items-center justify-center py-2 border-r border-gray-300 transition-colors ${activeView === 'events' ? 'font-medium text-black bg-yellow-50' : 'text-black'}`}
                    >
                        Events
                    </button>
                    <button
                        onClick={() => setActiveView('map')}
                        className={`flex-1 flex items-center justify-center py-2 transition-colors ${activeView === 'map' ? 'font-medium text-black bg-yellow-50' : 'text-black'}`}
                    >
                        Map
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {!isEventsView && (
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${openingTitleOnly ? 'bg-yellow-50 border-yellow-200 text-black' : !openingTitleOnly && specialFilterCounts.openingTitleOnly === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
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
                    )}
                    {!isEventsView && (
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${onViewToday ? 'bg-yellow-50 border-yellow-200 text-black' : !onViewToday && specialFilterCounts.onViewToday === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
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
                    )}
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${openingTodayOnly ? 'bg-yellow-50 border-yellow-200 text-black' : !openingTodayOnly && specialFilterCounts.openingTodayOnly === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
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
                    {!isEventsView && activeView !== 'map' && (
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${endingSoonOnly ? 'bg-yellow-50 border-yellow-200 text-black' : !endingSoonOnly && specialFilterCounts.endingSoonOnly === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
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
                    )}
                    {!isEventsView && activeView !== 'map' && (
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${comingUpOnly ? 'bg-yellow-50 border-yellow-200 text-black' : !comingUpOnly && specialFilterCounts.comingUpOnly === 0 ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            onClick={() => (specialFilterCounts.comingUpOnly > 0 || comingUpOnly) && setComingUpOnly(!comingUpOnly)}
                            disabled={!comingUpOnly && specialFilterCounts.comingUpOnly === 0}
                        >
                            🔜 Coming Up
                            {!comingUpOnly && specialFilterCounts.comingUpOnly > 0 && <span className="opacity-50">({specialFilterCounts.comingUpOnly})</span>}
                        </button>
                        {comingUpOnly && (
                            <button onClick={() => setComingUpOnly(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear coming up filter">×</button>
                        )}
                    </div>
                    )}
                    {!isEventsView && (
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${favoritesOnly ? 'bg-yellow-50 border-yellow-200 text-black' : !specialFilterCounts.favorites ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            onClick={() => (specialFilterCounts.favorites > 0 || favoritesOnly) && setFavoritesOnly(!favoritesOnly)}
                            disabled={!favoritesOnly && !specialFilterCounts.favorites}
                        >
                            ⭐ Starred
                            {!favoritesOnly && specialFilterCounts.favorites > 0 && <span className="opacity-50">({specialFilterCounts.favorites})</span>}
                        </button>
                        {favoritesOnly && (
                            <button onClick={() => setFavoritesOnly(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear favorites filter">×</button>
                        )}
                    </div>
                    )}
                </div>

                {activeView === 'map' ? (
                    <div className="flex items-center gap-1">
                        <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${hasShowOnly ? 'bg-yellow-50 border-yellow-200 text-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                            onClick={() => setHasShowOnly(!hasShowOnly)}
                        >
                            🖼️ Has Show
                        </button>
                        {hasShowOnly && (
                            <button onClick={() => setHasShowOnly(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear has show filter">×</button>
                        )}
                    </div>
                ) : (
                <div className="flex items-center gap-1">
                    <button
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${whenActive ? 'bg-yellow-50 border-yellow-200 text-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                        onClick={() => setWhenDrawerOpen(true)}
                    >
                        📅 {whenLabel}
                        <span className={`text-xs ml-0.5 ${whenActive ? 'opacity-60' : 'opacity-40'}`}>▾</span>
                    </button>
                    {whenActive && (
                        <button onClick={clearWhen} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Clear date filter">×</button>
                    )}
                </div>
                )}                                                
          
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

            {/* When drawer */}
            <Sheet open={whenDrawerOpen} onOpenChange={setWhenDrawerOpen}>
                <SheetPortal>
                    <SheetPrimitive.Content className="fixed inset-y-0 right-0 z-[60] flex flex-col w-full max-w-sm bg-white shadow-xl transition ease-in-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
                        <SheetTitle className="sr-only">When</SheetTitle>
                        <button
                            onClick={() => setWhenDrawerOpen(false)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            aria-label="Close panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                        <p className="px-4 pt-5 pb-1 text-sm text-gray-500">Find shows that are running in a certain date range</p>
                        {/* Segmented control */}
                        <div className="px-4 pt-2 pb-3">
                            <div className="flex bg-yellow-50 rounded-xl p-1">
                                <button
                                    onClick={() => setWhenTab('presets')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${whenTab === 'presets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                                >
                                    Date range
                                </button>
                                <button
                                    onClick={() => setWhenTab('custom')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${whenTab === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                                >
                                    Custom
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {whenTab === 'presets' ? (
                                <div className="flex flex-col pb-4">
                                    {[
                                        { value: 'anytime', label: 'Anytime' },
                                        { value: 'next7', label: 'Next 7 Days' },
                                        { value: 'thismonth', label: 'This Month' },
                                        { value: 'nextmonth', label: 'Next Month' },
                                    ].map(({ value, label }) => {
                                        const selectPreset = () => {
                                            setCalendarDateRangePreset(value);
                                            setShowCustomCalendar(false);
                                            if (value === 'anytime') {
                                                const now = new Date(); now.setHours(0, 0, 0, 0);
                                                const far = new Date(); far.setFullYear(far.getFullYear() + 10); far.setHours(23, 59, 59, 999);
                                                setCalendarDateRangeFilter({ from: now, to: far });
                                            } else if (value === 'next7') {
                                                const from = new Date(); from.setHours(0, 0, 0, 0);
                                                const to = new Date(from); to.setDate(to.getDate() + 7); to.setHours(23, 59, 59, 999);
                                                setCalendarDateRangeFilter({ from, to });
                                            } else if (value === 'thismonth') {
                                                const from = new Date(startOfMonth); from.setHours(0, 0, 0, 0);
                                                const to = new Date(endOfMonth); to.setHours(23, 59, 59, 999);
                                                setCalendarDateRangeFilter({ from, to });
                                            } else if (value === 'nextmonth') {
                                                const from = new Date(startOfNextMonth); from.setHours(0, 0, 0, 0);
                                                const to = new Date(endOfNextMonth); to.setHours(23, 59, 59, 999);
                                                setCalendarDateRangeFilter({ from, to });
                                            }
                                            setWhenDrawerOpen(false);
                                        };
                                        return (
                                            <button
                                                key={value}
                                                onClick={selectPreset}
                                                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm border-t border-gray-100 ${calendarDateRangePreset === value ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                                            >
                                                <span className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${calendarDateRangePreset === value ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'}`}>
                                                    {calendarDateRangePreset === value && (
                                                        <svg width="6" height="6" viewBox="0 0 6 6" fill="white"><circle cx="3" cy="3" r="3"/></svg>
                                                    )}
                                                </span>
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-4 pb-4 flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm text-gray-500">Start date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900"
                                            value={calendarDateRangeFilter?.from ? calendarDateRangeFilter.from.toISOString().split('T')[0] : ''}
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const from = new Date(e.target.value + 'T00:00:00');
                                                const to = calendarDateRangeFilter?.to && calendarDateRangeFilter.to >= from
                                                    ? calendarDateRangeFilter.to
                                                    : new Date(e.target.value + 'T23:59:59');
                                                setCalendarDateRangeFilter({ from, to });
                                                setCalendarDateRangePreset('custom');
                                                setShowCustomCalendar(true);
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm text-gray-500">End date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900"
                                            value={calendarDateRangeFilter?.to ? calendarDateRangeFilter.to.toISOString().split('T')[0] : ''}
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const to = new Date(e.target.value + 'T23:59:59');
                                                const from = calendarDateRangeFilter?.from && calendarDateRangeFilter.from <= to
                                                    ? calendarDateRangeFilter.from
                                                    : new Date(e.target.value + 'T00:00:00');
                                                setCalendarDateRangeFilter({ from, to });
                                                setCalendarDateRangePreset('custom');
                                                setShowCustomCalendar(true);
                                            }}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={() => setWhenDrawerOpen(false)}>Done</Button>
                                </div>
                            )}
                        </div>
                    </SheetPrimitive.Content>
                </SheetPortal>
            </Sheet>

            {/* Dialogs */}
            <Sheet open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
                <SheetPortal>
                    <SheetPrimitive.Content className="fixed inset-y-0 right-0 z-[60] flex flex-col w-full max-w-lg bg-white shadow-xl transition ease-in-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right overflow-y-auto">
                        <SheetTitle className="sr-only">About</SheetTitle>
                        <button
                            onClick={() => setAboutDialogOpen(false)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            aria-label="Close panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                        <div className="px-6 py-8">
                            <AboutContent />
                        </div>
                    </SheetPrimitive.Content>
                </SheetPortal>
            </Sheet>

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