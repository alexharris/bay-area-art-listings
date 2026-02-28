'use client'

import { Input } from "@/components/ui/input";

export default function SearchInput({ searchTerm, setSearchTerm, inputRef }) {
    return (
        <div className="flex flex-row items-center gap-2 flex-1 max-w-xs">
            <label htmlFor="searchTerm" className="shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </label>
            <Input
                type="text"
                id="searchTerm"
                className="h-8 text-[16px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exhibitions..."
                ref={inputRef}
            />
        </div>
    );
}
