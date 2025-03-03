import React, { Component } from "react";
import axios from "axios";
import "./customerDetails.css";
import { Navigate } from "react-router-dom";
import Navbar from "../navbar"; // Assuming navbar.js is the common navbar component
import NavBar from "../navbar";
import CustomerFooter from "../footer/customerFooter";


class CustomerDetails extends Component {
  state = {
    first_name: "",
    last_name: "",
    phone_number: "",
    avatar: "",
    selectedFile: null,
    redirectToHome: false,
    errors: {},
    customer_id: 0
  };

  componentDidMount() {
    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/profile/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      })
      .then((response) => {
        const data = response.data;
        this.setState({
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          avatar: data.avatar,
          customer_id: data.id
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value, errors: { ...this.state.errors, [name]: "" } });
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ selectedFile: file });
  };

  handleProfileUpdate = () => {
    const { first_name, last_name, phone_number, selectedFile } = this.state;

    if (!first_name || !last_name || !phone_number) {
      this.setState({ errors: { form: "Please fill in all required fields." } });
      return;
    }

    const updateData = {
      first_name,
      last_name,
      phone_number,
    };

    const updateProfile = () => {
      axios
        .put(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/${this.state.customer_id}/update/`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        )
        .then((response) => {
          sessionStorage.setItem("customerDetails", JSON.stringify(response.data));
          this.setState({ redirectToHome: true });
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      axios
        .post(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/upload/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 201) {
            updateData.avatar = res.data.location;
            updateProfile();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      updateProfile();
    }
  };

  render() {
    const { redirectToHome, errors } = this.state;

    if (redirectToHome) {
      return <Navigate to="/customer/home" />;
    }

    return (
      <div className="container">
        <NavBar/>
        <div className="formC">
          <div className="innerformC">
            <div className="row" style={{ textAlign: "center" }}>
              <label>
                <h4>Profile Details</h4>
              </label>
            </div>
            <div className="row" style={{ marginLeft: "5%" }}>
              <div className="col-md-6">
                <input
                  className="txtbox marginTop25"
                  name="first_name"
                  value={this.state.first_name}
                  placeholder="First Name"
                  onChange={this.handleInputChange}
                />
                <input
                  className="txtbox marginTop25"
                  name="last_name"
                  value={this.state.last_name}
                  placeholder="Last Name"
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  className="txtbox marginTop25"
                  name="phone_number"
                  value={this.state.phone_number}
                  placeholder="Phone Number"
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="col-md-12">
                {errors.form && <div className="error-message">{errors.form}</div>}
                <button className="btnn" onClick={this.handleProfileUpdate}>
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        <CustomerFooter/>
      </div>
    );
  }
}

export default CustomerDetails;
