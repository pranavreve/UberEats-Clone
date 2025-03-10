import React, { Component } from "react";
import "./restaurantLogin.css";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import { Navigate } from "react-router-dom";
import { authAPI, restaurantAPI } from "../../services/api";

class RestaurantLogin extends Component {
  state = {
    email: "",
    password: "",
    loginError: "",
    redirectToHome: false,
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  componentDidMount() {
    // Check if the user is logged in by verifying the token in session storage
    const token = sessionStorage.getItem("authToken");
    const userType = sessionStorage.getItem("userType");
    if (token && userType) {
      // Navigate to home page if the restaurant is already logged in
      window.location.href = "/restaurant/home";
    }
  }

  handleLogin = async () => {
    try {
      // Login using the updated API service
      const loginResponse = await authAPI.login({
        email: this.state.email,
        password: this.state.password,
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
        
        // Redirect to home page
        this.setState({ redirectToHome: true });
      } catch (profileError) {
        this.setState({ loginError: "Failed to fetch restaurant details" });
      }
    } catch (error) {
      this.setState({
        loginError: "Invalid email or password. Please try again.",
      });
    }
  };

  render() {
    const { redirectToHome } = this.state;

    if (redirectToHome) {
      return <Navigate to="/restaurant/home" />;
    }

    return (
      <div className="login-container">
        <div className="mainContainer">
          <img className="logo" src={ubereatslogo} alt="Uber Eats Logo" />
          <h3 className="welcome">Welcome back</h3>
          <label className="label">
            Sign in with your email address
          </label>
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
          {this.state.loginError && (
            <div className="error-message">{this.state.loginError}</div>
          )}
          <button className="button" onClick={this.handleLogin}>
            Login
          </button>
          <div className="bottomText">
            <p>
              New to Uber?{" "}
              <a className="link" href="/restaurant/signup">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default RestaurantLogin;