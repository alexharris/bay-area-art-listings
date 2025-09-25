'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SortSelector({ onSortChange, currentSort }) {
    const sortOptions = [
        { value: 'openingSoon', label: 'Start Date' },
        { value: 'closingSoon', label: 'End Date' },
        { value: 'alphabetical', label: 'Alphabetical' },
    ];

    return (
        <div className="flex flex-rows items-center relative">
            <label className="w-20 text-sm pr-2">Sort by</label>
            <Select value={currentSort} onValueChange={onSortChange}>
                <SelectTrigger className="flex-grow">
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
