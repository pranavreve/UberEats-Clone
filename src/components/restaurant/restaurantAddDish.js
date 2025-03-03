import React, { Component } from "react";
import "./restaurantAddDish.css";
import axios from "axios";
import { Navigate } from "react-router-dom";

class RestaurantAddDish extends Component {
  state = {
    name: "",
    description: "",
    dish_price: 0.0,
    dish_category: "-1",
    image: null,
    imagePreviewUrl: "",
    redirectToHome: false,
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      this.setState({ image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({ imagePreviewUrl: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Only JPEG and PNG files are allowed.");
    }
  };

  submit = () => {
    const {
      name,
      description,
      dish_price,
      dish_category,
      image,
    } = this.state;

    if (!name || dish_category === "-1" || !description) {
      alert("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", dish_price);
    formData.append("category", dish_category);
    formData.append(
      "restaurant",
      JSON.parse(sessionStorage.getItem("restaurantDetails")).id
    );
    if (image) {
      formData.append("image", image);
    }

    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/add_dish/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 201) {
          alert("Dish added successfully");
          this.setState({ redirectToHome: true });
        }
      })
      .catch((err) => {
        console.log("Error adding dish: ", err);
      });
  };

  render() {
    if (this.state.redirectToHome) {
      return <Navigate to="/restaurant/home" />;
    }

    return (
      <div className="container">
        <div className="formC">
          <div className="innerformC">
            <div className="row">
              <label>
                <h3>Add Dish to the Menu</h3>
              </label>
            </div>
            <div className="row" style={{ marginLeft: "5%" }}>
              <div className="col-md-6">
                <input
                  className="txtbox marginTop25"
                  name="name"
                  value={this.state.name}
                  placeholder="Dish name"
                  onChange={this.handleChange}
                />
                <select
                  className="txtbox marginTop25"
                  name="dish_category"
                  value={this.state.dish_category}
                  onChange={this.handleChange}
                >
                  <option value="-1">Select Category</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                </select>
                <textarea
                  className="txtareas marginTop20"
                  name="description"
                  value={this.state.description}
                  placeholder="Description"
                  rows="4"
                  onChange={this.handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  className="txtbox marginTop25"
                  name="dish_price"
                  value={this.state.dish_price}
                  type="number"
                  placeholder="Price"
                  min="1"
                  onChange={this.handleChange}
                />
                <label className="custom-file-upload marginTop25">
                  <input
                    type="file"
                    className="uploadbtn"
                    onChange={this.handleImageChange}
                  />
                  Upload Image
                </label>
                {this.state.imagePreviewUrl && (
                  <img
                    src={this.state.imagePreviewUrl}
                    alt="Dish Preview"
                    style={{ width: "100px", height: "100px" }}
                  />
                )}
              </div>
              <div className="col-md-12">
                <button className="btnn" onClick={this.submit}>
                  Add Dish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RestaurantAddDish;
