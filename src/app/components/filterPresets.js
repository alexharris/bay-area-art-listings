import React, { useState, useEffect } from 'react';
import { getDateRangeCounts } from '../../utils/filterCounts';

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

    // Calculate counts when filters or listings change
    useEffect(() => {
        if (currentFilters && listings && listings.length > 0) {
            const dateRanges = {
                startOfWeek,
                endOfWeek,
                startOfMonth,
                endOfMonth,
                startOfNextMonth,
                endOfNextMonth
            };
            const counts = getDateRangeCounts(currentFilters, listings, dateRanges);
            setDateRangeCounts(counts);
        }
    }, [currentFilters, listings, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth]);

    const handlePresetChange = (e) => {
        const presetValue = e.target.value;
        setCalendarDateRangePreset(presetValue);

        switch(presetValue) {
            case 'today':
                setShowCustomCalendar(false); 
                const todayFrom = new Date();
                todayFrom.setHours(0, 0, 0, 0);
                const todayTo = new Date();
                todayTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: todayFrom, to: todayTo }); 
                break;
            case 'next7':
                setShowCustomCalendar(false); 
                const weekFrom = new Date();
                weekFrom.setHours(0, 0, 0, 0);
                const weekTo = new Date(weekFrom);
                weekTo.setDate(weekTo.getDate() + 7);
                weekTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: weekFrom, to: weekTo }); 
                break;
            case 'thismonth':
                setShowCustomCalendar(false); 
                const monthFrom = new Date(startOfMonth);
                monthFrom.setHours(0, 0, 0, 0);
                const monthTo = new Date(endOfMonth);
                monthTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: monthFrom, to: monthTo }); 
                break;
            case 'nextmonth':
                setShowCustomCalendar(false); 
                const nextMonthFrom = new Date(startOfNextMonth);
                nextMonthFrom.setHours(0, 0, 0, 0);
                const nextMonthTo = new Date(endOfNextMonth);
                nextMonthTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: nextMonthFrom, to: nextMonthTo }); 
                break;
            case 'anytime':
                setShowCustomCalendar(false);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                // Set end date far in the future to capture all upcoming events
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 10);
                futureDate.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: now, to: futureDate });
                break;
            case 'custom':
                setShowCustomCalendar(true); 
                break;
            default:
                break;
        }
    };

    return (
        <div className="flex flex-row items-center relative">
            <label htmlFor="timeFilter" className="w-24 pr-2">When</label>
            <select 
                id="timeFilter" 
                value={calendarDateRangePreset}
                onChange={handlePresetChange}
                className="border border-gray-300 flex-grow bg-white rounded px-2 py-1"
            >
                <option value="anytime">Anytime {calendarDateRangePreset !== 'anytime' && dateRangeCounts['anytime'] !== undefined ? `(${dateRangeCounts['anytime']})` : ''}</option>
                <option value="today">Today {calendarDateRangePreset !== 'today' && dateRangeCounts['today'] !== undefined ? `(${dateRangeCounts['today']})` : ''}</option>
                <option value="next7">Next 7 Days {calendarDateRangePreset !== 'next7' && dateRangeCounts['next7'] !== undefined ? `(${dateRangeCounts['next7']})` : ''}</option>
                <option value="thismonth">This Month {calendarDateRangePreset !== 'thismonth' && dateRangeCounts['thismonth'] !== undefined ? `(${dateRangeCounts['thismonth']})` : ''}</option>
                <option value="nextmonth">Next Month {calendarDateRangePreset !== 'nextmonth' && dateRangeCounts['nextmonth'] !== undefined ? `(${dateRangeCounts['nextmonth']})` : ''}</option>
                <option value="custom">Custom</option>
            </select>
        </div>
    );
}
