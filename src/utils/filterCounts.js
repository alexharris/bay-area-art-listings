import { getFilteredListings } from './filters.js';

/**
 * Calculate how many listings would match if a specific filter option was selected
 * @param {Object} currentFilters - Current filter state
 * @param {Array} listings - All listings
 * @param {string} filterType - Type of filter ('calendarType', 'county', 'dateRange')
 * @param {*} filterValue - The specific value to test
 * @returns {number} Count of matching listings
 */
export function calculateFilterCount(currentFilters, listings, filterType, filterValue) {
  // Create a copy of current filters
  const testFilters = { ...currentFilters };
  
  // Modify the specific filter we're testing
  switch (filterType) {
    case 'calendarType':
      testFilters.calendarTypeFilter = filterValue;
      break;
    case 'county':
      testFilters.selectedCounty = filterValue;
      break;
    case 'dateRange':
      testFilters.calendarDateRangeFilter = filterValue;
      testFilters.calendarDateRangePreset = 'custom';
      break;
    default:
      return 0;
  }
  
  // Get filtered results with the test filter
  const filteredResults = getFilteredListings(testFilters, listings);
  return filteredResults.length;
}

/**
 * Get counts for all calendar type filter options
 * @param {Object} currentFilters - Current filter state
 * @param {Array} listings - All listings
 * @returns {Object} Object with counts for each calendar type option
 */
export function getCalendarTypeCounts(currentFilters, listings) {
  return {
    onview: calculateFilterCount(currentFilters, listings, 'calendarType', 'onview'),
    opening: calculateFilterCount(currentFilters, listings, 'calendarType', 'opening'),
    closing: calculateFilterCount(currentFilters, listings, 'calendarType', 'closing'),
    hasOpenings: calculateFilterCount(currentFilters, listings, 'calendarType', 'hasOpenings')
  };
}

/**
 * Get counts for all county filter options
 * @param {Object} currentFilters - Current filter state
 * @param {Array} listings - All listings
 * @returns {Object} Object with counts for each county option
 */
export function getCountyCounts(currentFilters, listings) {
  const counties = [
    'All',
    'Alameda',
    'Contra Costa',
    'Marin',
    'Napa',
    'Sacramento',
    'San Francisco',
    'San Mateo',
    'Santa Clara',
    'Solano',
    'Sonoma'
  ];

  const counts = {};

  counties.forEach(county => {
    counts[county] = calculateFilterCount(currentFilters, listings, 'county', county === 'All' ? [] : [county]);
  });

  return counts;
}

/**
 * Get counts for all date range preset options
 * @param {Object} currentFilters - Current filter state
 * @param {Array} listings - All listings
 * @param {Object} dateRanges - Object containing pre-calculated date ranges
 * @returns {Object} Object with counts for each date range option
 */
export function getDateRangeCounts(currentFilters, listings, dateRanges) {
  const {
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfNextMonth,
    endOfNextMonth
  } = dateRanges;

  // Create date range objects for each preset
  const todayFrom = new Date();
  todayFrom.setHours(0, 0, 0, 0);
  const todayTo = new Date();
  todayTo.setHours(23, 59, 59, 999);

  const weekFrom = new Date();
  weekFrom.setHours(0, 0, 0, 0);
  const weekTo = new Date(weekFrom);
  weekTo.setDate(weekTo.getDate() + 7);
  weekTo.setHours(23, 59, 59, 999);

  const monthFrom = new Date(startOfMonth);
  monthFrom.setHours(0, 0, 0, 0);
  const monthTo = new Date(endOfMonth);
  monthTo.setHours(23, 59, 59, 999);

  const nextMonthFrom = new Date(startOfNextMonth);
  nextMonthFrom.setHours(0, 0, 0, 0);
  const nextMonthTo = new Date(endOfNextMonth);
  nextMonthTo.setHours(23, 59, 59, 999);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 10);
  futureDate.setHours(23, 59, 59, 999);

  return {
    today: calculateFilterCount(currentFilters, listings, 'dateRange', { from: todayFrom, to: todayTo }),
    next7: calculateFilterCount(currentFilters, listings, 'dateRange', { from: weekFrom, to: weekTo }),
    thismonth: calculateFilterCount(currentFilters, listings, 'dateRange', { from: monthFrom, to: monthTo }),
    nextmonth: calculateFilterCount(currentFilters, listings, 'dateRange', { from: nextMonthFrom, to: nextMonthTo }),
    anytime: calculateFilterCount(currentFilters, listings, 'dateRange', { from: now, to: futureDate })
  };
}
