import React, { Component } from "react";
import Navbar from "../navbar";
import CustomerFooter from "../footer/customerFooter";
import "./CustomerHome.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Radio, Space } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import deals from "../../Images/deals.png";
import RestaurantCard from "../restaurant/restaurantCard";
import { Carousel } from 'antd';
import Slider from "react-slick";

class CustomerHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deliveryType: "",
      restaurants: [],
      redirectToRestaurant: false,
      selectedRestaurantId: null,
      favorites: [], // Array to hold favorite restaurant IDs
    };
  }

  componentDidMount() {
    this.fetchRestaurants();
    this.fetchFavorites(); // Fetch existing favorites
  }

  fetchRestaurants = () => {
    const { deliveryType } = this.state;
    let url = `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants`;
    if (deliveryType) {
      url += `?deliveryType=${deliveryType}`;
    }

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          this.setState({ restaurants: response.data.restaurants || response.data });
        }
      })
      .catch((err) => {
        console.log("Error fetching restaurants:", err);
      });
  };

  fetchFavorites = () => {
    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          console.log("Favorites response:", response.data);
          
          let favoriteIds = [];
          
          // Handle different response formats
          if (response.data.favorites && Array.isArray(response.data.favorites)) {
            favoriteIds = response.data.favorites.map(favorite => 
              favorite.restaurant_id || favorite.id || favorite.restaurant
            );
          } else if (Array.isArray(response.data)) {
            favoriteIds = response.data.map(favorite => 
              favorite.restaurant_id || favorite.id || favorite.restaurant
            );
          }
          
          console.log("Parsed favorite IDs:", favoriteIds);
          this.setState({ favorites: favoriteIds });
        }
      })
      .catch((error) => {
        console.error("Error fetching favorites:", error);
      });
  };

  handleDeliveryTypeChange = (e) => {
    this.setState({ deliveryType: e.target.value }, () => {
      this.fetchRestaurants();
    });
  };

  redirectToRestaurant = (restaurantId) => {
    this.setState({
      selectedRestaurantId: restaurantId,
      redirectToRestaurant: true,
    });
  };

  toggleFavorite = (restaurantId) => {
    const { favorites } = this.state;
    const isFavorite = favorites.includes(restaurantId);

    const endpoint = isFavorite ? "remove" : "add";
    const url = `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites/${endpoint}`;

    console.log(`Toggling favorite for restaurant ID: ${restaurantId} - Current status: ${isFavorite ? 'Favorite' : 'Not Favorite'}`);

    // First update the UI for immediate feedback
    this.setState((prevState) => ({
      favorites: isFavorite
        ? prevState.favorites.filter((id) => id !== restaurantId)
        : [...prevState.favorites, restaurantId],
    }));

    // Then make the API call to update the backend
    axios
      .post(
        url,
        { restaurant_id: parseInt(restaurantId) },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.data && response.data.success) {
          console.log(`Restaurant favorite status updated. New status: ${!isFavorite}`);
        } else {
          // If API call failed, revert UI change
          console.error("Failed to update favorite status:", response.data);
          this.setState((prevState) => ({
            favorites: isFavorite
              ? [...prevState.favorites, restaurantId]
              : prevState.favorites.filter((id) => id !== restaurantId),
          }));
        }
      })
      .catch((error) => {
        // If API call failed, revert UI change
        console.error("Error toggling favorite:", error.response?.data || error.message);
        this.setState((prevState) => ({
          favorites: isFavorite
            ? [...prevState.favorites, restaurantId]
            : prevState.favorites.filter((id) => id !== restaurantId),
        }));
      });
  };

  renderRestaurants = () => {
    const { restaurants, favorites } = this.state;
    return (
      <div className="restaurant-list">
        {restaurants.map((restaurant, index) => {
          // Handle different ID field names in the API response
          const restaurantId = restaurant.id || restaurant.restaurant_id;
          const isFavorite = favorites.includes(restaurantId);
          
          return (
            <div
              key={restaurantId}
              className={`restaurant-card-wrapper ${
                restaurants.length % 2 !== 0 && index === restaurants.length - 1
                  ? "full-width"
                  : ""
              }`}
            >
              <RestaurantCard
                profilePicture={restaurant.profile_picture || restaurant.profile_image}
                name={restaurant.name}
                onClick={() => this.redirectToRestaurant(restaurantId)}
              />
              <div 
                className="favorite-icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  this.toggleFavorite(restaurantId);
                }}
              >
                {isFavorite ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  renderCategoryImages = () => {
    const categories = [
      { imgSrc: deals, label: "Deals" },
    ];

    return (
      <div className="category-images">
        {categories.map((category, index) => (
          <div className="category-item" key={index}>
            <img src={category.imgSrc} alt={category.label} />
            <label>{category.label}</label>
          </div>
        ))}
      </div>
    );
  };

  renderCarousel = () => {
    const carouselImages = [
      { src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', alt: 'Pizza' },
      { src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2', alt: 'Pasta' },
      { src: 'https://images.unsplash.com/photo-1550317138-10000687a72b', alt: 'Sushi' },
      { src: 'https://images.unsplash.com/photo-1543353071-873f17a7a088', alt: 'Salad' }
    ];
    
  
    return (
      <Carousel autoplay autoplaySpeed={1000} dots style={{paddingTop: "10px"}}>
        {carouselImages.map((image, index) => (
          <div key={index}>
            <img src={image.src} alt={image.alt} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
          </div>
        ))}
      </Carousel>
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
        {/* {this.renderCategoryImages()} */}
        <div className="container-fluid main-content">
          <div className="row">
            <div className="col-md-3 filters">
              <div className="filter-section">
                <h4>Delivery Type</h4>
                <Radio.Group
                  onChange={this.handleDeliveryTypeChange}
                  value={this.state.deliveryType}
                >
                  <Space direction="vertical">
                    <Radio value="">All</Radio>
                    <Radio value="Delivery">Delivery</Radio>
                    <Radio value="Pickup">Pickup</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
            <div className="col-md-9">{this.renderRestaurants()}</div>
          </div>
        </div>
        <CustomerFooter />
      </div>
    );
  }
}

export default CustomerHome;
