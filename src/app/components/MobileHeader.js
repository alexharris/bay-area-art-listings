'use client'

import Link from "next/link";

export default function MobileHeader({ onSidebarToggle }) {
  return (
    <header className="lg:hidden flex flex-row justify-between items-center p-3 bg-white sticky top-0 z-50 border-b border-gray-200">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <img 
          src="/art-board-logo.png" 
          alt="Art Board"     
          className="h-12"                       
        />
      </Link>
      
      {/* Sidebar Toggle Button */}
      <button
        onClick={onSidebarToggle}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sidebar"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      </button>
    </header>
  );
}
