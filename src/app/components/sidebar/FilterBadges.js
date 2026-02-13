'use client'

import { Badge } from "@/components/ui/badge";

export default function FilterBadges({
    onViewToday,
    setOnViewToday,
    endingSoonOnly,
    setEndingSoonOnly,
    openingTodayOnly,
    setOpeningTodayOnly,
    specialFilterCounts = { onViewToday: 0, endingSoonOnly: 0, openingTodayOnly: 0 }
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Filters</label>
            <div className="flex flex-wrap gap-2">
                <Badge
                    className={`cursor-pointer transition-colors ${
                        onViewToday
                            ? 'bg-green-300 hover:bg-green-400 text-black'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    onClick={() => setOnViewToday(!onViewToday)}
                >
                    On View Today <span className="ml-1 opacity-60">({specialFilterCounts.onViewToday})</span>
                </Badge>
                <Badge
                    className={`cursor-pointer transition-colors ${
                        openingTodayOnly
                            ? 'bg-orange-200 hover:bg-orange-300 text-black'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    onClick={() => setOpeningTodayOnly(!openingTodayOnly)}
                >
                    Starting Today <span className="ml-1 opacity-60">({specialFilterCounts.openingTodayOnly})</span>
                </Badge>
                <Badge
                    className={`cursor-pointer transition-colors ${
                        endingSoonOnly
                            ? 'bg-red-300 hover:bg-red-400 text-black'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    onClick={() => setEndingSoonOnly(!endingSoonOnly)}
                >
                    Ending Soon <span className="ml-1 opacity-60">({specialFilterCounts.endingSoonOnly})</span>
                </Badge>
            </div>
        </div>
    );
}
