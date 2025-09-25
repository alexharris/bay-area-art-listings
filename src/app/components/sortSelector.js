'use client'

import { useState } from 'react';

export default function SortSelector({ onSortChange, currentSort }) {
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions = [
        { value: 'openingSoon', label: 'Start Date' },
        { value: 'closingSoon', label: 'End Date' },
        { value: 'alphabetical', label: 'Alphabetical' },
    ];

    const handleSortSelect = (sortValue) => {
        onSortChange(sortValue);
        setIsOpen(false);
    };

    const getCurrentSortLabel = () => {
        const option = sortOptions.find(opt => opt.value === currentSort);
        return option ? option.label : 'Sort by';
    };

    return (
        <div className="my-1">
            <div className="flex items-center gap-2">
                Sort by 
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex  items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 justify-between"
                >
                    <span>{getCurrentSortLabel()}</span>
                    <svg 
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>

            {isOpen && (
                <>
                    {/* Backdrop to close dropdown when clicking outside */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                    
                    {/* Dropdown menu */}
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg z-20">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortSelect(option.value)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t last:rounded-b ${
                                    currentSort === option.value ? 'bg-gray-100 font-medium' : ''
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
