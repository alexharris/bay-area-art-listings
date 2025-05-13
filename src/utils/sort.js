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
    return direction === 'desc' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
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
