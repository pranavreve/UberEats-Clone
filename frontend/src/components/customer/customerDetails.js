import React, { Component } from "react";
import axios from "axios";
import "./customerDetails.css";
import "./countryCode.css";
import { countries } from "./countryCode";
import { Navigate } from "react-router-dom";
import NavBar from "../navbar";
import CustomerFooter from "../footer/customerFooter";
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

class CustomerDetails extends Component {
  state = {
    name: "",
    email: "",
    phone: "",
    countryCode: "US", // Default country code
    country: "",
    state: "",
    profile_image: "",
    loading: true,
    error: null,
    success: false,
    redirectToHome: false
  };

  componentDidMount() {
    this.loadProfileData();
  }

  loadProfileData = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        this.setState({ redirectToHome: true });
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const profile = response.data.profile;
        // Find country code from phone number if it exists
        let countryCode = "US";
        if (profile.phone) {
          const matchingCountry = countries.find(country => 
            profile.phone.startsWith(country.phone)
          );
          if (matchingCountry) {
            countryCode = matchingCountry.code;
          }
        }

        this.setState({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone ? profile.phone.replace(/^\+\d+\s*/, '') : "", // Remove country code from phone
          countryCode,
          country: profile.country || "",
          state: profile.state || "",
          profile_image: profile.profile_image || "",
          loading: false
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      this.setState({
        error: "Failed to load profile data",
        loading: false
      });
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      error: null
    });
  };

  handleCountryCodeChange = (event) => {
    this.setState({
      countryCode: event.target.value,
      error: null
    });
  };

  handleProfileUpdate = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        this.setState({ redirectToHome: true });
        return;
      }

      const { name, phone, countryCode, country, state } = this.state;
      
      // Get the phone code for the selected country
      const selectedCountry = countries.find(c => c.code === countryCode);
      const fullPhone = phone ? `${selectedCountry.phone}${phone}` : "";

      const response = await axios.put(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/profile`,
        {
          name,
          phone: fullPhone,
          country,
          state
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.setState({
          success: true,
          error: null
        });

        // Update session storage with new details
        sessionStorage.setItem("customerDetails", JSON.stringify(response.data.profile));

        // Show success message for 2 seconds
        setTimeout(() => {
          this.setState({ success: false });
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      this.setState({
        error: error.response?.data?.message || "Failed to update profile"
      });
    }
  };

  render() {
    const {
      loading,
      error,
      success,
      redirectToHome,
      name,
      email,
      phone,
      countryCode,
      country,
      state
    } = this.state;

    if (redirectToHome) {
      return <Navigate to="/customer/login" />;
    }

    if (loading) {
      return (
        <div className="profile-container">
          <NavBar />
          <div className="loading">Loading profile data...</div>
          <CustomerFooter />
        </div>
      );
    }

    return (
      <div className="profile-container">
        <NavBar />
        <div className="profile-content">
          <div className="profile-header">
            <h2>My Profile</h2>
            <p>Manage your account details and preferences</p>
          </div>

          <div className="profile-form">
            <div className="profile-section">
              <h3>Personal Information</h3>
              
              <div className="form-group">
                <label>
                  <FaUser /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handleInputChange}
                  className="form-control"
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  className="form-control"
                  disabled
                  placeholder="Your email"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaPhone /> Phone Number
                </label>
                <div className="phone-input-group">
                  <div className="country-select country-code">
                    <select
                      value={countryCode}
                      onChange={this.handleCountryCodeChange}
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.phone} ({country.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={this.handleInputChange}
                    className="form-control phone-number"
                    placeholder="Phone number without country code"
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Location Information</h3>
              
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt /> Country
                </label>
                <div className="country-select">
                  <select
                    name="country"
                    value={country}
                    onChange={this.handleInputChange}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt /> State
                </label>
                <input
                  type="text"
                  name="state"
                  value={state}
                  onChange={this.handleInputChange}
                  className="form-control"
                  placeholder="Your state"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Profile updated successfully!</div>}

            <div className="profile-actions">
              <button
                className="update-button"
                onClick={this.handleProfileUpdate}
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
        <CustomerFooter />
      </div>
    );
  }
}

export default CustomerDetails;
