'use client'

import Link from "next/link";
import { Search } from "lucide-react";

export default function MobileHeader({ onSearchOpen }) {
  return (
    <header className="lg:hidden flex flex-row justify-between items-center px-3 h-12 bg-white fixed inset-x-0 top-0 z-50 border-b border-gray-200">
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
        className=""
        aria-label="Search"
      >
        <Search size={20} />
      </button>
    </header>
  );
}
