'use client'

import { useState } from 'react';
import { Input } from "@/components/ui/input";

export default function SearchInput({ onSearch, inputRef }) {
    const [value, setValue] = useState('');

    return (
        <form
            className="relative flex items-center gap-2 flex-1 max-w-xs"
            onSubmit={(e) => { e.preventDefault(); onSearch?.(value); }}
        >
            <label htmlFor="searchTerm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </label>
            <Input
                type="text"
                id="searchTerm"
                className="h-8 text-sm rounded-full border-gray-200 pl-8 pr-4"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search exhibitions..."
                ref={inputRef}
            />
            <button
                type="submit"
                className="h-8 px-3 text-sm rounded-full bg-gray-900 text-white hover:bg-gray-700 flex-shrink-0"
            >
                Search
            </button>
        </form>
    );
}
