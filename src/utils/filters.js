// Things Needed to Determine Filters
// =================
// Search term
// -
// A string entered into the search bar
// Variable name: searchTerm
// =================
// Selected Location
// -
// A string selected from the location dropdown
// Variable name: selectedLocation
// =================
// Selected County
// -
// An array of objects with a name and zipcodes property
// Variable name: selectedCounty
// =================
// Highlights Only
// -
// A boolean value
// Variable name: highlightsOnly
// =================
// Calendar Type Filter
// -
// A string selected from the calendar type dropdown
// Variable name: calendarTypeFilter
// =================
// Calendar Date Range Filter
// -
// An object with from and to properties
// Variable name: calendarDateRangeFilter
// =================
// Filter Object
// -
// The filter object looks like this:
// const filters = {
//   highlightsOnly: highlightsOnly,
//   searchTerm: searchTerm,
//   selectedLocation: selectedLocation,
//   selectedCounty: selectedCounty,
//   calendarTypeFilter: calendarTypeFilter,
//   calendarDateRangeFilter: calendarDateRangeFilter,
// };

import { extractPortableTextContent } from './helpers.js';
import { haversineDistance } from './distance.js';



// Date Variables
const today = new Date();
const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);
const endOfWeek = nextWeek.toISOString().split('T')[0];
// const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0); 


// Function to determine if a show is on view today AND venue is open today
// This now just checks the pre-computed isOnViewToday flag
function determineOnViewTodayFilter(item) {
    return item.isOnViewToday === true;
}

// Function to determine if event is ending soon (within 7 days)
function determineEndingSoonFilter(item) {
    const getTodayInLA = () => {
        const now = new Date();
        return now.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    };

    const getEventDateInLA = (dateString) => {
        let date;
        if (typeof dateString === 'string') {
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                date = new Date(dateString + 'T12:00:00');
            } else {
                date = new Date(dateString);
            }
        } else {
            date = new Date(dateString);
        }
        return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    };

    const todayLA = getTodayInLA();
    const eventEndDateLA = getEventDateInLA(item.EndDate);

    const today = new Date(todayLA + "T00:00:00");
    const endDateObj = new Date(eventEndDateLA + "T00:00:00");
    const diffTime = endDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
}

// Function to determine if event is opening today
function determineOpeningTodayFilter(item) {
    const getTodayInLA = () => {
        const now = new Date();
        return now.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    };

    const getEventDateInLA = (dateString) => {
        let date;
        if (typeof dateString === 'string') {
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                date = new Date(dateString + 'T12:00:00');
            } else {
                date = new Date(dateString);
            }
        } else {
            date = new Date(dateString);
        }
        return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    };

    const todayLA = getTodayInLA();
    const eventStartDateLA = getEventDateInLA(item.StartDate);
    
    return eventStartDateLA === todayLA;
}

export function getFilteredListings(filters, listings) {
  
  // Set default filter values
  filters = {
    highlightsOnly: filters.highlightsOnly || false,
    onViewToday: filters.onViewToday || false,
    sfArtWeekOnly: filters.sfArtWeekOnly || false,
    endingSoonOnly: filters.endingSoonOnly || false,
    openingTodayOnly: filters.openingTodayOnly || false,
    openingTitleOnly: filters.openingTitleOnly || false,
    searchTerm: filters.searchTerm || '',
    selectedLocation: filters.selectedLocation || '',
    selectedCounty: filters.selectedCounty || [],
    calendarTypeFilter: filters.calendarTypeFilter || '',
    calendarDateRangeFilter: filters.calendarDateRangeFilter || { from: startOfWeek, to: endOfWeek },
    userLocation: filters.userLocation || null,
    nearbyRadius: filters.nearbyRadius ?? 10,
  };

  let filteredListings = listings
  .filter(item =>filters.onViewToday ? determineOnViewTodayFilter(item) : true)
  .filter(item =>filters.sfArtWeekOnly ? item.sfawUrl : true)
  .filter(item =>filters.endingSoonOnly ? determineEndingSoonFilter(item) : true)
  .filter(item =>filters.openingTodayOnly ? determineOpeningTodayFilter(item) : true)
  .filter(item => {
    if (!filters.openingTitleOnly) return true;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    return item.openings?.some(o => o.title?.toLowerCase().includes('opening') && o.date >= today);
  })
  .filter(item => filters.selectedLocation ? item.locationName === filters.selectedLocation : true) // Selected Location
  .filter(item => 
    item.Event.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
    item.locationName.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
    (item.locationAddress ? item.locationAddress.toLowerCase().includes(filters.searchTerm.toLowerCase()) : false) || 
    extractPortableTextContent(item.Notes).toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
    (item.locationUrl ? item.locationUrl.toLowerCase().includes(filters.searchTerm.toLowerCase()) : false)
  )
  .filter(item => filters.selectedCounty.length > 0 ? filters.selectedCounty.some(countyObj => countyObj.zipcodes.some(zipcode => item.locationAddress && item.locationAddress.includes(zipcode))) : true) // Selected County
  .filter(item => {
    if (!filters.userLocation || !item.locationGeolocation) return true;
    const dist = haversineDistance(
      filters.userLocation.lat, filters.userLocation.lng,
      item.locationGeolocation.lat, item.locationGeolocation.lng
    );
    return dist <= filters.nearbyRadius;
  })
  .filter(item => {
      const startDate = new Date(item.StartDate + 'T00:00:00');
      const endDate = new Date(item.EndDate + 'T23:59:59Z');
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      if (filters.calendarTypeFilter === 'onview') {
        return (startDate <= filters.calendarDateRangeFilter.to && endDate >= filters.calendarDateRangeFilter.from);
      } else if (filters.calendarTypeFilter === 'opening') {
        return startDate >= todayStart && startDate <= filters.calendarDateRangeFilter.to;
      } else if (filters.calendarTypeFilter === 'closing') {
        return endDate >= filters.calendarDateRangeFilter.from && endDate <= filters.calendarDateRangeFilter.to;
      } else if (filters.calendarTypeFilter === 'hasOpenings') {
        if (!item.openings || item.openings.length === 0) return false;
        return item.openings.some(opening => {
          const openingDate = new Date(opening.date + 'T00:00:00');
          return openingDate >= todayStart;
        });
      }
      return true;
  });

  return filteredListings;
}