'use client'

import SortSelector from './sidebar/sortSelector';
import SearchInput from './SearchInput';

export default function ContentToolbar({ sortMethod, setSortMethod, activeView, searchClearKey, onSearch, onClear }) {
    return (
        <div className="hidden lg:flex sticky top-0 z-40 bg-white border-b border-gray-200 px-3 py-2 flex-row items-center justify-between gap-3">
            <SearchInput key={searchClearKey} onSearch={onSearch} onClear={onClear} />
            {activeView === 'exhibitions' && (
                <div className="max-w-[200px] text-xs">
                    <SortSelector
                        onSortChange={setSortMethod}
                        currentSort={sortMethod}
                    />
                </div>
            )}
        </div>
    );
}
