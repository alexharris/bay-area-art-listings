'use client'

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import FilterPresets from './filterPresets';
import CountySelector from './sidebar/countySelector';

const whatLabels = {
    onview: 'All exhibitions',
    opening: 'Upcoming',
    hasOpenings: 'Openings',
};

const whenLabels = {
    anytime: 'Anytime',
    today: 'Today',
    next7: 'Next 7 Days',
    thismonth: 'This Month',
    nextmonth: 'Next Month',
    custom: 'Custom dates',
};

const sortLabels = {
    closingSoon: 'End Date',
    openingSoon: 'Start Date',
    alphabetical: 'Alphabetical',
    recentlyAdded: 'Recently Added',
};

function Chip({ emoji, label, active, onOpen, onClear, hasYellowDot }) {
    return (
        <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm whitespace-nowrap cursor-pointer select-none flex-shrink-0 transition-colors ${
                active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
            }`}
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => e.key === 'Enter' && onOpen()}
        >
            <span>{emoji}</span>
            {hasYellowDot && (
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
            )}
            <span>{label}</span>
            {active ? (
                <button
                    className="ml-0.5 hover:opacity-70 leading-none"
                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                    aria-label="Clear filter"
                >
                    ×
                </button>
            ) : (
                <span className="opacity-40 text-xs">▾</span>
            )}
        </div>
    );
}

function BadgeChip({ emoji, label, active, onToggle, activeClass, inactiveClass }) {
    return (
        <button
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                active ? activeClass : inactiveClass
            }`}
            onClick={onToggle}
        >
            <span>{emoji}</span>
            {label}
            {active && <span className="ml-0.5">×</span>}
        </button>
    );
}

export default function FilterChipRow({
    calendarTypeFilter,
    setCalendarTypeFilter,
    calendarTypeCounts,

    calendarDateRangePreset,
    setCalendarDateRangePreset,
    calendarDateRangeFilter,
    setCalendarDateRangeFilter,
    showCustomCalendar,
    setShowCustomCalendar,

    selectedCounty,
    setSelectedCounty,

    onViewToday,
    setOnViewToday,
    endingSoonOnly,
    setEndingSoonOnly,
    openingTodayOnly,
    setOpeningTodayOnly,
    specialFilterCounts,

    currentFilters,
    listings,

    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfNextMonth,
    endOfNextMonth,

    updateCalendarDateRangeFilter,

    openingTitleOnly,
    setOpeningTitleOnly,
    mobileSearchOpen,
    setMobileSearchOpen,
    searchTerm,
    setSearchTerm,
}) {
    const [whenOpen, setWhenOpen] = useState(false);
    const [whereOpen, setWhereOpen] = useState(false);

    const searchRef = useRef(null);
    useEffect(() => {
        if (mobileSearchOpen) {
            const t = setTimeout(() => searchRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [mobileSearchOpen]);

    const whenActive = calendarDateRangePreset !== 'anytime';
    const whereActive = selectedCounty && selectedCounty.length > 0;
    const countyName = whereActive ? selectedCounty[0]?.county : null;

    const clearWhen = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 10);
        futureDate.setHours(23, 59, 59, 999);
        setCalendarDateRangeFilter({ from: now, to: futureDate });
        setCalendarDateRangePreset('anytime');
        setShowCustomCalendar(false);
    };

    const whenLabel = whenActive
        ? whenLabels[calendarDateRangePreset] || calendarDateRangePreset
        : 'Anytime';

    const whereLabel = whereActive ? countyName : 'Anywhere';

    return (
        <div className="lg:hidden sticky top-14 z-40 bg-white border-b border-gray-200">
            {mobileSearchOpen ? (
                <div className="flex items-center gap-2 px-3 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                        ref={searchRef}
                        type="text"
                        className="flex-1 text-[16px] bg-transparent outline-none placeholder:text-gray-400 min-w-0"
                        placeholder="Search exhibitions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-gray-400 hover:text-gray-600 shrink-0"
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => { setMobileSearchOpen(false); setSearchTerm(''); }}
                        className="text-sm text-gray-600 shrink-0 ml-1"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
            <div className="flex flex-row gap-2 px-3 py-2 overflow-x-auto scrollbar-none">
                {/* When chip */}
                <Chip
                    emoji="📅"
                    label={whenLabel}
                    active={whenActive}
                    onOpen={() => setWhenOpen(true)}
                    onClear={clearWhen}
                />

                {/* Where chip */}
                <Chip
                    emoji="📍"
                    label={whereLabel}
                    active={whereActive}
                    onOpen={() => setWhereOpen(true)}
                    onClear={() => setSelectedCounty([])}
                />

                {/* Badge chips */}
                <BadgeChip
                    emoji="☀️"
                    label="Openings"
                    active={openingTitleOnly}
                    activeClass="bg-yellow-200 border-yellow-300 text-black hover:bg-yellow-300"
                    inactiveClass="bg-gray-100 text-gray-600 border-gray-200"
                    onToggle={() => setOpeningTitleOnly(!openingTitleOnly)}
                />
                {(onViewToday || specialFilterCounts?.onViewToday > 0) && (
                    <BadgeChip
                        emoji="👁️"
                        label="On View Today"
                        active={onViewToday}
                        activeClass="bg-green-300 border-green-400 text-black hover:bg-green-400"
                        inactiveClass="bg-gray-100 text-gray-600 border-gray-200"
                        onToggle={() => setOnViewToday(!onViewToday)}
                    />
                )}
                {(endingSoonOnly || specialFilterCounts?.endingSoonOnly > 0) && (
                    <BadgeChip
                        emoji="⏳"
                        label="Ending Soon"
                        active={endingSoonOnly}
                        activeClass="bg-red-300 border-red-400 text-black hover:bg-red-400"
                        inactiveClass="bg-gray-100 text-gray-600 border-gray-200"
                        onToggle={() => setEndingSoonOnly(!endingSoonOnly)}
                    />
                )}
            </div>
            )}

            {/* When mini-drawer */}
            <Drawer open={whenOpen} onOpenChange={setWhenOpen}>
                <DrawerContent className="px-4 pb-[env(safe-area-inset-bottom)]">
                    <DrawerHeader className="pb-2">
                        <DrawerTitle>When</DrawerTitle>
                    </DrawerHeader>
                    <div className="pb-4 space-y-3">
                        <FilterPresets
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
                        {showCustomCalendar && (
                            <DayPicker
                                mode="range"
                                onSelect={(dateRange) => updateCalendarDateRangeFilter(dateRange)}
                                selected={calendarDateRangeFilter}
                                required
                                showOutsideDays
                            />
                        )}
                        <Button className="w-full" onClick={() => setWhenOpen(false)}>
                            Done
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Where mini-drawer */}
            <Drawer open={whereOpen} onOpenChange={setWhereOpen}>
                <DrawerContent className="px-4 pb-[env(safe-area-inset-bottom)]">
                    <DrawerHeader className="pb-2">
                        <DrawerTitle>Where</DrawerTitle>
                    </DrawerHeader>
                    <div className="pb-4 space-y-3">
                        <CountySelector
                            onCountyChange={setSelectedCounty}
                            selectedCountyProp={selectedCounty}
                            currentFilters={currentFilters}
                            listings={listings}
                        />
                        <Button className="w-full" onClick={() => setWhereOpen(false)}>
                            Done
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
