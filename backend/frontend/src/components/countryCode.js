import React from "react";
import "./countryCode.css";

class CountryCode extends React.Component {
  render() {
    return (
      <select
        className="country-code-select"
        name="countryCode"
        onChange={(e) => this.props.changeCountryCode(e.target.value)}
        defaultValue={this.props.defaultValue || "1"}
      >
        <option value="1">+1 United States</option>
        <option value="1">+1 Canada</option>
        <option value="44">+44 United Kingdom</option>
        <option value="91">+91 India</option>
        <option value="61">+61 Australia</option>
        <option value="81">+81 Japan</option>
        <option value="49">+49 Germany</option>
        <option value="33">+33 France</option>
        <option value="39">+39 Italy</option>
        <option value="55">+55 Brazil</option>
        <option value="86">+86 China</option>
      </select>
    );
  }
}

export default CountryCode;
