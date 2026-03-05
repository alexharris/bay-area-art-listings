import React, { useState, useEffect } from 'react';
import { getDateRangeCounts } from '../../utils/filterCounts';

const PRESETS = [
    { value: 'anytime', label: 'Anytime' },
    { value: 'today', label: 'Today' },
    { value: 'next7', label: 'Next 7 Days' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'nextmonth', label: 'Next Month' },
    { value: 'custom', label: 'Custom' },
];

export default function FilterPresets({
    setShowCustomCalendar,
    calendarDateRangePreset,
    setCalendarDateRangeFilter,
    setCalendarDateRangePreset,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfNextMonth,
    endOfNextMonth,
    currentFilters,
    listings
}) {
    const [dateRangeCounts, setDateRangeCounts] = useState({});

    useEffect(() => {
        if (currentFilters && listings && listings.length > 0) {
            const dateRanges = { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth };
            const counts = getDateRangeCounts(currentFilters, listings, dateRanges);
            setDateRangeCounts(counts);
        }
    }, [currentFilters, listings, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth]);

    const handlePresetChange = (presetValue) => {
        setCalendarDateRangePreset(presetValue);

        switch(presetValue) {
            case 'today': {
                setShowCustomCalendar(false);
                const todayFrom = new Date();
                todayFrom.setHours(0, 0, 0, 0);
                const todayTo = new Date();
                todayTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: todayFrom, to: todayTo });
                break;
            }
            case 'next7': {
                setShowCustomCalendar(false);
                const weekFrom = new Date();
                weekFrom.setHours(0, 0, 0, 0);
                const weekTo = new Date(weekFrom);
                weekTo.setDate(weekTo.getDate() + 7);
                weekTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: weekFrom, to: weekTo });
                break;
            }
            case 'thismonth': {
                setShowCustomCalendar(false);
                const monthFrom = new Date(startOfMonth);
                monthFrom.setHours(0, 0, 0, 0);
                const monthTo = new Date(endOfMonth);
                monthTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: monthFrom, to: monthTo });
                break;
            }
            case 'nextmonth': {
                setShowCustomCalendar(false);
                const nextMonthFrom = new Date(startOfNextMonth);
                nextMonthFrom.setHours(0, 0, 0, 0);
                const nextMonthTo = new Date(endOfNextMonth);
                nextMonthTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: nextMonthFrom, to: nextMonthTo });
                break;
            }
            case 'anytime': {
                setShowCustomCalendar(false);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 10);
                futureDate.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: now, to: futureDate });
                break;
            }
            case 'custom':
                setShowCustomCalendar(true);
                break;
            default:
                break;
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {PRESETS.map(({ value, label }) => {
                const active = calendarDateRangePreset === value;
                const count = !active && value !== 'anytime' && value !== 'custom'
                    ? dateRangeCounts[value]
                    : undefined;
                return (
                    <button
                        key={value}
                        onClick={() => handlePresetChange(value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                            active
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        {label}
                        {count != null && <span className="opacity-50">({count})</span>}
                    </button>
                );
            })}
        </div>
    );
}
