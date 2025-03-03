import React, { Component } from "react";
import "./restaurantSignup.css";
import axios from "axios";
import ubereatslogo from "../../Images/UberEatsLogo.png";
import { Navigate } from "react-router-dom";

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

  handleSignup = () => {
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

    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/signup/`,
        {
          name,
          email,
          password,
          location,
          contact,
          start_time,
          end_time,
        }
      )
      .then((response) => {
        if (response.status === 201) {
          // Automatically log in the restaurant
          axios
            .post(
              `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/login/`,
              { email, password }
            )
            .then((loginResponse) => {
              sessionStorage.setItem("authToken", loginResponse.data.token);
              sessionStorage.setItem("userType", "restaurant");
              // Fetch restaurant details
              axios
                .get(
                  `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/profile/`,
                  {
                    headers: {
                      Authorization: `Bearer ${loginResponse.data.token}`,
                    },
                  }
                )
                .then((profileResponse) => {
                  sessionStorage.setItem(
                    "restaurantDetails",
                    JSON.stringify(profileResponse.data)
                  );
                  this.setState({ redirectToHome: true });
                })
                .catch((error) => {
                  this.setState({
                    signupError: "Failed to fetch restaurant details.",
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
