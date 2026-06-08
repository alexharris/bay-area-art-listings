'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SortSelector({ onSortChange, currentSort }) {
    const sortOptions = [
        { value: 'openingSoon', label: 'Start Date' },
        { value: 'closingSoon', label: 'Ending Soon' },
        { value: 'alphabetical', label: 'Alphabetical' },
        { value: 'recentlyAdded', label: 'Recently Added' },
        { value: 'oldestAdded', label: 'Oldest Added' },
    ];

    return (
        <div className="flex flex-rows items-center relative w-full">
            <label className="shrink-0 text-sm pr-2">Sort by</label>
            <Select value={currentSort} onValueChange={onSortChange}>
                <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
