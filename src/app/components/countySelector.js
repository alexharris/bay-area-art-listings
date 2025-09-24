import React, { useState, useEffect } from 'react';
import bayAreaZipcodes from '../../data/bay-area-zipcodes.json';
import { getCountyCounts } from '../../utils/filterCounts';

function getZipcodesByCounty(county) {
  const zipcodes = bayAreaZipcodes.filter(zipcode => zipcode.county === county);
  return zipcodes;
}

const CountySelector = ({ onCountyChange, selectedCountyProp, currentFilters, listings }) => {

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
  
  const handleCountyChange = (e) => {
    const county = e.target.value;
    setSelectedCounty(county);
    onCountyChange(getZipcodesByCounty(county));
  };
  
  
  return (
    <div className="flex flex-row items-center relative">
      {/* <svg className="absolute z-10 pointer-events-none hidden lg:block ml-1" width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <path d="M0.330059 9.33014L0.330059 0.669885L7.83006 5.00001L0.330059 9.33014Z" fill="black"/>
      </svg> */}

      <label htmlFor="countyFilter" className="pr-2 w-24">Where</label>
      <select 
        id="countyFilter" 
        value={selectedCounty}
        onChange={handleCountyChange}
        className="border border-gray-300 bg-white rounded px-2 py-1 flex-grow"

      >
        <option value="All">Anywhere {selectedCounty !== 'All' && countyCounts['All'] !== undefined ? `(${countyCounts['All']})` : ''}</option>
        <option value="Alameda">Alameda {selectedCounty !== 'Alameda' && countyCounts['Alameda'] !== undefined ? `(${countyCounts['Alameda']})` : ''}</option>
        <option value="Contra Costa">Contra Costa {selectedCounty !== 'Contra Costa' && countyCounts['Contra Costa'] !== undefined ? `(${countyCounts['Contra Costa']})` : ''}</option>
        <option value="Marin">Marin {selectedCounty !== 'Marin' && countyCounts['Marin'] !== undefined ? `(${countyCounts['Marin']})` : ''}</option>
        <option value="Napa">Napa {selectedCounty !== 'Napa' && countyCounts['Napa'] !== undefined ? `(${countyCounts['Napa']})` : ''}</option>
        <option value="Sacramento">Sacramento {selectedCounty !== 'Sacramento' && countyCounts['Sacramento'] !== undefined ? `(${countyCounts['Sacramento']})` : ''}</option>
        <option value="San Francisco">San Francisco {selectedCounty !== 'San Francisco' && countyCounts['San Francisco'] !== undefined ? `(${countyCounts['San Francisco']})` : ''}</option>
        <option value="San Mateo">San Mateo {selectedCounty !== 'San Mateo' && countyCounts['San Mateo'] !== undefined ? `(${countyCounts['San Mateo']})` : ''}</option>
        <option value="Santa Clara">Santa Clara {selectedCounty !== 'Santa Clara' && countyCounts['Santa Clara'] !== undefined ? `(${countyCounts['Santa Clara']})` : ''}</option>
        <option value="Solano">Solano {selectedCounty !== 'Solano' && countyCounts['Solano'] !== undefined ? `(${countyCounts['Solano']})` : ''}</option>
        <option value="Sonoma">Sonoma {selectedCounty !== 'Sonoma' && countyCounts['Sonoma'] !== undefined ? `(${countyCounts['Sonoma']})` : ''}</option>
      </select>
    </div>
  );
};

export default CountySelector;