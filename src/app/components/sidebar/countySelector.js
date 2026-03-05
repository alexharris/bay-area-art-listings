import React, { useState, useEffect } from 'react';
import bayAreaZipcodes from '../../../data/bay-area-zipcodes.json';
import { getCountyCounts } from '../../../utils/filterCounts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getZipcodesByCounty(county) {
  const zipcodes = bayAreaZipcodes.filter(zipcode => zipcode.county === county);
  return zipcodes;
}

const CountySelector = ({
  onCountyChange,
  selectedCountyProp,
  currentFilters,
  listings,
  userLocation,
  nearbyRadius,
  setNearbyRadius,
  locationError,
  locationLoading,
  getUserLocation,
  clearUserLocation,
}) => {

  const [selectedCounty, setSelectedCounty] = useState('All');
  const [countyCounts, setCountyCounts] = useState({});

  useEffect(() => {
    // Reset local state when parent component passes an empty array (meaning "All" is selected)
    if (!selectedCountyProp || (Array.isArray(selectedCountyProp) && selectedCountyProp.length === 0)) {
      setSelectedCounty('All');
    } else if (Array.isArray(selectedCountyProp) && selectedCountyProp.length > 0) {
      // Find which county this zipcode array belongs to
      const countyName = selectedCountyProp[0]?.county;
      if (countyName) {
        setSelectedCounty(countyName);
      }
    }
  }, [selectedCountyProp]);

  // Calculate counts when filters or listings change
  useEffect(() => {
    if (currentFilters && listings && listings.length > 0) {
      const counts = getCountyCounts(currentFilters, listings, getZipcodesByCounty);
      setCountyCounts(counts);
    }
  }, [currentFilters, listings]);

  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      if (params.has('selectedCounty')) {
        const countyFromURL = params.get('selectedCounty');
        setSelectedCounty(countyFromURL);

        // Call the onCountyChange with the zipcodes for this county
        onCountyChange(getZipcodesByCounty(countyFromURL));
        if (clearUserLocation) clearUserLocation();
      }
    }
  }, [onCountyChange]);

  const handleCountyChange = (county) => {
    setSelectedCounty(county);
    onCountyChange(getZipcodesByCounty(county));
    // Selecting a specific county clears Near Me
    if (county !== 'All' && clearUserLocation) {
      clearUserLocation();
    }
  };


  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex flex-row items-center relative">
        <label className="pr-2 w-20 text-sm">Where</label>
        <Select value={selectedCounty} onValueChange={handleCountyChange}>
          <SelectTrigger className="flex-grow">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">
              Anywhere {selectedCounty !== 'All' && countyCounts['All'] !== undefined ? `(${countyCounts['All']})` : ''}
            </SelectItem>
            <SelectItem value="Alameda">
              Alameda {selectedCounty !== 'Alameda' && countyCounts['Alameda'] !== undefined ? `(${countyCounts['Alameda']})` : ''}
            </SelectItem>
            <SelectItem value="Contra Costa">
              Contra Costa {selectedCounty !== 'Contra Costa' && countyCounts['Contra Costa'] !== undefined ? `(${countyCounts['Contra Costa']})` : ''}
            </SelectItem>
            <SelectItem value="Marin">
              Marin {selectedCounty !== 'Marin' && countyCounts['Marin'] !== undefined ? `(${countyCounts['Marin']})` : ''}
            </SelectItem>
            <SelectItem value="Napa">
              Napa {selectedCounty !== 'Napa' && countyCounts['Napa'] !== undefined ? `(${countyCounts['Napa']})` : ''}
            </SelectItem>
            <SelectItem value="Sacramento">
              Sacramento {selectedCounty !== 'Sacramento' && countyCounts['Sacramento'] !== undefined ? `(${countyCounts['Sacramento']})` : ''}
            </SelectItem>
            <SelectItem value="San Francisco">
              San Francisco {selectedCounty !== 'San Francisco' && countyCounts['San Francisco'] !== undefined ? `(${countyCounts['San Francisco']})` : ''}
            </SelectItem>
            <SelectItem value="San Mateo">
              San Mateo {selectedCounty !== 'San Mateo' && countyCounts['San Mateo'] !== undefined ? `(${countyCounts['San Mateo']})` : ''}
            </SelectItem>
            <SelectItem value="Santa Clara">
              Santa Clara {selectedCounty !== 'Santa Clara' && countyCounts['Santa Clara'] !== undefined ? `(${countyCounts['Santa Clara']})` : ''}
            </SelectItem>
            <SelectItem value="Solano">
              Solano {selectedCounty !== 'Solano' && countyCounts['Solano'] !== undefined ? `(${countyCounts['Solano']})` : ''}
            </SelectItem>
            <SelectItem value="Sonoma">
              Sonoma {selectedCounty !== 'Sonoma' && countyCounts['Sonoma'] !== undefined ? `(${countyCounts['Sonoma']})` : ''}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Near Me section */}
      <div className="flex flex-row items-center gap-2 pl-20">
        {locationLoading ? (
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <svg className="animate-spin h-3.5 w-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Locating…
          </span>
        ) : userLocation ? (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Within {nearbyRadius} mi</span>
              <button
                onClick={clearUserLocation}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={nearbyRadius}
              onChange={(e) => setNearbyRadius(Number(e.target.value))}
              className="w-full h-1.5 accent-gray-700 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 mi</span>
              <span>20 mi</span>
            </div>
          </div>
        ) : locationError ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500">{locationError}</span>
            <button
              onClick={getUserLocation}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <button
            onClick={getUserLocation}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            Near me
          </button>
        )}
      </div>
    </div>
  );
};

export default CountySelector;
