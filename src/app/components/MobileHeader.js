'use client'

import Link from "next/link";
import { Search } from "lucide-react";

export default function MobileHeader({ onSearchOpen }) {
  return (
    <header className="lg:hidden flex flex-row justify-between items-center p-3 bg-white sticky top-0 z-50 border-b border-gray-200">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <img
          src="/art-board-logo.png"
          alt="Art Board"
          className="h-8"
        />
      </Link>

      {/* Search icon */}
      <button
        onClick={onSearchOpen}
        className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200"
        aria-label="Search"
      >
        <Search size={20} />
      </button>
    </header>
  );
}
