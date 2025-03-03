import React, { Component } from "react";
import "./restaurantDetails.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import NavBar from "../navbar";

class RestaurantDetails extends Component {
  state = {
    redirectToHome: false,
    name: "",
    location: "",
    email: "",
    password: "",
    deliveryType: "",
    contact: "",
    start_time: "",
    end_time: "",
    selectedFile: null,
    errors: {},
    id: null,
  };

  componentDidMount() {
    const restaurantDetails = JSON.parse(
      sessionStorage.getItem("restaurantDetails")
    );
    if (restaurantDetails) {
      axios
        .get(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/${restaurantDetails.id}/`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        )
        .then((response) => {
          const data = response.data;
          const start_time = response.data.timings ? response.data.timings.split("-")[0].trim() : "";
          const end_time = response.data.timings ? response.data.timings.split("-")[1].trim() : "";
          console.log("response", response.data.timings, start_time, end_time);
          this.setState({
            name: data.name,
            location: data.location,
            email: data.email,
            contact: data.contact_info,
            start_time: start_time,
            end_time: end_time,
            deliveryType: data.delivery_type,
            id: data.id,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errors: { ...this.state.errors, [e.target.name]: "" },
    });
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ selectedFile: file, selectedFileError: "" });
  };

  validateForm = () => {
    const errors = {};
    const {
      name,
      location,
      deliveryType,
      contact,
      start_time,
      end_time,
    } = this.state;

    if (!name) errors.name = "Enter a store name";
    if (!location) errors.location = "Enter a valid store address";
    if (deliveryType === "-1") errors.deliveryType = "Select delivery type";
    if (!contact || isNaN(contact) || contact.length > 10)
      errors.contact = "Enter valid contact number";
    if (!start_time)errors.start_time = "Select a start time";
    if (!end_time) errors.end_time = "Select an end time";

    console.log("start_time", start_time, "end_time", end_time);
    if (
      start_time &&
      end_time
    )
    {
      const start = start_time.split(":");
      const end = end_time.split(":");

      if(start[0] > end[0] || (start[0] === end[0] && start[1] > end[1]))
      {
        errors.start_time = "Start time should be before end time";
      }
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  submit = () => {
    if (!this.validateForm()) {
      return;
    }

    const {
      name,
      location,
      deliveryType,
      contact,
      start_time,
      end_time,
      selectedFile,
      id,
    } = this.state;

    const details = {
      name,
      location,
      delivery_type: deliveryType,
      contact,
      start_time,
      end_time,
    };

    const updateDetails = () => {
      axios
        .put(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/${id}/update/`,
          details,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        )
        .then((response) => {
          sessionStorage.setItem("restaurantDetails", JSON.stringify(response.data));
          this.setState({ redirectToHome: true });
        })
        .catch((err) => {
          console.log(err);
        });
    };

    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);
      axios
        .post(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/upload/`,
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
            details.image_url = res.data.location;
            updateDetails();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      updateDetails();
    }
  };

  render() {
    if (this.state.redirectToHome) {
      return <Navigate to="/restaurant/home" />;
    }

    const { errors } = this.state;

    return (
      <div>
      <NavBar/>
        <div className="container">
          <div className="formC">
            <div className="innerformC">

              <div className="row" style={{ textAlign: "center" }}>
                <label>
                  <h4>Restaurant Details</h4>
                </label>
              </div>
              <div className="row" style={{ marginLeft: "5%" }}>
                <div className="col-md-6">
                  <input
                    className="txtbox marginTop25"
                    name="name"
                    value={this.state.name}
                    placeholder="Restaurant Name"
                    onChange={this.handleInputChange}
                  />
                  {errors.name && <label className="errtext">{errors.name}</label>}

                  <input
                    className="txtbox marginTop20"
                    name="location"
                    value={this.state.location}
                    placeholder="Address"
                    onChange={this.handleInputChange}
                  />
                  {errors.location && (
                    <label className="errtext">{errors.location}</label>
                  )}

                </div>
                <div className="col-md-6">
                  <select
                    className="txtbox marginTop25"
                    name="deliveryType"
                    value={this.state.deliveryType}
                    onChange={this.handleInputChange}
                  >
                    <option value="-1">Select Delivery Type</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Both">Both</option>
                  </select>
                  {errors.deliveryType && (
                    <label className="errtext">{errors.deliveryType}</label>
                  )}

                  <input
                    className="txtbox marginTop20"
                    name="contact"
                    value={this.state.contact}
                    placeholder="Contact Number"
                    onChange={this.handleInputChange}
                  />
                  {errors.contact && (
                    <label className="errtext">{errors.contact}</label>
                  )}

                  <input
                    className="txtbox marginTop20"
                    type="time"
                    name="start_time"
                    value={this.state.start_time}
                    placeholder="Start Time"
                    onChange={this.handleInputChange}
                  />
                  {errors.start_time && (
                    <label className="errtext">{errors.start_time}</label>
                  )}

                  <input
                    className="txtbox marginTop20"
                    type="time"
                    name="end_time"
                    value={this.state.end_time}
                    placeholder="End Time"
                    onChange={this.handleInputChange}
                  />
                  {errors.end_time && (
                    <label className="errtext">{errors.end_time}</label>
                  )}

                  <label className="custom-file-upload marginTop20">
                    <input
                      type="file"
                      className="uploadbtn"
                      onChange={this.handleFileChange}
                    />
                    Upload Image
                  </label>
                </div>
                <div className="col-md-12">
                  <button className="btnn" onClick={this.submit}>
                    Submit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RestaurantDetails;
