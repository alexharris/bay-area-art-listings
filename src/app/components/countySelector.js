import React from 'react';
import bayAreaZipcodes from '../../data/bay-area-zipcodes.json';


function getZipcodesByCounty(county) {
  const zipcodes = bayAreaZipcodes.filter(zipcode => zipcode.county === county);
  return zipcodes;
}

const CountySelector = ({ onCountyChange }) => {
  return (
    <div className="flex flex-col pb-2">
      <label htmlFor="countyFilter">County</label>
      <select 
        id="countyFilter" 
        onChange={(e) => onCountyChange(getZipcodesByCounty(e.target.value))} 
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