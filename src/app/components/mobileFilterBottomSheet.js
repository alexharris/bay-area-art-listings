'use client'

import { useEffect, useRef, useState } from 'react';
import CountySelector from './countySelector';

export default function MobileFilterBottomSheet({ 
  isOpen, 
  onClose, 
  calendarTypeFilter,
  setCalendarTypeFilter,
  calendarDateRangeFilter,
  setCalendarDateRangeFilter,
  calendarDateRangePreset,
  setCalendarDateRangePreset,
  highlightsOnly,
  setHighlightsOnly,
  openHoursOnly,
  setOpenHoursOnly,
  searchTerm,
  setSearchTerm,
  showAdvancedFilters,
  setShowAdvancedFilters,
  showCustomCalendar,
  setShowCustomCalendar,
  selectedCounty,
  setSelectedCounty,
  displayedResults,
  setShowMenu
}) {
  const bottomSheetRef = useRef(null);
  const [animationState, setAnimationState] = useState("closed");
  
  // Animation state management
  useEffect(() => {
    if (isOpen) {
      setAnimationState("opening");
      const timer = setTimeout(() => setAnimationState("open"), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationState("closing");
      const timer = setTimeout(() => setAnimationState("closed"), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (bottomSheetRef.current && !bottomSheetRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Clear all filters
  const clearAllFilters = () => {
    setCalendarTypeFilter('opening');
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setCalendarDateRangeFilter({ from: startOfMonth, to: endOfMonth });
    setCalendarDateRangePreset('thismonth');
    setHighlightsOnly(false);
    setOpenHoursOnly(false);
    setSearchTerm('');
    setSelectedCounty({});
  };

  if (animationState === "closed") return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          animationState === "open" ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Bottom Sheet */}
        <div 
          ref={bottomSheetRef}
          className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-xl overflow-hidden transform transition-transform duration-300 ease-in-out"
          style={{
            maxHeight: '90vh',
            transform: animationState === "open" ? 'translateY(0)' : 'translateY(100%)',
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          aria-modal="true"
          role="dialog"
        >
          {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex flex-row items-center gap-2"><span>Filter</span> <span className="text-gray-400 text-sm mt-.5">{displayedResults}</span></h2>
          <div className="flex items-center space-x-6">
            <button 
              onClick={clearAllFilters}
              className="text-blue-600"
            >
              Clear All
            </button>
            <button 
              onClick={onClose}
              className="text-gray-700 p-1"
              aria-label="Close filter panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto px-4 pt-2 pb-20" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="space-y-4">
            {/* Search */}
            <div className="mb-4">
              <label htmlFor="mobile-search" className="font-medium text-gray-700 block mb-1">Search</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  id="mobile-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-black rounded-md focus:outline-none focus:ring-1 focus:border-blue-500"
                  placeholder="Search listings..."
                />
              </div>
            </div>

            
            {/* Time Range Options */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Time Range</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const todayFrom = new Date();
                    todayFrom.setHours(0, 0, 0, 0);
                    const todayTo = new Date();
                    todayTo.setHours(23, 59, 59, 999);
                    setCalendarDateRangeFilter({ from: todayFrom, to: todayTo });
                    setCalendarDateRangePreset('today');
                  }}
                  className={`block w-full text-left py-2 px-3 rounded-md ${calendarDateRangePreset === 'today' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(today);
                    endOfWeek.setDate(today.getDate() - today.getDay() + 6);
                    
                    setCalendarDateRangeFilter({ from: startOfWeek, to: endOfWeek });
                    setCalendarDateRangePreset('thisweek');
                  }}
                  className={`block w-full text-left py-2 px-3 rounded-md ${calendarDateRangePreset === 'thisweek' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  This Week
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    
                    setCalendarDateRangeFilter({ from: startOfMonth, to: endOfMonth });
                    setCalendarDateRangePreset('thismonth');
                  }}
                  className={`block w-full text-left py-2 px-3 rounded-md ${calendarDateRangePreset === 'thismonth' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  This Month
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
                    
                    setCalendarDateRangeFilter({ from: startOfNextMonth, to: endOfNextMonth });
                    setCalendarDateRangePreset('nextmonth');
                  }}
                  className={`block w-full text-left py-2 px-3 rounded-md ${calendarDateRangePreset === 'nextmonth' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  Next Month
                </button>
              </div>
            </div>

            {/* County Selector */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Location</h3>
              <div className="border border-black rounded-md overflow-hidden">
                <CountySelector onCountyChange={setSelectedCounty} />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Additional Filters</h3>
              <div className="space-y-3">
                {/* <div className="flex items-center py-2 border-b border-gray-100">
                  <input
                    id="mobile-highlights"
                    type="checkbox"
                    checked={highlightsOnly}
                    onChange={() => setHighlightsOnly(!highlightsOnly)}
                    className="w-5 h-5 border border-black text-black focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="mobile-highlights" className="ml-3 text-gray-800">
                    Highlights Only
                  </label>
                </div> */}
                
                <div className="flex items-center py-2">
                  <input
                    id="mobile-open-hours"
                    type="checkbox"
                    checked={openHoursOnly}
                    onChange={() => setOpenHoursOnly(!openHoursOnly)}
                    className="w-5 h-5 border border-black text-black focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="mobile-open-hours" className="ml-3 text-gray-800">
                    Hide Closed Today
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with Apply button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={() => {
              onClose();
              setShowMenu(false);
            }}
            className="w-full py-3 bg-black text-white font-medium rounded-md hover:bg-gray-900 transition-colors duration-200"
          >
            View {displayedResults} Results
          </button>
        </div>
      </div>
    </>
  );
}