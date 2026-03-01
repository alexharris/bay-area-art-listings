'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CalendarTypeSelector({ calendarTypeFilter, setCalendarTypeFilter, calendarTypeCounts }) {
    return (
        <div className="pb-0 flex flex-row items-center">
            <label className="pr-2 w-20 text-sm">What</label>
            <Select value={calendarTypeFilter} onValueChange={setCalendarTypeFilter}>
                <SelectTrigger className="flex-grow">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="onview">
                        All exhibitions {calendarTypeFilter !== 'onview' && calendarTypeCounts['onview'] !== undefined ? `(${calendarTypeCounts['onview']})` : ''}
                    </SelectItem>
                    <SelectItem value="opening">
                        Upcoming exhibitions {calendarTypeFilter !== 'opening' && calendarTypeCounts['opening'] !== undefined ? `(${calendarTypeCounts['opening']})` : ''}
                    </SelectItem>
                    <SelectItem value="hasOpenings">
                        <span className="inline-flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                            Openings {calendarTypeFilter !== 'hasOpenings' && calendarTypeCounts['hasOpenings'] !== undefined ? `(${calendarTypeCounts['hasOpenings']})` : ''}
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
