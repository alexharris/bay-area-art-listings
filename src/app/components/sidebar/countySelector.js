import React, { useState, useEffect } from 'react';
import bayAreaZipcodes from '../../../data/bay-area-zipcodes.json';
import { getCountyCounts } from '../../../utils/filterCounts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getZipcodesByCounty(county) {
  const zipcodes = bayAreaZipcodes.filter(zipcode => zipcode.county === county);
  return zipcodes;
}

const CountySelector = ({ onCountyChange, selectedCountyProp, currentFilters, listings, chipStyle = false }) => {

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
      }
    }
  }, [onCountyChange]);
  
  const handleCountyChange = (county) => {
    setSelectedCounty(county);
    onCountyChange(getZipcodesByCounty(county));
  };
  
  
  const selectContent = (
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
  );

  if (chipStyle) {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedCounty} onValueChange={handleCountyChange}>
          <SelectTrigger className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm h-auto w-auto transition-colors [&>svg]:hidden ${
            selectedCounty !== 'All'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          }`}>
            📍 <SelectValue />
            <span className="opacity-40 text-xs ml-0.5">▾</span>
          </SelectTrigger>
          {selectContent}
        </Select>
        {selectedCounty !== 'All' && (
          <button
            onClick={() => handleCountyChange('All')}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Clear location filter"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center relative">
      <label className="pr-2 w-20 text-sm">Where</label>
      <Select value={selectedCounty} onValueChange={handleCountyChange}>
        <SelectTrigger className="flex-grow">
          <SelectValue />
        </SelectTrigger>
        {selectContent}
      </Select>
    </div>
  );
};

export default CountySelector;