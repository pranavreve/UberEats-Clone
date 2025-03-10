import React, { Component } from "react";
import "./CustomerLogin.css";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import { Navigate } from "react-router-dom";
import { authAPI, customerAPI } from "../../services/api";

class CustomerLogin extends Component {
  state = {
    email: "",
    password: "",
    error: "",
    redirectToHome: false,
  };

  componentDidMount() {
    // Check if the user is logged in by verifying the token in session storage
    const token = sessionStorage.getItem("authToken");
    const userType = sessionStorage.getItem("userType");
    if (token && userType) {
      // Navigate to home page if the customer is already logged in
      window.location.href = "/customer/home";
    }
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLogin = async () => {
    const { email, password } = this.state;
    
    try {
      // Use the updated API service for login
      const loginResponse = await authAPI.login({
        email,
        password
      });
      
      // Store the token
      sessionStorage.setItem("authToken", loginResponse.data.token);
      sessionStorage.setItem("userType", "customer");

      // Fetch customer profile using the new API
      try {
        const profileResponse = await customerAPI.getProfile();
        sessionStorage.setItem("customerDetails", JSON.stringify(profileResponse.data));
        this.setState({ redirectToHome: true });
      } catch (profileError) {
        this.setState({ error: "Failed to fetch customer details" });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid email or password";
      this.setState({ error: errorMsg });
    }
  };

  render() {
    const { email, password, error, redirectToHome } = this.state;

    if (redirectToHome) {
      return <Navigate to="/customer/home" />;
    }

    return (
      <div className="login-container">
        <div className="form-container">
          <img className="logo" alt="Uber Eats Logo" src={ubereatslogo} />
          <h3 className="welcome">Welcome back</h3>
          <label className="label-text">
            Sign in with your email address.
          </label>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={email}
            onChange={this.handleInputChange}
            className="text-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={this.handleInputChange}
            className="text-input"
          />
          {error && <div className="error-message">{error}</div>}
          <button onClick={this.handleLogin} className="button">
            LOGIN
          </button>
          <div className="bottomText">
            <p className="display--inline">
              New to Uber?{" "}
              <a className="link" href="/customer/signup">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default CustomerLogin;