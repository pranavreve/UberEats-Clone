// src/components/LandingPage.js
import React, { Component } from "react";
import img1 from "../../Images/img1.svg";
import img2 from "../../Images/img2.svg";
import uberLogo from "../../Images/UberEatsLogo.png";
import "./LandingPage.css";
import { Navigate } from "react-router-dom";

class LandingPage extends Component {
  state = {
    redirectToRestaurants: false,
    redirectToUsers: false,
  };

  handleRestaurantLogin = () => {
    this.setState({ redirectToRestaurants: true });
  };

  handleUserLogin = () => {
    this.setState({ redirectToUsers: true });
  };

  render() {
    const { redirectToRestaurants, redirectToUsers } = this.state;

    // Redirect to the restaurant login page
    if (redirectToRestaurants) {
      return <Navigate to="/restaurant/login" />;
    }

    // Redirect to the customer login page
    if (redirectToUsers) {
      return <Navigate to="/customer/login" />;
    }

    return (
      <div className="landing-container">
        <div className="banner-container">
          <img alt="Order food to your door" role="img" src={img1} className="banner-img" />
          <img alt="Order food to your door" role="img" src={img2} className="banner-img" />
        </div>
        <div className="logo-container">
          <img src={uberLogo} alt="Uber Eats Logo" className="uber-logo" />
          <h1 className="headline">Order food to your door</h1>
        </div>
        <div className="buttons-container">
          <button className="btn btn-user" onClick={this.handleUserLogin}>
            Sign in as User
          </button>
          <button className="btn btn-restaurant" onClick={this.handleRestaurantLogin}>
            Sign in as Restaurants
          </button>
        </div>
      </div>
    );
  }
}

export default LandingPage;
