import React, { useState, useEffect } from 'react';
import bayAreaZipcodes from '../../data/bay-area-zipcodes.json';


function getZipcodesByCounty(county) {
  const zipcodes = bayAreaZipcodes.filter(zipcode => zipcode.county === county);
  return zipcodes;
}

const CountySelector = ({ onCountyChange }) => {

  const [selectedCounty, setSelectedCounty] = useState('');
  
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
    <div className="flex flex-col pb-2">
      <label htmlFor="countyFilter">County</label>
      <select 
        id="countyFilter" 
        value={selectedCounty}
        onChange={handleCountyChange}
        className="p-1 bg-white border border-gray-300"
      >
        <option value="">All Counties</option>
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