'use client'

import SortSelector from './sidebar/sortSelector';
import SearchInput from './SearchInput';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ContentToolbar({ sortMethod, setSortMethod, activeView, setActiveView, searchClearKey, onSearch }) {
    return (
        <div className="hidden lg:flex sticky top-0 z-40 bg-white border-b border-gray-200 px-3 py-2 flex-row items-center justify-between gap-3">
            <SearchInput key={searchClearKey} onSearch={onSearch} />
            <div className="flex flex-row items-center gap-3">
            {activeView === 'exhibitions' && (
                <div className="max-w-[200px] text-xs">
                    <SortSelector
                        onSortChange={setSortMethod}
                        currentSort={sortMethod}
                    />
                </div>
            )}
            <ToggleGroup
                type="single"
                value={activeView === 'map' ? 'map' : activeView === 'events' ? 'events' : 'list'}
                onValueChange={(value) => {
                    if (value === 'map') setActiveView('map');
                    else if (value === 'events') setActiveView('events');
                    else if (value === 'list') setActiveView('exhibitions');
                }}
                size="sm"
                variant="outline"
            >
                <ToggleGroupItem value="list" aria-label="List view" className="h-8 text-xs">
                    Exhibitions
                </ToggleGroupItem>
                <ToggleGroupItem value="events" aria-label="Events view" className="h-8 text-xs">
                    Events
                </ToggleGroupItem>
                <ToggleGroupItem value="map" aria-label="Map view" className="h-8 text-xs">
                    Map
                </ToggleGroupItem>
            </ToggleGroup>
            </div>
        </div>
    );
}
