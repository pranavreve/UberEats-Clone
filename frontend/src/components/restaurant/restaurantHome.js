import React, { Component } from "react";
import "./restaurantHome.css";
import axios from "axios";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import dishIcon from "../../Images/bowl.svg";
import Box from "@mui/material/Box";
import NavBar from "../navbar";

class RestaurantHome extends Component {
  state = {
    restaurantDetails: JSON.parse(sessionStorage.getItem("restaurantDetails")),
    dishes: {}, // Stores dishes categorized by type
    loading: true,
    error: null,
    openAddDishModal: false,
    successBanner: false, // State to control success banner visibility
    newDish: {
      name: "",
      description: "",
      price: "",
      category: "",
      ingredients: "",
      image: null
    },
  };

  componentDidMount() {
    const token = sessionStorage.getItem("authToken"); // Updated key
    const userType = sessionStorage.getItem("userType");
    if (token && userType) {
      this.fetchDishes();
    } else {
      window.location.href = "/restaurant/login";
    }
  }

  // Function to fetch restaurant dishes
  fetchDishes = () => {
    this.setState({ loading: true });
    
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/restaurants/menu`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          let dishesByCategory = {};
          
          // Get the dishes data from the response
          // Check if response has the menu property (new API format)
          const dishesData = response.data.menu || response.data;
          
          // If there are dishes, organize them by category
          if (dishesData && dishesData.length > 0) {
            dishesData.forEach((dish) => {
              if (!dishesByCategory[dish.category]) {
                dishesByCategory[dish.category] = [];
              }
              dishesByCategory[dish.category].push(dish);
            });
          }
          
          this.setState({ 
            dishes: dishesByCategory,
            loading: false 
          });
          
          // For debugging
          console.log("Fetched dishes:", dishesData);
          console.log("Categorized dishes:", dishesByCategory);
        }
      })
      .catch((err) => {
        console.log("Error fetching dishes:", err);
        this.setState({ 
          loading: false,
          error: "Failed to load dishes. Please try again later."
        });
      });
  };

  // Handlers for opening and closing the Add Dish modal
  handleOpenAddDishModal = () => {
    this.setState({ openAddDishModal: true });
  };

  handleCloseAddDishModal = () => {
    this.setState({ openAddDishModal: false });
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Handle file input separately
    if (name === "image_url") {
      this.setState({
        newDish: {
          ...this.state.newDish,
          image: event.target.files[0] // Store the actual file object
        },
      });
      return;
    }
    
    this.setState({
      newDish: {
        ...this.state.newDish,
        [name]: value,
      },
    });
  };

  // Function to handle adding a new dish
  handleAddDishSubmit = () => {
    const { newDish } = this.state;

    // Create FormData object to handle file uploads
    const formData = new FormData();
    
    // Add all dish data to the FormData
    formData.append('name', newDish.name);
    formData.append('description', newDish.description);
    formData.append('price', parseFloat(newDish.price));
    formData.append('category', newDish.category);
    formData.append('ingredients', newDish.ingredients);
    
    // Add image file if it exists
    if (newDish.image) {
      formData.append('image_url', newDish.image);
    }

    // Make a direct axios call with the correct headers for multipart/form-data
    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/restaurants/dishes`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 201) {
          // Show success banner and reset form data
          this.setState({
            successBanner: true,
            openAddDishModal: false, // Close the modal
            newDish: { name: "", description: "", price: "", category: "", ingredients: "", image: null },
          });

          // Refresh dishes list
          this.fetchDishes();

          // Hide the success banner after 2 seconds
          setTimeout(() => {
            this.setState({ successBanner: false });
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Error adding dish:", error);
        alert("Failed to add dish. Please try again.");
      });
  };

