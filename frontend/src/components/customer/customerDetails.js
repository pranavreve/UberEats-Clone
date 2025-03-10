import React, { Component } from "react";
import axios from "axios";
import "./customerDetails.css";
import { Navigate } from "react-router-dom";
import NavBar from "../navbar";
import CustomerFooter from "../footer/customerFooter";
import { countries } from "./countriesList"; // We'll create this file next
import { stateAbbreviations } from "./stateAbbreviations"; // We'll create this file next
import { FaCamera, FaUser, FaPhone, FaMapMarkerAlt, FaFlag, FaCity } from "react-icons/fa";

class CustomerDetails extends Component {
  state = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States",
    avatar: "",
    profile_image_preview: null,
    selectedFile: null,
    redirectToHome: false,
    errors: {},
    loading: true,
    success: false,
    customer_id: 0
  };

  componentDidMount() {
    // Get user profile from the API
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      this.setState({ redirectToHome: true });
      return;
    }

    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const data = response.data;
          this.setState({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone_number: data.phone_number || "",
            street_address: data.street_address || "",
            city: data.city || "",
            state: data.state || "",
            zip_code: data.zip_code || "",
            country: data.country || "United States",
            avatar: data.avatar || data.profile_picture || "",
            loading: false,
            customer_id: data.customer_id || data.id
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
        this.setState({ loading: false });
      });
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value, errors: { ...this.state.errors, [name]: "" } });
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({ 
          profile_image_preview: reader.result,
          selectedFile: file 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  validateForm = () => {
    const { first_name, last_name, phone_number, email } = this.state;
    const errors = {};
    let isValid = true;

    if (!first_name.trim()) {
      errors.first_name = "First name is required";
      isValid = false;
    }

    if (!last_name.trim()) {
      errors.last_name = "Last name is required";
      isValid = false;
    }

    if (!phone_number.trim()) {
      errors.phone_number = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(phone_number.replace(/[^0-9]/g, ''))) {
      errors.phone_number = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };

  handleProfileUpdate = () => {
    if (!this.validateForm()) {
      return;
    }

    this.setState({ loading: true });

    const { 
      first_name, 
      last_name, 
      phone_number, 
      email,
      street_address,
      city,
      state,
      zip_code,
      country,
      selectedFile,
      customer_id
    } = this.state;

    const updateData = {
      first_name,
      last_name,
      phone_number,
      email,
      street_address,
      city,
      state,
      zip_code,
      country
    };

    const token = sessionStorage.getItem("authToken");

    const updateProfile = () => {
      axios
        .put(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/profile`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            this.setState({ 
              success: true,
              loading: false 
            });
            
            // Show success message for 2 seconds then reset
            setTimeout(() => {
              this.setState({ success: false });
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          this.setState({ 
            loading: false,
            errors: { 
              ...this.state.errors, 
              form: "Failed to update profile. Please try again." 
            } 
          });
        });
    };

    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      // Add other fields to formData
      Object.keys(updateData).forEach(key => {
        formData.append(key, updateData[key]);
      });

      axios
        .post(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/upload-avatar`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
            updateData.avatar = res.data.avatar || res.data.profile_picture;
            updateProfile();
          }
        })
        .catch((err) => {
          console.error("Error uploading avatar:", err);
          // Continue with profile update even if avatar upload fails
          updateProfile();
        });
    } else {
      updateProfile();
    }
  };

  render() {
    const { 
      redirectToHome, 
      errors, 
      loading, 
      success,
      avatar,
      profile_image_preview
    } = this.state;

    if (redirectToHome) {
      return <Navigate to="/customer/home" />;
    }

    const displayImage = profile_image_preview || avatar || "https://placehold.co/150";

    return (
      <div className="profile-page-container">
        <NavBar />
        
        <div className="profile-content">
          <div className="profile-header">
            <h2>My Profile</h2>
            <p>Manage your personal information and delivery details</p>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="profile-form-container">
              <div className="profile-image-section">
                <div className="profile-image-container">
                  <img 
                    src={displayImage} 
                    alt="Profile" 
                    className="profile-image"
                  />
                  <div className="upload-overlay">
                    <label htmlFor="avatar-upload" className="upload-btn">
                      <FaCamera />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={this.handleFileChange}
                      className="file-input"
                    />
                  </div>
                </div>
                <p className="upload-text">Click to upload a new photo</p>
              </div>
              
              <div className="profile-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="first_name">
                        <FaUser /> First Name*
                      </label>
                      <input
                        id="first_name"
                        type="text"
                        name="first_name"
                        value={this.state.first_name}
                        onChange={this.handleInputChange}
                        className={errors.first_name ? "form-control error" : "form-control"}
                        placeholder="First Name"
                      />
                      {errors.first_name && <div className="error-text">{errors.first_name}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="last_name">
                        <FaUser /> Last Name*
                      </label>
                      <input
                        id="last_name"
                        type="text"
                        name="last_name"
                        value={this.state.last_name}
                        onChange={this.handleInputChange}
                        className={errors.last_name ? "form-control error" : "form-control"}
                        placeholder="Last Name"
                      />
                      {errors.last_name && <div className="error-text">{errors.last_name}</div>}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone_number">
                        <FaPhone /> Phone Number*
                      </label>
                      <input
                        id="phone_number"
                        type="tel"
                        name="phone_number"
                        value={this.state.phone_number}
                        onChange={this.handleInputChange}
                        className={errors.phone_number ? "form-control error" : "form-control"}
                        placeholder="(123) 456-7890"
                      />
                      {errors.phone_number && <div className="error-text">{errors.phone_number}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={this.state.email}
                        onChange={this.handleInputChange}
                        className={errors.email ? "form-control error" : "form-control"}
                        placeholder="email@example.com"
                        readOnly
                      />
                      {errors.email && <div className="error-text">{errors.email}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Delivery Address</h3>
                  
                  <div className="form-group full-width">
                    <label htmlFor="street_address">
                      <FaMapMarkerAlt /> Street Address
                    </label>
                    <input
                      id="street_address"
                      type="text"
                      name="street_address"
                      value={this.state.street_address}
                      onChange={this.handleInputChange}
                      className="form-control"
                      placeholder="123 Main St"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">
                        <FaCity /> City
                      </label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={this.state.city}
                        onChange={this.handleInputChange}
                        className="form-control"
                        placeholder="City"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <select
                        id="state"
                        name="state"
                        value={this.state.state}
                        onChange={this.handleInputChange}
                        className="form-control"
                      >
                        <option value="">Select State</option>
                        {stateAbbreviations.map((state) => (
                          <option key={state.abbreviation} value={state.abbreviation}>
                            {state.abbreviation} - {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="zip_code">Zip Code</label>
                      <input
                        id="zip_code"
                        type="text"
                        name="zip_code"
                        value={this.state.zip_code}
                        onChange={this.handleInputChange}
                        className="form-control"
                        placeholder="Zip Code"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="country">
                        <FaFlag /> Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={this.state.country}
                        onChange={this.handleInputChange}
                        className="form-control"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  {errors.form && <div className="error-message">{errors.form}</div>}
                  {success && <div className="success-message">Profile updated successfully!</div>}
                  
                  <button
                    className="update-profile-btn"
                    onClick={this.handleProfileUpdate}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <CustomerFooter />
      </div>
    );
  }
}

export default CustomerDetails;
