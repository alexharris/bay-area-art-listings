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
  chipStyle = false,
}) => {

  const [selectedCounty, setSelectedCounty] = useState('All');
  const [countyCounts, setCountyCounts] = useState({});
  const [whereTab, setWhereTab] = useState('county');

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

    const activeTab = nearMeActive ? 'nearme' : whereTab;

    const handleTabChange = (tab) => {
      setWhereTab(tab);
      if (tab === 'county') {
        if (clearUserLocation) clearUserLocation();
      } else {
        onCountyChange([]);
      }
    };

    const toggleCounty = (countyName) => {
      const isSelected = selectedNames.includes(countyName);
      const newNames = isSelected
        ? selectedNames.filter(n => n !== countyName)
        : [...selectedNames, countyName];
      onCountyChange(newNames.flatMap(n => getZipcodesByCounty(n)));
    };

    return (
      <div className="flex flex-col">
        {/* Segmented control */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleTabChange('nearme')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'nearme'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              📍 Near me
            </button>
            <button
              onClick={() => handleTabChange('county')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'county'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              By county
            </button>
          </div>
        </div>

        {activeTab === 'nearme' ? (
          <div className="px-4 pb-4">
            {locationLoading ? (
              <p className="text-sm text-gray-500 text-center py-2">Locating…</p>
            ) : userLocation ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-700">Within {nearbyRadius} mi</span>
                <input
                  type="range" min={1} max={10} value={nearbyRadius}
                  onChange={(e) => setNearbyRadius(Number(e.target.value))}
                  className="w-full h-1.5 accent-gray-700 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1 mi</span>
                  <span>10 mi</span>
                </div>
              </div>
            ) : locationError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{locationError}</span>
                <button onClick={getUserLocation} className="text-xs text-gray-500 underline">Retry</button>
              </div>
            ) : (
              <button
                onClick={() => { if (getUserLocation) getUserLocation(); }}
                className="w-full py-3 text-sm text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                Tap to use my location
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2">
              {selectedNames.length > 0 && (
                <button onClick={() => onCountyChange([])} className="text-xs text-gray-500 underline ml-auto">Clear</button>
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
        )}
      </div>
    );
  }

  const selectContent = (
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
  );

  if (chipStyle) {
    const chipActive = selectValue !== 'All';
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Select value={selectValue} onValueChange={handleCountyChange}>
            <SelectTrigger className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm h-auto w-auto transition-colors [&>svg]:hidden ${
              chipActive
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}>
              📍 <SelectValue />
              <span className="opacity-40 text-xs ml-0.5">▾</span>
            </SelectTrigger>
            {selectContent}
          </Select>
          {chipActive && (
            <button
              onClick={() => { handleCountyChange('All'); if (clearUserLocation) clearUserLocation(); }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Clear location filter"
            >
              ×
            </button>
          )}
        </div>
        {userLocation && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-gray-700">Within {nearbyRadius} mi</span>
            <input
              type="range" min={1} max={10} value={nearbyRadius}
              onChange={(e) => setNearbyRadius(Number(e.target.value))}
              className="w-full h-1.5 accent-gray-700 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 mi</span>
              <span>10 mi</span>
            </div>
          </div>
        )}
        {locationError && !userLocation && !locationLoading && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500">{locationError}</span>
            <button onClick={getUserLocation} className="text-xs text-gray-500 hover:text-gray-700 underline">Retry</button>
          </div>
        )}
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
          {selectContent}
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
            max={10}
            value={nearbyRadius}
            onChange={(e) => setNearbyRadius(Number(e.target.value))}
            className="w-full h-1.5 accent-gray-700 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 mi</span>
            <span>10 mi</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountySelector;