  renderDishes = () => {
    const { dishes, loading } = this.state;
    const categories = Object.keys(dishes);
    
    // If loading, show a loading message
    if (loading) {
      return <div className="menu-section"><p>Loading menu...</p></div>;
    }
    
    // If no dishes, show a message
    if (categories.length === 0) {
      return (
        <div className="menu-section">
          <h2 className="menu-title">Restaurant Menu</h2>
          <div className="no-dishes-container">
            <p className="no-dishes-message">No dishes have been added to the menu yet.</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="menu-section">
        <h2 className="menu-title">Restaurant Menu</h2>
        <div className="row sticky-header">
          <ul className="category-list">
            {categories.map((category) => (
              <li className="category-item" key={category}>
                <ScrollLink to={category} spy={true} smooth={false} duration={1000}>
                  <label>{category}</label>
                </ScrollLink>
              </li>
            ))}
          </ul>
          <hr className="horizontalRule" />
        </div>
  
        <div style={{ position: "relative" }}>
          {categories.map((category) => (
            <div className="row category-section" id={category} key={category}>
              <label className="categorySubtxt">{category}</label>
  
              {dishes[category].map((dish) => (
                <div className="col-md-4 dish-card-container" key={dish.dish_id}>
                  <Card className="dish-card">
                    <CardContent className="dish-card-content">
                      <div className="dish-header">
                        <div className="dish-name">{dish.name}</div>
                        <div className="dish-price">${dish.price}</div>
                      </div>
                      <div className="dish-description">{dish.description}</div>
                      {dish.ingredients && (
                        <div className="dish-ingredients">
                          <span className="ingredients-label">Ingredients:</span> {dish.ingredients}
                        </div>
                      )}
                    </CardContent>
                    {dish.image_url && (
                      <img src={dish.image_url} alt={dish.name} className="dish-card-media" />
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  render() {
    const { openAddDishModal, newDish, successBanner, restaurantDetails } = this.state;

    return (
      <>
        <NavBar />
        {successBanner && (
          <div style={{ backgroundColor: "green", color: "white", padding: "10px", textAlign: "center" }}>
            Dish Added Successfully
          </div>
        )}
        <div>
          {restaurantDetails && (
            <>
              <div className="imgBck">
                <div className="imgBckspace"></div>
                <div className="imgtxtContainer">
                  <div className="imgtxtCo">
                    <div className="imgtxtleftspace"></div>
                    <div className="imgtxtleftContainer">
                      <div className="spacer_40"></div>
                      <div>
                        <h2 style={{ color: "white", marginBottom: "50px" }}>
                          {restaurantDetails && restaurantDetails.profile && restaurantDetails.profile.location ? 
                            `${restaurantDetails.profile.name || restaurantDetails.name} (${restaurantDetails.profile.location.split(",")[0]})` :
                            restaurantDetails.name}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="imgButtons sticky-add-dish">
                    <button className="priceButton" onClick={this.handleOpenAddDishModal}>
                      <div className="button-content">
                        <img src={dishIcon} alt="Add Dish" className="dish-icon" />
                        <span style={{ cursor: "pointer" }}>Add Dish</span>
                      </div>
                    </button>
                    <Link to="/restaurant/profile" className="priceButton ml-2" style={{ marginLeft: '10px', textDecoration: 'none' }}>
                      <div className="button-content">
                        <span style={{ cursor: "pointer" }}>Manage Profile & Menu</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="content-container">
          {restaurantDetails && restaurantDetails.profile && restaurantDetails.profile.location ? 
            <div className="restaurant-address">{restaurantDetails.profile.location}</div> : 
            (restaurantDetails && restaurantDetails.location && 
              <div className="restaurant-address">{restaurantDetails.location}</div>)
          }
          {this.renderDishes()}
        </div>

        <Modal
          open={openAddDishModal}
          onClose={this.handleCloseAddDishModal}
          aria-labelledby="add-dish-modal"
          aria-describedby="modal-to-add-dish"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <h2>Add New Dish</h2>
            <p style={{ color: 'rgba(0, 0, 0, 0.6)', marginBottom: '16px', fontSize: '14px' }}>
              Enter dish details below. The dish ID will be automatically generated.
            </p>
            <TextField
              label="Dish Name"
              name="name"
              value={newDish.name}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={newDish.description}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Price"
              name="price"
              value={newDish.price}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Category"
              name="category"
              value={newDish.category}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Ingredients"
              name="ingredients"
              value={newDish.ingredients}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <div style={{ marginTop: '16px', marginBottom: '8px' }}>
              <label htmlFor="dish-image" style={{ display: 'block', marginBottom: '8px', color: 'rgba(0, 0, 0, 0.54)', fontSize: '12px' }}>
                Dish Image (Optional)
              </label>
              <input
                id="dish-image"
                name="image_url"
                type="file"
                accept="image/*"
                onChange={this.handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAddDishSubmit}
              fullWidth
              style={{ marginTop: "20px" }}
            >
              Add Dish
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.handleCloseAddDishModal}
              fullWidth
              style={{ marginTop: "10px" }}
            >
              Cancel
            </Button>
          </Box>
        </Modal>
      </>
    );
  }
}

export default RestaurantHome;
