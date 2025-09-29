'use client'

import Link from "next/link";
import { useState } from 'react';

export default function MobileHeader({ onSidebarToggle, sidebarOpen }) {
  return (
    <header className="lg:hidden flex flex-row justify-between items-center p-4 bg-white sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <img 
          src="/art-board-logo.png" 
          alt="Art Board"     
          className="h-10"                       
        />
      </Link>
      
      {/* Sidebar Toggle Button */}
      <button
        onClick={onSidebarToggle}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-label="Toggle sidebar"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </header>
  );
}
