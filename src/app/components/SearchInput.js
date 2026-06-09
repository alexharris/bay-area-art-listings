'use client'

import { useState } from 'react';
import { X } from "lucide-react";

export default function SearchInput({ onSearch, onClear, inputRef }) {
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.(value);
    };

    return (
        <form className="relative flex items-center flex-1 max-w-xs" onSubmit={handleSubmit}>
            <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Search"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <input
                type="text"
                id="searchTerm"
                className="h-8 w-full text-sm rounded-full border border-gray-300 bg-white pl-8 pr-7 outline-none focus:border-gray-500 placeholder:text-gray-400"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search exhibitions..."
                ref={inputRef}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => { setValue(''); onClear?.(); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                >
                    <X size={13} />
                </button>
            )}
        </form>
    );
}
