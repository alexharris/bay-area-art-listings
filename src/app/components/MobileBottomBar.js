'use client'

import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ArrowUpDown, Search, Check, X } from 'lucide-react';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CalendarTypeSelector from './sidebar/CalendarTypeSelector';
import FilterBadges from './sidebar/FilterBadges';
import FilterPresets from './filterPresets';
import CountySelector from './sidebar/countySelector';
import SearchInput from './SearchInput';

const sortOptions = [
    { value: 'closingSoon', label: 'End Date' },
    { value: 'openingSoon', label: 'Start Date' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'recentlyAdded', label: 'Recently Added' },
];

export default function MobileBottomBar({
    // Filter states
    calendarTypeFilter,
    setCalendarTypeFilter,
    calendarTypeCounts,
    specialFilterCounts,
    calendarDateRangeFilter,
    setCalendarDateRangeFilter,
    calendarDateRangePreset,
    setCalendarDateRangePreset,
    onViewToday,
    setOnViewToday,
    endingSoonOnly,
    setEndingSoonOnly,
    openingTodayOnly,
    setOpeningTodayOnly,
    selectedCounty,
    setSelectedCounty,
    showCustomCalendar,
    setShowCustomCalendar,
    searchTerm,
    setSearchTerm,
    sortMethod,
    setSortMethod,
    displayedResults,
    listings,
    currentFilters,

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
    const [activeSheet, setActiveSheet] = useState(null);
    const searchInputRef = useRef(null);

    // Auto-focus search input when search sheet opens
    useEffect(() => {
        if (activeSheet === 'search') {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeSheet]);

    const hasActiveFilters = calendarTypeFilter !== 'onview'
        || onViewToday
        || endingSoonOnly
        || openingTodayOnly
        || (selectedCounty && selectedCounty.length > 0)
        || calendarDateRangePreset !== 'anytime';

    const hasActiveSearch = searchTerm.length > 0;

    return (
        <>
            {/* Bottom navigation bar */}
            <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
                <div className="flex flex-row items-center justify-around h-14">
                    <button
                        onClick={() => setActiveSheet(activeSheet === 'filters' ? null : 'filters')}
                        className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
                        aria-label="Open filters"
                    >
                        <SlidersHorizontal size={20} />
                        <span className="text-[10px]">Filters</span>
                        {hasActiveFilters && (
                            <span className="absolute top-1.5 right-1/2 -translate-x-[-12px] w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveSheet(activeSheet === 'sort' ? null : 'sort')}
                        className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
                        aria-label="Open sort options"
                    >
                        <ArrowUpDown size={20} />
                        <span className="text-[10px]">Sort</span>
                    </button>
                    <button
                        onClick={() => setActiveSheet(activeSheet === 'search' ? null : 'search')}
                        className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
                        aria-label="Open search"
                    >
                        <Search size={20} />
                        <span className="text-[10px]">Search</span>
                        {hasActiveSearch && (
                            <span className="absolute top-1.5 right-1/2 -translate-x-[-12px] w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Filters Sheet */}
            <Sheet open={activeSheet === 'filters'} onOpenChange={(open) => setActiveSheet(open ? 'filters' : null)}>
                <SheetContent side="bottom" className="max-h-[80vh] rounded-t-xl px-4 pb-0 overflow-y-auto [&>button:last-child]:hidden">
                    <SheetHeader className="pb-2">
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 pb-4">
                        <CalendarTypeSelector
                            calendarTypeFilter={calendarTypeFilter}
                            setCalendarTypeFilter={setCalendarTypeFilter}
                            calendarTypeCounts={calendarTypeCounts}
                        />
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
                            <div>
                                <DayPicker
                                    mode="range"
                                    onSelect={(dateRange) => updateCalendarDateRangeFilter(dateRange)}
                                    selected={calendarDateRangeFilter}
                                    required
                                    showOutsideDays
                                />
                            </div>
                        )}
                        <CountySelector
                            onCountyChange={setSelectedCounty}
                            selectedCountyProp={selectedCounty}
                            currentFilters={currentFilters}
                            listings={listings}
                        />
                        <FilterBadges
                            onViewToday={onViewToday}
                            setOnViewToday={setOnViewToday}
                            endingSoonOnly={endingSoonOnly}
                            setEndingSoonOnly={setEndingSoonOnly}
                            openingTodayOnly={openingTodayOnly}
                            setOpeningTodayOnly={setOpeningTodayOnly}
                            specialFilterCounts={specialFilterCounts}
                        />
                        <div className="flex flex-row gap-2 justify-end">
                            <Button
                                onClick={clearAllFilters}
                                variant="outline"
                                size="sm"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                    {/* Sticky footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 py-3 -mx-4 px-4">
                        <Button
                            className="w-full"
                            onClick={() => setActiveSheet(null)}
                        >
                            View {displayedResults} Results
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Sort Sheet */}
            <Sheet open={activeSheet === 'sort'} onOpenChange={(open) => setActiveSheet(open ? 'sort' : null)}>
                <SheetContent side="bottom" className="rounded-t-xl px-0 pb-[env(safe-area-inset-bottom)] [&>button:last-child]:hidden">
                    <SheetHeader className="px-4 pb-2">
                        <SheetTitle>Sort by</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                className="flex flex-row items-center justify-between px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-left"
                                onClick={() => {
                                    setSortMethod(option.value);
                                    setActiveSheet(null);
                                }}
                            >
                                <span className="text-sm">{option.label}</span>
                                {sortMethod === option.value && (
                                    <Check size={18} className="text-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Search Sheet */}
            <Sheet open={activeSheet === 'search'} onOpenChange={(open) => setActiveSheet(open ? 'search' : null)}>
                <SheetContent side="bottom" className="rounded-t-xl [&>button:last-child]:hidden">
                    <SheetHeader className="pb-2">
                        <SheetTitle>Search</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-3">
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex-1">
                                <SearchInput
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    inputRef={searchInputRef}
                                />
                            </div>
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {displayedResults} result{displayedResults !== 1 ? 's' : ''}
                        </p>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
