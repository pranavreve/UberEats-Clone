import React, { Component } from "react";
import Navbar from "../navbar";
import CustomerFooter from "../footer/customerFooter";
import "./CustomerHome.css";
import axios from "axios";
import { HeartFilled } from "@ant-design/icons";
import withRouter from '../withRouter.js';

class CustomerFavorites extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: [],
      favoriteRestaurants: [],
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchFavorites();
  }

  fetchFavorites = () => {
    const token = sessionStorage.getItem("authToken");
    
    if (!token) {
      this.setState({ 
        isLoading: false,
        error: "Please login to view your favorites" 
      });
      return;
    }
    
    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          console.log("Favorites response:", response.data);
          
          let favorites = [];
          
          // Handle both response formats
          if (response.data.favorites && Array.isArray(response.data.favorites)) {
            favorites = response.data.favorites;
          } else if (Array.isArray(response.data)) {
            favorites = response.data;
          }
          
          this.setState({ favorites });
          
          // If we have favorites, fetch the details for each restaurant
          if (favorites && favorites.length > 0) {
            this.fetchFavoriteRestaurantDetails(favorites);
          } else {
            this.setState({ isLoading: false });
          }
        } else {
          this.setState({ 
            isLoading: false,
            error: "Failed to fetch favorites" 
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching favorites:", error.response?.data || error.message);
        this.setState({ 
          isLoading: false,
          error: "Failed to fetch favorites: " + (error.response?.data?.message || error.message)
        });
      });
  };
  
  fetchFavoriteRestaurantDetails = (favorites) => {
    const token = sessionStorage.getItem("authToken");
    
    // Fetch all restaurants first
    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const allRestaurants = response.data.restaurants || response.data;
          
          // Filter to only include favorite restaurants
          const favoriteRestaurants = allRestaurants.filter(restaurant => 
            favorites.some(fav => fav.restaurant_id === restaurant.restaurant_id)
          );
          
          this.setState({ favoriteRestaurants, isLoading: false });
        }
      })
      .catch((err) => {
        console.error("Error fetching restaurant details:", err);
        this.setState({
          isLoading: false,
          error: "Failed to fetch restaurant details. Please try again."
        });
      });
  }
  
  removeFavorite = (restaurantId) => {
    const token = sessionStorage.getItem("authToken");
    
    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites/remove`, 
        { restaurant_id: parseInt(restaurantId) }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200 && response.data.success) {
          console.log(`Successfully removed restaurant ${restaurantId} from favorites`);
          
          // Update the state to reflect the change
          const updatedFavorites = this.state.favorites.filter(
            fav => fav.restaurant_id !== restaurantId
          );
          const updatedFavoriteRestaurants = this.state.favoriteRestaurants.filter(
            restaurant => restaurant.restaurant_id !== restaurantId
          );
          
          this.setState({ 
            favorites: updatedFavorites,
            favoriteRestaurants: updatedFavoriteRestaurants
          });
        } else {
          console.error("Failed to remove from favorites:", response.data);
        }
      })
      .catch((err) => {
        console.error("Error removing favorite:", err.response?.data || err.message);
        alert("Failed to remove from favorites. Please try again.");
      });
  }
  
  redirectToRestaurant = (restaurantId) => {
    console.log("Redirecting to restaurant:", restaurantId);
    if (!restaurantId) {
      console.error("No restaurant ID provided for redirection");
      return;
    }

    // Construct the API URL
    const apiUrl = `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants/${restaurantId}`;
    
    // Get the auth token
    const token = sessionStorage.getItem("authToken");
    
    // Fetch the restaurant data before redirecting
    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch restaurant data: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Successfully fetched restaurant data:", data);
      
      // Store the restaurant data in sessionStorage
      sessionStorage.setItem('restaurantData', JSON.stringify(data));
      
      // Navigate to the restaurant page
      window.location.href = `/customer/restaurant/${restaurantId}`;
    })
    .catch(error => {
      console.error("Error fetching restaurant data:", error);
      alert("Error loading restaurant details. Please try again.");
    });
  };

  renderFavoriteRestaurants = () => {
    const { favoriteRestaurants } = this.state;
    
    if (!favoriteRestaurants || favoriteRestaurants.length === 0) {
      return (
        <div className="no-favorites">
          <h3>No Favorite Restaurants</h3>
          <p>You haven't added any restaurants to your favorites yet.</p>
          <p>Browse restaurants and click the heart icon to add them to your favorites.</p>
        </div>
      );
    }
    
    return (
      <div className="restaurant-grid">
        {favoriteRestaurants.map((restaurant) => (
          <div key={restaurant.restaurant_id} className="restaurant-card">
            <div 
              className="restaurant-card-content"
              onClick={() => this.redirectToRestaurant(restaurant.restaurant_id)}
            >
              <img
                src={restaurant.profile_image || restaurant.profile_picture || require("../../Images/rest.jpeg")}
                alt={restaurant.name}
                className="restaurant-image"
              />
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p className="restaurant-location">{restaurant.location}</p>
                {restaurant.cuisine && (
                  <p className="restaurant-cuisine">{restaurant.cuisine}</p>
                )}
              </div>
            </div>
            <button 
              className="remove-favorite-btn"
              onClick={(e) => {
                e.stopPropagation();
                this.removeFavorite(restaurant.restaurant_id);
              }}
              aria-label="Remove from favorites"
            >
              <HeartFilled className="favorite-icon-filled" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { isLoading, error } = this.state;
    
    return (
      <div className="customer-home-container">
        <Navbar />
        <div className="favorites-container">
          <div className="favorites-header">
            <h1>Your Favorite Restaurants</h1>
          </div>
          
          {isLoading ? (
            <div className="loading">Loading your favorites...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            this.renderFavoriteRestaurants()
          )}
        </div>
        <CustomerFooter />
      </div>
    );
  }
}

export default withRouter(CustomerFavorites);
