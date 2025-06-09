export default function header({ toggleMenu, isMapView, displayedResults, toggleMapView }) {
  // Get the displayedResults value from props
  const resultsCount = displayedResults;
  
  // Function to update URL without page reload
  const updateUrlWithoutReload = (isMap) => {
    // Update URL to reflect the change without reloading the page
    const params = new URLSearchParams(window.location.search);
    
    if (isMap) {
      params.set('view', 'map');
    } else {
      params.delete('view');
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    // Use pushState to update the URL without reloading
    window.history.pushState({}, '', newUrl);
    
    // Add event listener for popstate if not already added
    if (typeof window !== 'undefined' && !window._popstateListenerAdded) {
      window.addEventListener('popstate', () => {
        // When the user navigates with browser buttons, update the UI accordingly
        const params = new URLSearchParams(window.location.search);
        const isMapFromUrl = params.get('view') === 'map';
        if (isMapFromUrl !== isMapView) {
          toggleMapView();
        }
      });
      window._popstateListenerAdded = true;
    }
  };

  return (
    <div className="lg:hidden bg-gray-100 h-12 w-full fixed bottom-0 left-0 p-2 flex flex-row justify-between items-center">
      <div onClick={toggleMenu} className="w-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>         
      </div>
      <div className="w-16">
        <span className="font-medium text-sm">{resultsCount} Results</span>
      </div>      
      <div className="flex justify-center">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-5 h-5 mr-2 cursor-pointer" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            onClick={() => {
              if (isMapView) {
                // Toggle to list view without reload
                toggleMapView();
                updateUrlWithoutReload(false);
              }
            }}
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isMapView} 
              onChange={() => {
                // Toggle the map view state
                const newMapState = !isMapView;
                toggleMapView();
                updateUrlWithoutReload(newMapState);
              }}
            />
            <div className="w-10 h-5 bg-gray-100 border border-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-700 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-100"></div>
          </label>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-5 h-5 ml-2 cursor-pointer" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            onClick={() => {
              if (!isMapView) {
                // Toggle to map view without reload
                toggleMapView();
                updateUrlWithoutReload(true);
              }
            }}
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </div>
      </div>

    </div>
  );
}