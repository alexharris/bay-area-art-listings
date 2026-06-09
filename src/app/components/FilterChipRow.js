'use client'

import { useState, useEffect, useRef } from 'react';
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import CountySelector from './sidebar/countySelector';


function Chip({ emoji, label, active, onOpen, onClear, hasYellowDot }) {
    return (
        <div
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm whitespace-nowrap cursor-pointer select-none flex-shrink-0 transition-colors ${
                active ? 'bg-yellow-50 text-black border-yellow-200' : 'bg-white text-gray-700 border-gray-300'
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
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
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
    activeView = 'exhibitions',
    hasShowOnly,
    setHasShowOnly,
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
    comingUpOnly,
    setComingUpOnly,
    openingTodayOnly,
    setOpeningTodayOnly,
    specialFilterCounts,

    favoritesOnly,
    setFavoritesOnly,
    favoriteCount,

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
    openingsOnly,
    setOpeningsOnly,
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
    const chipRowRef = useRef(null);

    const whenActive = calendarDateRangePreset !== 'anytime';
    const whereActive = (selectedCounty && selectedCounty.length > 0) || !!userLocation;

    useEffect(() => {
        const timer = setTimeout(() => {
            chipRowRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        }, 50);
        return () => clearTimeout(timer);
    }, [whenActive, whereActive, openingTitleOnly, onViewToday, endingSoonOnly, favoritesOnly]);

    const whenLabels = { anytime: 'Anytime', today: 'Today', next7: 'Next 7 Days', thismonth: 'This Month', nextmonth: 'Next Month', custom: 'Custom dates' };
    const whenLabel = whenActive ? (whenLabels[calendarDateRangePreset] || calendarDateRangePreset) : 'Anytime';
    const clearWhen = () => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const futureDate = new Date(); futureDate.setFullYear(futureDate.getFullYear() + 10); futureDate.setHours(23, 59, 59, 999);
        setCalendarDateRangeFilter({ from: now, to: futureDate });
        setCalendarDateRangePreset('anytime');
        setShowCustomCalendar(false);
    };

    const countyNames = selectedCounty ?? [];
    const whereLabel = userLocation ? 'Near me'
        : countyNames.length === 1 ? countyNames[0]
        : countyNames.length > 1 ? `${countyNames.length} counties`
        : 'Anywhere';

    const isEventsView = activeView === 'events';
    const isMapView = activeView === 'map';

    const chips = [
        ...(!isEventsView && !isMapView || whenActive ? [{
            key: 'when',
            active: whenActive,
            el: <Chip key="when" emoji="📅" label={whenLabel} active={whenActive} onOpen={() => setWhenOpen(true)} onClear={clearWhen} />,
        }] : []),
        {
            key: 'where',
            active: whereActive,
            el: <Chip key="where" emoji="📍" label={whereLabel} active={whereActive} onOpen={() => setWhereOpen(true)} onClear={() => { setSelectedCounty([]); clearUserLocation?.(); }} />,
        },
        ...(isMapView ? [{
            key: 'hasShowOnly',
            active: hasShowOnly,
            el: <BadgeChip key="hasShowOnly" emoji="🖼️" label="Has Show" active={hasShowOnly} activeClass="bg-yellow-50 border-yellow-200 text-black hover:bg-yellow-100" inactiveClass="bg-white text-gray-600 border-gray-200 hover:border-gray-300" onToggle={() => setHasShowOnly(!hasShowOnly)} />,
        }] : []),
        ...(isEventsView ? [{
            key: 'openingsOnly',
            active: openingsOnly,
            el: <BadgeChip key="openingsOnly" emoji="🚪" label="Openings" active={openingsOnly} activeClass="bg-yellow-50 border-yellow-200 text-black hover:bg-yellow-100" inactiveClass="bg-white text-gray-600 border-gray-200 hover:border-gray-300" onToggle={() => setOpeningsOnly(!openingsOnly)} />,
        }] : []),
        ...(!isEventsView ? [{
            key: 'openingTitleOnly',
            active: openingTitleOnly,
            el: <BadgeChip key="openingTitleOnly" emoji="☀️" label="Has Events" count={specialFilterCounts?.openingTitleOnly} active={openingTitleOnly} activeClass="bg-yellow-50 border-yellow-200 text-black hover:bg-yellow-100" inactiveClass={!openingTitleOnly && !specialFilterCounts?.openingTitleOnly ? "bg-white text-gray-300 border-gray-100 cursor-not-allowed" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"} onToggle={() => (specialFilterCounts?.openingTitleOnly > 0 || openingTitleOnly) && setOpeningTitleOnly(!openingTitleOnly)} />,
        }] : []),
        ...(!isEventsView ? [{
            key: 'onViewToday',
            active: onViewToday,
            el: <BadgeChip key="onViewToday" emoji="🟢" label="On View Today" count={specialFilterCounts?.onViewToday} active={onViewToday} activeClass="bg-yellow-50 border-yellow-200 text-black hover:bg-yellow-100" inactiveClass={!onViewToday && !specialFilterCounts?.onViewToday ? "bg-white text-gray-300 border-gray-100 cursor-not-allowed" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"} onToggle={() => (specialFilterCounts?.onViewToday > 0 || onViewToday) && setOnViewToday(!onViewToday)} />,
        }] : []),
        ...(!isEventsView && !isMapView && (endingSoonOnly || specialFilterCounts?.endingSoonOnly > 0) ? [{
            key: 'endingSoon',
            active: endingSoonOnly,
            el: <BadgeChip key="endingSoon" emoji="⏳" label="Ending Soon" count={specialFilterCounts?.endingSoonOnly} active={endingSoonOnly} activeClass="bg-yellow-50 border-yellow-200 text-black hover:bg-yellow-100" inactiveClass="bg-white text-gray-600 border-gray-200 hover:border-gray-300" onToggle={() => setEndingSoonOnly(!endingSoonOnly)} />,
        }] : []),
        ...(!isEventsView && !isMapView ? [{
            key: 'comingUp',
            active: comingUpOnly,
            el: <BadgeChip key="comingUp" emoji="🔜" label="Coming Up" count={specialFilterCounts?.comingUpOnly} active={comingUpOnly} activeClass="bg-yellow-50 border-yellow-200 text-black hover:bg-yellow-100" inactiveClass={!comingUpOnly && !specialFilterCounts?.comingUpOnly ? "bg-white text-gray-300 border-gray-100 cursor-not-allowed" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"} onToggle={() => (specialFilterCounts?.comingUpOnly > 0 || comingUpOnly) && setComingUpOnly(!comingUpOnly)} />,
        }] : []),
        ...(!isEventsView ? [{
            key: 'favorites',
            active: favoritesOnly,
            el: <BadgeChip key="favorites" emoji="⭐" label="Starred" count={specialFilterCounts?.favorites > 0 ? specialFilterCounts.favorites : null} active={favoritesOnly} activeClass="bg-yellow-50 border-yellow-200 text-black hover:bg-yellow-100" inactiveClass={!favoritesOnly && !specialFilterCounts?.favorites ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300'} onToggle={() => (specialFilterCounts?.favorites > 0 || favoritesOnly) && setFavoritesOnly(!favoritesOnly)} />,
        }] : []),
    ].sort((a, b) => Number(b.active) - Number(a.active));

    return (
        <div className="bg-white border-b border-gray-200">
            <div ref={chipRowRef} className="flex flex-row gap-2 px-3 py-2 overflow-x-auto scrollbar-none">
                {chips.map(c => c.el)}
            </div>

            {/* When mini-drawer */}
            <Drawer open={whenOpen} onOpenChange={setWhenOpen}>
                <DrawerContent className="pb-[env(safe-area-inset-bottom)]">
                    <p className="px-4 pt-3 pb-1 text-sm text-gray-500">Find shows that are running in a certain date range</p>
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

                    <div className="h-64 overflow-y-auto">
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
                            <Button className="w-full" onClick={() => setWhenOpen(false)}>Done</Button>
                        </div>
                    )}
                    </div>
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
