// Things Needed to Determine Filters
// Search term
// -----------------------
// A string entered into the search bar
// Variable name: searchTerm
// -----------------------
// Selected Location
// ---
// A string selected from the location dropdown
// Variable name: selectedLocation
// -----------------------
// Selected County
// ---
// An array of objects with a name and zipcodes property
// Variable name: selectedCounty
// -----------------------
// Highlights Only
// ---
// A boolean value
// Variable name: highlightsOnly
// -----------------------
// Calendar Type Filter
// ---
// A string selected from the calendar type dropdown
// Variable name: calendarTypeFilter
// -----------------------
// Calendar Date Range Filter
// ---
// An object with from and to properties
// Variable name: calendarDateRangeFilter
// -----------------------
// Filter Object
// ---
// The filter object looks like this:
// const filters = {
//   highlightsOnly: highlightsOnly,
//   searchTerm: searchTerm,
//   selectedLocation: selectedLocation,
//   selectedCounty: selectedCounty,
//   calendarTypeFilter: calendarTypeFilter,
//   calendarDateRangeFilter: calendarDateRangeFilter,
// };



// Date Variables
const today = new Date();
const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);    

export function getListingsForThisWeek(filters, listings) {

  let filteredListings = listings
  .filter(item => filters.highlightsOnly ? item.Highlight : true) //Highlights Only
  .filter(item => filters.selectedLocation ? item.locationName === filters.selectedLocation : true) // Selected Location
  .filter(item => item.Event.toLowerCase().includes(filters.searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(filters.searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(filters.searchTerm.toLowerCase())) // Search Term
  .filter(item => filters.selectedCounty[0] ? filters.selectedCounty[0].zipcodes.some(zipcode => item.locationAddress.includes(zipcode)) : true) // Selected County
  .filter(item => {
      const startDate = new Date(item.StartDate);
      const endDate = new Date(item.EndDate);
      if (filters.calendarTypeFilter === 'onview') {
          return (startDate <= filters.calendarDateRangeFilter.to && endDate >= filters.calendarDateRangeFilter.from);
      } else if (filters.calendarTypeFilter === 'opening') {
          return startDate >= filters.calendarDateRangeFilter.from && startDate <= filters.calendarDateRangeFilter.to;
      } else if (filters.calendarTypeFilter === 'closing') {
          return endDate >= filters.calendarDateRangeFilter.from && endDate <= filters.calendarDateRangeFilter.to;
      }
      return true;
  });

  return filteredListings;
}