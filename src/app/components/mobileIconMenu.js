export default function header({ toggleMenu, isMapView, displayedResults }) {
  // Get the displayedResults value from props
  const resultsCount = displayedResults;

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
                // Switch to list view
                const params = new URLSearchParams(window.location.search);
                params.delete('view');
                const newUrl = params.toString() 
                  ? `${window.location.pathname}?${params.toString()}`
                  : window.location.pathname;
                window.location.href = newUrl;
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
                // Update URL to reflect the change
                const params = new URLSearchParams(window.location.search);
                if (!isMapView) {
                  params.set('view', 'map');
                } else {
                  params.delete('view');
                }
                
                const newUrl = params.toString() 
                  ? `${window.location.pathname}?${params.toString()}`
                  : window.location.pathname;
                window.location.href = newUrl;
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
                // Switch to map view
                const params = new URLSearchParams(window.location.search);
                params.set('view', 'map');
                const newUrl = params.toString() 
                  ? `${window.location.pathname}?${params.toString()}`
                  : window.location.pathname;
                window.location.href = newUrl;
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