import React from 'react';
import PropTypes from 'prop-types';
import './countryName.css';
import countries from './countries.json'; // Import the countries list

const CountryName = ({ changeCountryName, selectedCountry }) => {
  return (
    <select
      className="txtbox"
      name="countryName"
      value={selectedCountry || '-1'}
      onChange={(e) => changeCountryName(e.target.value)}
    >
      <option value="-1">Select Country</option>
      {countries.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};

CountryName.propTypes = {
  changeCountryName: PropTypes.func.isRequired,
  selectedCountry: PropTypes.string,
};

export default CountryName;
