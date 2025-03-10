import React, { Component } from "react";
import "./CustomerSignup.css";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import { Navigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import axios from "axios";

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
      // First, create the user account
      const signupData = {
        name: `${first_name} ${last_name}`,
        email,
        password,
        phone: phone_number,
        user_type: 'customer' // Explicitly specify user type
      };

      // Sign up
      const signupResponse = await axios.post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/auth/register`,
        signupData
      );

      if (signupResponse.status === 201 || signupResponse.status === 200) {
        // Login immediately after successful signup
        const loginResponse = await axios.post(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/auth/login`,
          {
            email,
            password
          }
        );

        if (loginResponse.data.token) {
          const token = loginResponse.data.token;
          
          // Store auth token and user type
          sessionStorage.setItem("authToken", token);
          sessionStorage.setItem("userType", "customer");

          // Fetch customer profile with the token
          const profileResponse = await axios.get(
            `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (profileResponse.data.success) {
            // Store profile data
            sessionStorage.setItem("customerDetails", JSON.stringify(profileResponse.data.profile));
            
            // Show success message briefly before redirect
            this.setState({ 
              signupSuccess: "Registration successful! Redirecting...",
              signupError: ""
            });

            // Redirect after a short delay
            setTimeout(() => {
              this.setState({ redirectToHome: true });
            }, 1500);
          } else {
            throw new Error("Failed to fetch profile");
          }
        } else {
          throw new Error("Login failed after signup");
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      let errorMsg = "Error occurred during signup.";
      
      if (error.response) {
        errorMsg = error.response.data.message || 
                  error.response.data.error || 
                  error.response.data.errors?.[0]?.msg ||
                  "Registration failed. Please try again.";
      }
      
      this.setState({ 
        signupError: errorMsg,
        signupSuccess: ""
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