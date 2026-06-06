'use client'

import { useState } from 'react';
import Link from "next/link";
import { X } from "lucide-react";

export default function MobileHeader({ onSearch, onClear }) {
  const [value, setValue] = useState('');

  return (
    <header className="lg:hidden flex flex-row items-center gap-2 px-3 h-12 bg-white fixed inset-x-0 top-0 z-50 border-b border-gray-300">
      <Link href="/" className="flex-shrink-0">
        <img
          src="/art-board-logo.png"
          alt="Art Board"
          className="h-8"
        />
      </Link>

      <form
        className="flex-1 flex items-center gap-2"
        onSubmit={(e) => { e.preventDefault(); onSearch?.(value); }}
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            type="text"
            className="w-full text-[16px] bg-white border border-gray-400 rounded-full pl-8 pr-7 py-1 outline-none focus:border-gray-600 placeholder:text-gray-500"
            placeholder="Search..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
        </div>
        <button
          type="submit"
          className="flex-shrink-0 h-8 px-3 text-sm rounded-full bg-gray-900 text-white hover:bg-gray-700"
        >
          Search
        </button>
      </form>
    </header>
  );
}
