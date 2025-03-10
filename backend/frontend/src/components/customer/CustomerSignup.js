import React, { Component } from "react";
import "./CustomerSignup.css";
import axios from "axios";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import { Navigate } from "react-router-dom";

class CustomerSignup extends Component {
  state = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    signupError: "",
    redirectToHome: false,
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      signupError: "",
    });
  };

  handleSignup = () => {
    const { first_name, last_name, email, password, phone_number } = this.state;

    if (!first_name || !last_name || !email || !password || !phone_number) {
      this.setState({ signupError: "Please fill in all required fields." });
      return;
    }
    const baseURL = process.env.REACT_APP_UBEREATS_BACKEND_URL.replace(/\/$/, '');

    // Path does not start with a slash
    const path = 'customer/signup/';

    // Construct the full URL
    const fullURL = `${baseURL}/${path}`;

    // Log the full URL to verify
    console.log('Signup URL:', fullURL);

    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/signup/`,
        {
          first_name,
          last_name,
          email,
          password,
          phone_number,
        }
      )
      .then((response) => {
        if (response.status === 201) {
          // Automatically log in the customer
          axios
            .post(
              `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/login/`,
              { email, password }
            )
            .then((loginResponse) => {
              sessionStorage.setItem("authToken", loginResponse.data.token);
              sessionStorage.setItem("userType", "customer");
              // Fetch customer details
              axios
                .get(
                  `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/profile/`,
                  {
                    headers: {
                      Authorization: `Bearer ${loginResponse.data.token}`,
                    },
                  }
                )
                .then((profileResponse) => {
                  sessionStorage.setItem(
                    "customerDetails",
                    JSON.stringify(profileResponse.data)
                  );
                  this.setState({ redirectToHome: true });
                })
                .catch((error) => {
                  this.setState({
                    signupError: "Failed to fetch customer details.",
                  });
                });
            })
            .catch((error) => {
              this.setState({ signupError: "Failed to log in after signup." });
            });
        }
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.error || "Error occurred during signup.";
        this.setState({ signupError: errorMsg });
      });
  };

  render() {
    const { redirectToHome } = this.state;

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
          {this.state.signupError && (
            <div className="error-message">{this.state.signupError}</div>
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
