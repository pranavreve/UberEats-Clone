import React, { Component } from "react";
import "./CustomerLogin.css";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import axios from "axios";
import { Navigate, redirect } from "react-router-dom";

class CustomerLogin extends Component {
  state = {
    email: "",
    password: "",
    error: "",
    redirectToHome: false,
  };

  componentDidMount() {
    // Check if the user is logged in by verifying the token in session storage
    const token = sessionStorage.getItem("authToken"); // Updated key
    const userType = sessionStorage.getItem("userType");
    if (token && userType) {
      // Navigate to home page if the customer is already logged in
      window.location.href = "/customer/home";
    }
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLogin = () => {
    const { email, password } = this.state;
    axios
      .post(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/login/`, {
        email,
        password,
      })
      .then((response) => {
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("userType", "customer");

        // Fetch customer details
        axios
          .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/profile/`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`,
            },
          })
          .then((res) => {
            sessionStorage.setItem("customerDetails", JSON.stringify(res.data));
            this.setState({ redirectToHome: true });
          })
          .catch((error) => {
            this.setState({ error: "Failed to fetch customer details" });
          });
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.error || "Invalid email or password";
        this.setState({ error: errorMsg });
      });
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
