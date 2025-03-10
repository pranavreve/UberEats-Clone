import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import "./customerFooter.css";

class CustomerFooter extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-section">
              <div className="footer-logo">
                <Link to="/" className="logo-text">
                  <span className="uber">Uber</span>
                  <span className="eats">Eats</span>
                </Link>
              </div>
              <div className="app-stores">
                <a
                  href="https://apps.apple.com/us/app/uber-eats-food-delivery/id1058959277"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-button"
                >
                  <img
                    src="https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/783bb4a82e5be29e.svg"
                    alt="Download on App Store"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.ubercab.eats"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-button"
                >
                  <img
                    src="https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/163bdc9b0f1e7c9e.png"
                    alt="Get it on Google Play"
                  />
                </a>
              </div>
            </div>

            <div className="footer-links-section">
              <div className="footer-column">
                <h3>Get Help</h3>
                <ul>
                  <li><a href="#">Add your restaurant</a></li>
                  <li><a href="#">Sign up to deliver</a></li>
                  <li><a href="#">Create a business account</a></li>
                  <li><a href="#">Promotions</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h3>Restaurants</h3>
                <ul>
                  <li><a href="#">Restaurants near me</a></li>
                  <li><a href="#">View all cities</a></li>
                  <li><a href="#">View all countries</a></li>
                  <li><a href="#">Pickup near me</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h3>Uber Eats</h3>
                <ul>
                  <li><a href="#">About Uber Eats</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms</a></li>
                  <li><a href="#">Pricing</a></li>
                  <li><a href="#">Do not sell my info</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="social-links">
              <a href="https://facebook.com/ubereats" target="_blank" rel="noopener noreferrer">
                <FacebookOutlined />
              </a>
              <a href="https://twitter.com/ubereats" target="_blank" rel="noopener noreferrer">
                <TwitterOutlined />
              </a>
              <a href="https://instagram.com/ubereats" target="_blank" rel="noopener noreferrer">
                <InstagramOutlined />
              </a>
            </div>
            <div className="footer-info">
              <div className="copyright">
                © {new Date().getFullYear()} Uber Technologies Inc.
              </div>
              <div className="legal-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Pricing</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default CustomerFooter;
