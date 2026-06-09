/**
 * Sorts an array of listings chronologically by StartDate
 * @param {Array} listings - Array of listing objects
 * @param {string} direction - 'asc' for ascending (default) or 'desc' for descending
 * @returns {Array} - Sorted array of listings
 */
export function sortListingsChronologically(listings, direction = 'asc') {
  if (!listings || !Array.isArray(listings) || listings.length === 0) {
    return [];
  }

  const sortedListings = [...listings].sort((a, b) => {
    // Convert StartDate strings to Date objects
    const dateA = new Date(a.StartDate);
    const dateB = new Date(b.StartDate);
    
    // Handle invalid dates
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return 0;
    }
    
    // Sort by the date
    const dateCompare = direction === 'desc' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
    
    // If dates are the same, sort by venue name alphabetically
    return dateCompare !== 0 ? dateCompare : a.locationName.localeCompare(b.locationName);
  });

  return sortedListings;
}

/**
 * Sorts an array of listings by upcoming events (current date and future first)
 * @param {Array} listings - Array of listing objects
 * @returns {Array} - Sorted array with upcoming events first, followed by past events
 */
export function sortListingsByUpcoming(listings) {
  if (!listings || !Array.isArray(listings) || listings.length === 0) {
    return [];
  }

  const now = new Date();
  
  // Separate upcoming and past events
  const upcoming = [];
  const past = [];
  
  listings.forEach(listing => {
    const startDate = new Date(listing.StartDate);
    const endDate = new Date(listing.EndDate || listing.StartDate);
    
    // If the end date is in the future, it's an upcoming event
    if (endDate >= now) {
      upcoming.push(listing);
    } else {
      past.push(listing);
    }
  });
  
  // Sort upcoming events by start date (ascending)
  upcoming.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
  
  // Sort past events by start date (descending)
  past.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));
  
  // Return upcoming events first, followed by past events
  return [...upcoming, ...past];
}

/**
 * Applies different sorting methods to an array of listings
 * @param {Array} listings - Array of listing objects
 * @param {string} method - Sorting method: 'alphabetical', 'chronological', 'openingSoon', 'closingSoon'
 * @returns {Array} - Sorted array of listings
 */
export function applySorting(listings, method) {
  let sortedListings = [...listings];
    
  switch (method) {
        case 'openingSoon':
            sortedListings.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));
            break;
        case 'closingSoon':
            sortedListings.sort((a, b) => new Date(a.EndDate) - new Date(b.EndDate));
            break;
        case 'alphabetical':
            sortedListings.sort((a, b) => a.Event.localeCompare(b.Event));
            break;
        case 'recentlyAdded':
            sortedListings.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));
            break;
        case 'oldestAdded':
            sortedListings.sort((a, b) => new Date(a._createdAt) - new Date(b._createdAt));
            break;
        default:
            // Default to closingSoon if no sort method specified
            sortedListings.sort((a, b) => new Date(a.EndDate) - new Date(b.EndDate));
    }
    
    return sortedListings;
}
