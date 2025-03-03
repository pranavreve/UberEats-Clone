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
    let url = `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/restaurants/`;
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
          this.setState({ restaurants: response.data });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  fetchFavorites = () => {
    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/favorites/list/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const favoriteIds = response.data.map((favorite) => favorite.restaurant);
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

    const url = `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/favorite/${
      isFavorite ? "remove" : "add"
    }/`;

    // API call to add/remove favorite on the backend
    axios
      .post(
        url,
        { restaurant_id: restaurantId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then(() => {
        this.setState((prevState) => ({
          favorites: isFavorite
            ? prevState.favorites.filter((id) => id !== restaurantId)
            : [...prevState.favorites, restaurantId],
        }));
      })
      .catch((error) => {
        console.error("Error toggling favorite:", error);
      });
  };

  renderRestaurants = () => {
    const { restaurants, favorites } = this.state;
    return (
      <div className="restaurant-list">
        {restaurants.map((restaurant, index) => {
          const isFavorite = favorites.includes(restaurant.id);
          return (
            <div
              key={restaurant.id}
              className={`restaurant-card-wrapper ${
                restaurants.length % 2 !== 0 && index === restaurants.length - 1
                  ? "full-width"
                  : ""
              }`}
            >
              <RestaurantCard
                profilePicture={restaurant.profile_picture}
                name={restaurant.name}
                onClick={() => this.redirectToRestaurant(restaurant.id)}
              />
              <div className="favorite-icon" onClick={() => this.toggleFavorite(restaurant.id)}>
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
