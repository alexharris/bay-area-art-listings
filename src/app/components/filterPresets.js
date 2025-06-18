import React from 'react';

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
    endOfNextMonth
}) {
    return (
        <div className="cursor-pointer">
            <div onClick={() => { 
                setShowCustomCalendar(false); 
                const todayFrom = new Date();
                todayFrom.setHours(0, 0, 0, 0);
                const todayTo = new Date();
                todayTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: todayFrom, to: todayTo }); 
                setCalendarDateRangePreset('today'); 
            }} className={calendarDateRangePreset === 'today' ? 'font-bold' : ''}>Today</div>
            <div onClick={() => { 
                setShowCustomCalendar(false); 
                const weekFrom = new Date(startOfWeek);
                weekFrom.setHours(0, 0, 0, 0);
                const weekTo = new Date(endOfWeek);
                weekTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: weekFrom, to: weekTo }); 
                setCalendarDateRangePreset('thisweek'); 
            }} className={calendarDateRangePreset === 'thisweek' ? 'font-bold' : ''}>This Week</div>
            <div onClick={() => { 
                setShowCustomCalendar(false); 
                const monthFrom = new Date(startOfMonth);
                monthFrom.setHours(0, 0, 0, 0);
                const monthTo = new Date(endOfMonth);
                monthTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: monthFrom, to: monthTo }); 
                setCalendarDateRangePreset('thismonth'); 
            }} className={calendarDateRangePreset === 'thismonth' ? 'font-bold' : ''}>This Month</div>
            <div onClick={() => { 
                setShowCustomCalendar(false); 
                const nextMonthFrom = new Date(startOfNextMonth);
                nextMonthFrom.setHours(0, 0, 0, 0);
                const nextMonthTo = new Date(endOfNextMonth);
                nextMonthTo.setHours(23, 59, 59, 999);
                setCalendarDateRangeFilter({ from: nextMonthFrom, to: nextMonthTo }); 
                setCalendarDateRangePreset('nextmonth'); 
            }} className={calendarDateRangePreset === 'nextmonth' ? 'font-bold' : ''}>Next Month</div>                                
            <div onClick={() => {
                setShowCustomCalendar(true); 
                setCalendarDateRangePreset('custom');
            }} className={calendarDateRangePreset === 'custom' ? 'font-bold' : ''}>Custom</div>
        </div>
    );
}
