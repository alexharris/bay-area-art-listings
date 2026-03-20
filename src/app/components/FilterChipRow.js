'use client'

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import CountySelector from './sidebar/countySelector';


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

function BadgeChip({ emoji, label, count, active, onToggle, activeClass, inactiveClass }) {
    return (
        <button
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                active ? activeClass : inactiveClass
            }`}
            onClick={onToggle}
        >
            <span>{emoji}</span>
            {label}
            {!active && count != null && <span className="opacity-50">({count})</span>}
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
    userLocation,
    nearbyRadius,
    setNearbyRadius,
    locationError,
    locationLoading,
    getUserLocation,
    clearUserLocation,
}) {
    const [whenOpen, setWhenOpen] = useState(false);
    const [whenTab, setWhenTab] = useState('presets');
    const [whereOpen, setWhereOpen] = useState(false);

    const searchRef = useRef(null);
    useEffect(() => {
        if (mobileSearchOpen) {
            const t = setTimeout(() => searchRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [mobileSearchOpen]);

    const whenActive = calendarDateRangePreset !== 'anytime';
    const whereActive = (selectedCounty && selectedCounty.length > 0) || !!userLocation;

    const whenLabels = { anytime: 'Anytime', today: 'Today', next7: 'Next 7 Days', thismonth: 'This Month', nextmonth: 'Next Month', custom: 'Custom dates' };
    const whenLabel = whenActive ? (whenLabels[calendarDateRangePreset] || calendarDateRangePreset) : 'Anytime';
    const clearWhen = () => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const futureDate = new Date(); futureDate.setFullYear(futureDate.getFullYear() + 10); futureDate.setHours(23, 59, 59, 999);
        setCalendarDateRangeFilter({ from: now, to: futureDate });
        setCalendarDateRangePreset('anytime');
        setShowCustomCalendar(false);
    };

    const countyNames = selectedCounty?.map(obj => obj.county) ?? [];
    const whereLabel = userLocation ? 'Near me'
        : countyNames.length === 1 ? countyNames[0]
        : countyNames.length > 1 ? `${countyNames.length} counties`
        : 'Anywhere';

    return (
        <div className="lg:hidden fixed inset-x-0 top-12 z-40 bg-white border-b border-gray-200">
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
                    onClear={() => { setSelectedCounty([]); clearUserLocation?.(); }}
                />

                {/* Badge chips */}
                <BadgeChip
                    emoji="☀️"
                    label="Has Events"
                    count={specialFilterCounts?.openingTitleOnly}
                    active={openingTitleOnly}
                    activeClass="bg-yellow-200 border-yellow-300 text-black hover:bg-yellow-300"
                    inactiveClass={!openingTitleOnly && !specialFilterCounts?.openingTitleOnly ? "bg-white text-gray-300 border-gray-100 cursor-not-allowed" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}
                    onToggle={() => (specialFilterCounts?.openingTitleOnly > 0 || openingTitleOnly) && setOpeningTitleOnly(!openingTitleOnly)}
                />
                {(onViewToday || specialFilterCounts?.onViewToday > 0) && (
                    <BadgeChip
                        emoji="👁️"
                        label="On View Today"
                        count={specialFilterCounts?.onViewToday}
                        active={onViewToday}
                        activeClass="bg-green-300 border-green-400 text-black hover:bg-green-400"
                        inactiveClass="bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        onToggle={() => setOnViewToday(!onViewToday)}
                    />
                )}
                {(endingSoonOnly || specialFilterCounts?.endingSoonOnly > 0) && (
                    <BadgeChip
                        emoji="⏳"
                        label="Ending Soon"
                        count={specialFilterCounts?.endingSoonOnly}
                        active={endingSoonOnly}
                        activeClass="bg-red-300 border-red-400 text-black hover:bg-red-400"
                        inactiveClass="bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        onToggle={() => setEndingSoonOnly(!endingSoonOnly)}
                    />
                )}
            </div>
            )}

            {/* When mini-drawer */}
            <Drawer open={whenOpen} onOpenChange={setWhenOpen}>
                <DrawerContent className="pb-[env(safe-area-inset-bottom)]">
                    {/* Segmented control */}
                    <div className="px-4 pt-2 pb-3">
                        <div className="flex bg-gray-100 rounded-xl p-1">
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

                    {whenTab === 'presets' ? (
                        <div className="flex flex-col pb-4">
                            {[
                                { value: 'anytime', label: 'Anytime' },
                                { value: 'today', label: 'Today' },
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
                                    } else if (value === 'today') {
                                        const from = new Date(); from.setHours(0, 0, 0, 0);
                                        const to = new Date(); to.setHours(23, 59, 59, 999);
                                        setCalendarDateRangeFilter({ from, to });
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
                                    setWhenOpen(false);
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
                        <div className="px-4 pb-4">
                            <DayPicker
                                mode="range"
                                onSelect={(dateRange) => {
                                    if (dateRange) {
                                        setCalendarDateRangeFilter(dateRange);
                                        setCalendarDateRangePreset('custom');
                                        setShowCustomCalendar(true);
                                    }
                                }}
                                selected={calendarDateRangeFilter}
                                showOutsideDays
                            />
                            <Button className="w-full mt-2" onClick={() => setWhenOpen(false)}>Done</Button>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>

            {/* Where mini-drawer */}
            <Drawer open={whereOpen} onOpenChange={setWhereOpen}>
                <DrawerContent className="px-4 pb-[env(safe-area-inset-bottom)]">
                    <div className="pb-4 space-y-3">
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
                            listMode
                            onSelect={() => setWhereOpen(false)}
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
