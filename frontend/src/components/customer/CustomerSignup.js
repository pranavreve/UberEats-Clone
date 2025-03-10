import React, { Component } from "react";
import "./CustomerSignup.css";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import { Navigate } from "react-router-dom";
import { authAPI } from "../../services/api";

class CustomerSignup extends Component {
  state = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    signupError: "",
    signupSuccess: "",
    redirectToHome: false,
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      signupError: "",
    });
  };

  validatePhoneNumber = (phone) => {
    // Simple validation - phone should be at least 10 digits
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  };

  handleSignup = async () => {
    const { first_name, last_name, email, password, phone_number } = this.state;
    
    // Reset messages
    this.setState({ signupError: "", signupSuccess: "" });

    // Validate all fields
    if (!first_name || !last_name || !email || !password || !phone_number) {
      this.setState({ signupError: "Please fill in all required fields." });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.setState({ signupError: "Please enter a valid email address." });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      this.setState({ signupError: "Password must be at least 6 characters long." });
      return;
    }

    // Validate phone number
    if (!this.validatePhoneNumber(phone_number)) {
      this.setState({ signupError: "Please enter a valid phone number (at least 10 digits)." });
      return;
    }

    try {
      // Combine first and last name to match backend expectations
      const fullName = `${first_name} ${last_name}`;
      
      // Show processing message
      this.setState({ signupSuccess: "Processing your registration..." });
      
      // Register using the API service with correct field structure
      const registerResponse = await authAPI.register({
        name: fullName,
        email,
        password,
        phone: phone_number,
        user_type: "customer"
      });

      // Only proceed with login if registration was successful
      if (registerResponse && registerResponse.data && registerResponse.data.success) {
        this.setState({ signupSuccess: "Registration successful! Logging you in..." });
        
        // Login after successful registration
        const loginResponse = await authAPI.login({
          email,
          password
        });

        // Store token in session storage
        sessionStorage.setItem("authToken", loginResponse.data.token);
        sessionStorage.setItem("userType", "customer");
        sessionStorage.setItem("userEmail", email);

        // Short delay before redirect to show success message
        setTimeout(() => {
          this.setState({ redirectToHome: true });
        }, 1000);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      this.setState({ 
        signupSuccess: "",
        signupError: error.response?.data?.message || "Error occurred during signup. Please try again."
      });
    }
  };

  render() {
    const { redirectToHome, signupSuccess, signupError } = this.state;

    if (redirectToHome) {
      return <Navigate to="/customer/home" />;
    }

    return (
      <div className="signup-container">
        <div className="formContainer">
          <img className="logo" src={ubereatslogo} alt="Uber Eats Logo" />
          <h3 className="welcome">Create your customer account</h3>
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="textinput"
            onChange={this.handleInputChange}
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
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
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            className="textinput"
            onChange={this.handleInputChange}
          />
          {signupSuccess && (
            <div className="success-message">{signupSuccess}</div>
          )}
          {signupError && (
            <div className="error-message">{signupError}</div>
          )}
          <button className="button" onClick={this.handleSignup}>
            Sign Up
          </button>
          <div className="bottomText">
            <p>
              Already have an account?{" "}
              <a className="link" href="/customer/login">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default CustomerSignup;