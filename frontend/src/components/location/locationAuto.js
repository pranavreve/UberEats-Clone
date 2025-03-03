import React from "react";
import "./locationAuto.css";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: this.props.initialAddress || "",
    };
  }

  handleChange = (address) => {
    this.setState({ address });
  };

  handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => {
        this.setState({ address });
        return getLatLng(results[0]);
      })
      .then((latLng) => {
        // Pass the selected address, latitude, and longitude to the parent component
        this.props.handleLocationChange({
          address,
          latitude: latLng.lat,
          longitude: latLng.lng,
        });
      })
      .catch((error) => console.error("Error", error));
  };

  render() {
    return (
      <PlacesAutocomplete
        value={this.state.address}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        searchOptions={{
          types: ["address"],
          componentRestrictions: { country: "us" },
        }}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="location-search">
            <input
              {...getInputProps({
                placeholder: "Enter your location...",
                className: "location-search-input",
              })}
            />
            <div className="autocomplete-dropdown-container">
              {loading && <div className="loading">Loading...</div>}
              {suggestions.map((suggestion, index) => {
                const className = suggestion.active
                  ? "suggestion-item--active"
                  : "suggestion-item";
                const style = suggestion.active
                  ? { backgroundColor: "#fafafa", cursor: "pointer" }
                  : { backgroundColor: "#ffffff", cursor: "pointer" };
                return (
                  <div
                    key={index}
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}

export default LocationSearchInput;
