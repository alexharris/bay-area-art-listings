import React, { useState, useEffect } from 'react';
import bayAreaZipcodes from '../../../data/bay-area-zipcodes.json';
import { getCountyCounts } from '../../../utils/filterCounts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getZipcodesByCounty(county) {
  const zipcodes = bayAreaZipcodes.filter(zipcode => zipcode.county === county);
  return zipcodes;
}

const COUNTIES = [
  'Alameda', 'Contra Costa', 'Marin', 'Napa', 'Sacramento',
  'San Francisco', 'San Mateo', 'Santa Clara', 'Solano', 'Sonoma',
];

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
  listMode,
  onSelect,
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

  const handleCountyChange = (value) => {
    if (value === 'NearMe') {
      if (getUserLocation) getUserLocation();
      return;
    }
    setSelectedCounty(value);
    onCountyChange(getZipcodesByCounty(value));
    if (clearUserLocation) clearUserLocation();
  };

  const selectValue = userLocation || locationLoading ? 'NearMe' : selectedCounty;

  if (listMode) {
    const selectedNames = (selectedCountyProp || []).map(obj => obj.county);
    const nearMeActive = !!(userLocation || locationLoading);

    const handleNearMeToggle = () => {
      if (nearMeActive) {
        if (clearUserLocation) clearUserLocation();
      } else {
        if (getUserLocation) getUserLocation();
      }
    };

    const toggleCounty = (countyName) => {
      const isSelected = selectedNames.includes(countyName);
      const newNames = isSelected
        ? selectedNames.filter(n => n !== countyName)
        : [...selectedNames, countyName];
      onCountyChange(newNames.flatMap(n => getZipcodesByCounty(n)));
      if (clearUserLocation) clearUserLocation();
    };

    return (
      <div className="flex flex-col">
        {/* Near Me toggle */}
        <div className="px-4 pt-1 pb-4 border-b border-gray-200">
          <button
            onClick={handleNearMeToggle}
            className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
              nearMeActive
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <span>📍</span>
            <span className="flex-1 text-left">
              {locationLoading ? 'Locating…' : 'Near me'}
            </span>
            {nearMeActive && !locationLoading && (
              <span className="text-xs opacity-60">tap to clear</span>
            )}
          </button>
          {userLocation && (
            <div className="flex flex-col gap-2 pt-3 px-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Within {nearbyRadius} mi</span>
              </div>
              <input
                type="range" min={1} max={20} value={nearbyRadius}
                onChange={(e) => setNearbyRadius(Number(e.target.value))}
                className="w-full h-1.5 accent-gray-700 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1 mi</span>
                <span>20 mi</span>
              </div>
            </div>
          )}
          {locationError && !userLocation && !locationLoading && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-red-500">{locationError}</span>
              <button onClick={getUserLocation} className="text-xs text-gray-500 underline">Retry</button>
            </div>
          )}
        </div>

        {/* County list */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">County</span>
          {selectedNames.length > 0 && (
            <button
              onClick={() => onCountyChange([])}
              className="text-xs text-gray-500 underline"
            >
              Clear
            </button>
          )}
        </div>
        {COUNTIES.map(county => {
          const isSelected = selectedNames.includes(county);
          const count = !isSelected && countyCounts[county] !== undefined ? countyCounts[county] : null;
          return (
            <button
              key={county}
              onClick={() => toggleCounty(county)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm border-t border-gray-100 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}
            >
              <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'}`}>
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className="flex-1">{county}</span>
              {count != null && <span className="text-xs text-gray-400">({count})</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex flex-row items-center relative">
        <label className="pr-2 w-20 text-sm">Where</label>
        <Select value={selectValue} onValueChange={handleCountyChange}>
          <SelectTrigger className="flex-grow">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">
              Anywhere {selectedCounty !== 'All' && countyCounts['All'] !== undefined ? `(${countyCounts['All']})` : ''}
            </SelectItem>
            <SelectItem value="NearMe">
              {locationLoading ? 'Locating…' : 'Near me'}
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

      {/* Radius slider and error — shown below when Near Me is active */}
      {locationError && !userLocation && !locationLoading && (
        <div className="flex items-center gap-2 pl-20">
          <span className="text-xs text-red-500">{locationError}</span>
          <button
            onClick={getUserLocation}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Retry
          </button>
        </div>
      )}
      {userLocation && (
        <div className="flex flex-col gap-1.5 pl-20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Within {nearbyRadius} mi</span>
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
      )}
    </div>
  );
};

export default CountySelector;
