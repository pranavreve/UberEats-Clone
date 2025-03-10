import React, { Component } from "react";
import Navbar from "../navbar";
import CustomerFooter from "../footer/customerFooter";
import "./CustomerHome.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Radio, Space, Input } from "antd";
import { HeartOutlined, HeartFilled, SearchOutlined } from "@ant-design/icons";
import deals from "../../Images/deals.png";
import RestaurantCard from "../restaurant/restaurantCard";
import { Carousel } from 'antd';

// Define cuisine types for restaurants
const cuisineTypes = {
  1: "Italian",
  2: "Mexican",
  3: "Chinese",
  4: "Indian",
  5: "Japanese",
  6: "American",
  7: "Thai",
  8: "Mediterranean",
  9: "Vietnamese",
  10: "Korean"
};

class CustomerHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deliveryType: "",
      searchQuery: "",
      restaurants: [],
      filteredRestaurants: [],
      redirectToRestaurant: false,
      selectedRestaurantId: null,
      favorites: [],
    };
  }

  componentDidMount() {
    this.fetchRestaurants();
    this.fetchFavorites();
  }

  fetchRestaurants = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Assign random cuisine types to restaurants if they don't have one
      const restaurantsWithCuisine = response.data.restaurants.map(restaurant => ({
        ...restaurant,
        cuisine: restaurant.cuisine || cuisineTypes[Math.floor(Math.random() * 10) + 1]
      }));

      this.setState({
        restaurants: restaurantsWithCuisine,
        filteredRestaurants: restaurantsWithCuisine
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  fetchFavorites = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      this.setState({
        favorites: response.data.favorites.map(fav => fav.restaurant_id)
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  handleDeliveryTypeChange = (e) => {
    const deliveryType = e.target.value;
    this.setState({ deliveryType }, this.filterRestaurants);
  };

  handleSearchChange = (e) => {
    const searchQuery = e.target.value;
    this.setState({ searchQuery }, this.filterRestaurants);
  };

  filterRestaurants = () => {
    const { restaurants, deliveryType, searchQuery } = this.state;
    let filtered = [...restaurants];

    if (deliveryType) {
      filtered = filtered.filter(
        (restaurant) => restaurant.delivery_type === deliveryType
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.cuisine.toLowerCase().includes(query)
      );
    }

    this.setState({ filteredRestaurants: filtered });
  };

  redirectToRestaurant = (id) => {
    this.setState({
      redirectToRestaurant: true,
      selectedRestaurantId: id,
    });
  };

  toggleFavorite = async (restaurantId, e) => {
    e.stopPropagation();
    try {
      const token = sessionStorage.getItem("authToken");
      const isFavorite = this.state.favorites.includes(restaurantId);
      
      if (isFavorite) {
        await axios.delete(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.setState(prevState => ({
          favorites: prevState.favorites.filter(id => id !== restaurantId)
        }));
      } else {
        await axios.post(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites`,
          { restaurant_id: restaurantId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.setState(prevState => ({
          favorites: [...prevState.favorites, restaurantId]
        }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  renderCarousel = () => {
    const carouselImages = [
      { src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', alt: 'Pizza' },
      { src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2', alt: 'Pasta' },
      { src: 'https://images.unsplash.com/photo-1550317138-10000687a72b', alt: 'Sushi' },
      { src: 'https://images.unsplash.com/photo-1543353071-873f17a7a088', alt: 'Salad' }
    ];
    
    return (
      <div className="carousel-section">
        <Carousel autoplay autoplaySpeed={3000} dots>
          {carouselImages.map((image, index) => (
            <div key={index}>
              <img src={image.src} alt={image.alt} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
            </div>
          ))}
        </Carousel>
      </div>
    );
  };

  renderRestaurants = () => {
    const { filteredRestaurants, restaurants, favorites } = this.state;
    const restaurantsToShow = filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;

    if (restaurantsToShow.length === 0) {
      return (
        <div className="no-restaurants-message">
          No restaurants found.
        </div>
      );
    }

    return (
      <div className="restaurant-list">
        {restaurantsToShow.map((restaurant) => {
          const restaurantId = restaurant.id || restaurant.restaurant_id;
          const isFavorite = favorites.includes(restaurantId);
          
          return (
            <div
              key={restaurantId}
              className="restaurant-card-wrapper"
            >
              <RestaurantCard
                profilePicture={restaurant.profile_picture || restaurant.profile_image}
                name={restaurant.name}
                cuisine={restaurant.cuisine}
                onClick={() => this.redirectToRestaurant(restaurantId)}
              />
              <div 
                className="favorite-icon" 
                onClick={(e) => this.toggleFavorite(restaurantId, e)}
              >
                {isFavorite ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { redirectToRestaurant, selectedRestaurantId } = this.state;

    if (redirectToRestaurant && selectedRestaurantId) {
      return <Navigate to={`/customer/restaurant/${selectedRestaurantId}`} />;
    }

    return (
      <div className="customer-home-container">
        <Navbar />
        {this.renderCarousel()}
        
        <div className="main-content">
          <div className="filter-section">
            <div className="filter-content">
              <div className="delivery-type-filter">
                <h4>Delivery Type</h4>
                <Radio.Group
                  onChange={this.handleDeliveryTypeChange}
                  value={this.state.deliveryType}
                >
                  <Space>
                    <Radio value="">All</Radio>
                    <Radio value="Delivery">Delivery</Radio>
                    <Radio value="Pickup">Pickup</Radio>
                  </Space>
                </Radio.Group>
              </div>
              
              <div className="search-bar">
                <Input
                  placeholder="Search restaurants or cuisines..."
                  prefix={<SearchOutlined />}
                  onChange={this.handleSearchChange}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {this.renderRestaurants()}
        </div>
        <CustomerFooter />
      </div>
    );
  }
}

export default CustomerHome;
