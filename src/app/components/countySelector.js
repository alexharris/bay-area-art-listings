import React, { useState, useEffect } from 'react';
import bayAreaZipcodes from '../../data/bay-area-zipcodes.json';


function getZipcodesByCounty(county) {
  const zipcodes = bayAreaZipcodes.filter(zipcode => zipcode.county === county);
  return zipcodes;
}

const CountySelector = ({ onCountyChange, selectedCountyProp }) => {

  const [selectedCounty, setSelectedCounty] = useState('');
  
  useEffect(() => {
    // Reset local state when parent component passes an empty array
    if (selectedCountyProp && Array.isArray(selectedCountyProp) && selectedCountyProp.length === 0) {
      setSelectedCounty('');
    }
  }, [selectedCountyProp]);
  
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
    <div className="flex flex-row items-center pb-1 relative">
      <svg className="absolute z-10 pointer-events-none hidden lg:block ml-1" width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <path d="M0.330059 9.33014L0.330059 0.669885L7.83006 5.00001L0.330059 9.33014Z" fill="black"/>
      </svg>

      <label htmlFor="countyFilter" className="sr-only">County</label>
      <select 
        id="countyFilter" 
        value={selectedCounty}
        onChange={handleCountyChange}
        className="p-1 pl-5 bg-white appearance-none"
        style={{ 
          WebkitAppearance: 'none',
          MozAppearance: 'none' 
        }}
      >
        <option value="">Select a county</option>
        <option value="Alameda">Alameda</option>
        <option value="Contra Costa">Contra Costa</option>
        <option value="Marin">Marin</option>
        <option value="Napa">Napa</option>
        <option value="Sacramento">Sacramento</option>
        <option value="San Francisco">San Francisco</option>
        <option value="San Mateo">San Mateo</option>
        <option value="Santa Clara">Santa Clara</option>
        <option value="Solano">Solano</option>
        <option value="Sonoma">Sonoma</option>
      </select>
    </div>
  );
};

export default CountySelector;