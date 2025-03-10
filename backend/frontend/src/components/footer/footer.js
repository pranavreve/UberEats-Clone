import React, { Component } from "react";
import "./footer.css";

class Footer extends Component {
  render() {
    return (
      <div className="footer">
        <div className="container-fluid">
          <div className="row">
            <div
              style={{ textAlign: "left", color: "white" }}
              className="col-md-6 txt"
            >
              &copy; 2021 Uber Technologies, Inc.
            </div>
            <div
              style={{ textAlign: "right", color: "white" }}
              className="col-md-6 txt"
            >
              Privacy Policy | Terms of Use
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;
