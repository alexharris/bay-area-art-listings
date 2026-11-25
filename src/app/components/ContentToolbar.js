'use client'

import SortSelector from './sidebar/sortSelector';
import SearchInput from './SearchInput';

export default function ContentToolbar({ sortMethod, setSortMethod, activeView, isMapView, setIsMapView, searchClearKey, onSearch, onClear }) {
    return (
        <div className="hidden lg:flex sticky top-0 z-40 bg-white border-b border-gray-200 px-3 py-2 flex-row items-center justify-start gap-3">
            <div className="flex items-stretch flex-shrink-0 border border-gray-300 rounded-lg overflow-hidden text-sm">
                <button
                    onClick={() => setIsMapView(false)}
                    aria-pressed={!isMapView}
                    className={`px-3 py-1.5 border-r border-gray-300 transition-colors ${!isMapView ? 'font-medium text-black bg-yellow-50' : 'text-black'}`}
                >
                    List
                </button>
                <button
                    onClick={() => setIsMapView(true)}
                    aria-pressed={isMapView}
                    className={`px-3 py-1.5 transition-colors ${isMapView ? 'font-medium text-black bg-yellow-50' : 'text-black'}`}
                >
                    Map
                </button>
            </div>
            <SearchInput key={searchClearKey} onSearch={onSearch} onClear={onClear} />
            <div className="flex items-center gap-3 flex-shrink-0">
                {activeView === 'exhibitions' && !isMapView && (
                    <div className="max-w-[200px] text-xs">
                        <SortSelector
                            onSortChange={setSortMethod}
                            currentSort={sortMethod}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
