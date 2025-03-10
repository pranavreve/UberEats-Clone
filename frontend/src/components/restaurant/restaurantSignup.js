import React, { Component } from "react";
import "./restaurantSignup.css";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import { Navigate } from "react-router-dom";
import { authAPI, restaurantAPI } from "../../services/api";

class RestaurantSignup extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    location: "",
    contact: "",
    start_time: "",
    end_time: "",
    signupError: "",
    redirectToHome: false,
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSignup = async () => {
    const {
      name,
      email,
      password,
      location,
      contact,
      start_time,
      end_time,
    } = this.state;

    if (!name || !email || !password || !location || !contact) {
      this.setState({ signupError: "Please fill in all required fields." });
      return;
    }

    try {
      // Register using the updated API service
      await authAPI.register({
        name,
        email,
        password,
        user_type: "restaurant",
        location
      });

      // Login after successful registration
      const loginResponse = await authAPI.login({
        email,
        password
      });

      // Store auth token
      sessionStorage.setItem("authToken", loginResponse.data.token);
      sessionStorage.setItem("userType", "restaurant");

      try {
        // Get restaurant profile
        const profileResponse = await restaurantAPI.getProfile();
        
        // Store restaurant details
        sessionStorage.setItem(
          "restaurantDetails",
          JSON.stringify(profileResponse.data)
        );
        
        // Update restaurant profile with the additional details
        await restaurantAPI.updateProfile({
          name: name,
          description: "Restaurant description", // Default description
          location: location,
          delivery_type: "Both", // Default to both delivery and pickup
          contact_info: contact,
          opening_time: start_time,
          closing_time: end_time
        });
        
        // Redirect to home page
        this.setState({ redirectToHome: true });
      } catch (profileError) {
        this.setState({
          signupError: "Failed to fetch or update restaurant details."
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Error occurred during signup.";
      this.setState({ signupError: errorMsg });
    }
  };

  render() {
    const { redirectToHome } = this.state;

    if (redirectToHome) {
      return <Navigate to="/restaurant/home" />;
    }

    return (
      <div className="signup-container">
        <div className="formContainer">
          <img className="logo" src={ubereatslogo} alt="Uber Eats Logo" />
          <h3 className="welcome">Create your restaurant account</h3>
          <input
            type="text"
            name="name"
            placeholder="Restaurant Name"
            className="textinput"
            onChange={this.handleInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Address"
            className="textinput"
            onChange={this.handleInputChange}
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            className="textinput"
            onChange={this.handleInputChange}
          />
          <input
            type="time"
            name="start_time"
            placeholder="Start Time"
            className="textinput"
            onChange={this.handleInputChange}
          />
          <input
            type="time"
            name="end_time"
            placeholder="End Time"
            className="textinput"
            onChange={this.handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="textinput"
            onChange={this.handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="textinput"
            onChange={this.handleInputChange}
          />
          {this.state.signupError && (
            <div className="error-message">{this.state.signupError}</div>
          )}
          <button className="button" onClick={this.handleSignup}>
            Sign Up
          </button>
          <div className="bottomText">
            <p>
              Already have an account?{" "}
              <a className="link" href="/restaurant/login">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default RestaurantSignup;