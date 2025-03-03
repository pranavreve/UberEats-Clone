// import React, { Component } from "react";
// import ubereatslogo from "../../Images/UberEatsWhite.png";
// import "./customerFooter.css";

// class CustomerFooter extends Component {
//   render() {
//     return (
//       <div className="footer">
//         <div className="container" style={{ marginTop: "35px" }}>
//           <div className="row">
//             <div className="col-md-3">
//               <img className="uberlogo" src={ubereatslogo} alt="Uber Eats Logo" />
//             </div>
//           </div>
//           <div className="row">
//             <div className="col-md-3">
//               <ul className="footer-links">
//                 <li>Get Help</li>
//                 <li>Buy gift cards</li>
//                 <li>Add your restaurant</li>
//                 <li>Sign up to deliver</li>
//                 <li>Create a business account</li>
//               </ul>
//             </div>
//             <div className="col-md-3">
//               <ul className="footer-links">
//                 <li>Restaurants near me</li>
//                 <li>View all cities</li>
//                 <li>View all countries</li>
//                 <li>Pickup near me</li>
//                 <li>About Uber Eats</li>
//                 <li>Shop groceries</li>
//               </ul>
//             </div>
//           </div>
//           <div className="row">
//             <div className="col-md-3">
//               <a
//                 href="https://apps.apple.com/us/app/uber-eats-food-delivery/id1058959277"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <img
//                   src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/app-store-apple-f1f919205b.svg"
//                   alt="Download on App Store"
//                   className="store-img"
//                 />
//               </a>
//             </div>
//             <div className="col-md-3">
//               <a
//                 href="https://play.google.com/store/apps/details?id=com.ubercab.eats&hl"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <img
//                   src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/app-store-google-4d63c31a3e.svg"
//                   alt="Get it on Google Play"
//                   className="store-img"
//                 />
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
// export default CustomerFooter;

import React, { Component } from "react";
import ubereatslogo from "../../Images/UberEatsWhite.png";
import "./customerFooter.css";

class CustomerFooter extends Component {
  render() {
    return (
      <div className="footer">
        <div className="container" style={{ marginTop: "35px" }}>
          <div className="row">
            <div className="col-md-3 d-flex flex-column align-items-start">
              <img className="uberlogo" src={ubereatslogo} alt="Uber Eats Logo" />
              <div className="store-links mt-3">
                <a
                  href="https://apps.apple.com/us/app/uber-eats-food-delivery/id1058959277"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/app-store-apple-f1f919205b.svg"
                    alt="Download on App Store"
                    className="store-img"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.ubercab.eats&hl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2"
                >
                  <img
                    src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/app-store-google-4d63c31a3e.svg"
                    alt="Get it on Google Play"
                    className="store-img"
                  />
                </a>
              </div>
            </div>
            <div className="col-md-3">
              <ul className="footer-links">
                <li>Get Help</li>
                <li>Buy gift cards</li>
                <li>Add your restaurant</li>
                <li>Sign up to deliver</li>
                <li>Create a business account</li>
              </ul>
            </div>
            <div className="col-md-3">
              <ul className="footer-links">
                <li>Restaurants near me</li>
                <li>View all cities</li>
                <li>View all countries</li>
                <li>Pickup near me</li>
                <li>About Uber Eats</li>
                <li>Shop groceries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CustomerFooter;
