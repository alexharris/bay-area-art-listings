'use client'

import SortSelector from './sidebar/sortSelector';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";

export default function ContentToolbar({ sortMethod, setSortMethod, isMapView, setIsMapView, searchTerm, setSearchTerm }) {
    return (
        <div className="sticky top-[49px] lg:top-0 z-40 bg-white border-b border-gray-200 px-3 py-2 flex flex-row items-center justify-between gap-3">
            <div className="flex flex-row items-center gap-2 flex-1 max-w-xs">
                <label htmlFor="searchTerm" className="shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </label>
                <Input
                    type="text"
                    id="searchTerm"
                    className="h-8 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search exhibitions..."
                />
            </div>
            <div className="flex flex-row items-center gap-3">
            {!isMapView && (
                <div className="max-w-[200px] text-xs">
                    <SortSelector
                        onSortChange={setSortMethod}
                        currentSort={sortMethod}
                    />
                </div>
            )}
            <ToggleGroup
                type="single"
                value={isMapView ? "map" : "list"}
                onValueChange={(value) => {
                    if (value) {
                        setIsMapView(value === "map");
                    }
                }}
                size="sm"
                variant="outline"
            >
                <ToggleGroupItem value="list" aria-label="List view" className="h-8 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    List
                </ToggleGroupItem>
                <ToggleGroupItem value="map" aria-label="Map view" className="h-8 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                    Map
                </ToggleGroupItem>
            </ToggleGroup>
            </div>
        </div>
    );
}
