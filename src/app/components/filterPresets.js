import React, { useState, useEffect } from 'react';
import { getDateRangeCounts } from '../../utils/filterCounts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

    const handlePresetChange = (presetValue) => {
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
            <label className="pr-2 w-20">When</label>
            <Select value={calendarDateRangePreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="flex-grow">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="anytime">
                        Anytime {calendarDateRangePreset !== 'anytime' && dateRangeCounts['anytime'] !== undefined ? `(${dateRangeCounts['anytime']})` : ''}
                    </SelectItem>
                    <SelectItem value="today">
                        Today {calendarDateRangePreset !== 'today' && dateRangeCounts['today'] !== undefined ? `(${dateRangeCounts['today']})` : ''}
                    </SelectItem>
                    <SelectItem value="next7">
                        Next 7 Days {calendarDateRangePreset !== 'next7' && dateRangeCounts['next7'] !== undefined ? `(${dateRangeCounts['next7']})` : ''}
                    </SelectItem>
                    <SelectItem value="thismonth">
                        This Month {calendarDateRangePreset !== 'thismonth' && dateRangeCounts['thismonth'] !== undefined ? `(${dateRangeCounts['thismonth']})` : ''}
                    </SelectItem>
                    <SelectItem value="nextmonth">
                        Next Month {calendarDateRangePreset !== 'nextmonth' && dateRangeCounts['nextmonth'] !== undefined ? `(${dateRangeCounts['nextmonth']})` : ''}
                    </SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
