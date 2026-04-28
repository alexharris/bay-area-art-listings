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

    const isActive = calendarDateRangePreset !== 'anytime';

    return (
        <div className="flex items-center gap-2">
            <Select value={calendarDateRangePreset} onValueChange={handlePresetChange}>
                <SelectTrigger className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm h-auto w-auto transition-colors [&>svg]:hidden ${
                    isActive
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}>
                    📅 <SelectValue />
                    <span className="opacity-40 text-xs ml-0.5">▾</span>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="anytime">
                        Anytime {calendarDateRangePreset !== 'anytime' && dateRangeCounts['anytime'] !== undefined ? `(${dateRangeCounts['anytime']})` : ''}
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
            {isActive && (
                <button
                    onClick={() => handlePresetChange('anytime')}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                    aria-label="Clear date filter"
                >
                    ×
                </button>
            )}
        </div>
    );
}
