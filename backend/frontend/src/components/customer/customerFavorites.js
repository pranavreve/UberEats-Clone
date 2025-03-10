import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "./../../commonCSS.css";
import { Container } from "react-bootstrap";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import tagIcon from "../../Images/tag.png";

class CustomerFavorites extends Component {
  state = {
    restaurants: [],
    redirectToRestaurant: false,
    selectedRestaurant: "",
  };

  redirectToRestaurant = (restaurant) => {
    this.setState({
      selectedRestaurant: restaurant,
      redirectToRestaurant: true,
    });
  };

  componentDidMount() {
    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/favorites/list/`, {
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
  }

  removeFavorite = (restaurant) => {
    let restaurant_id = restaurant.id;
    let details = {
      restaurant_id: restaurant_id,
    };
    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/favorite/remove/`,
        details,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          // Remove from UI
          this.setState((prevState) => ({
            restaurants: prevState.restaurants.filter(
              (r) => r.id !== restaurant_id
            ),
          }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  renderRestaurants = () => {
    return (
      <div className="row" style={{ marginLeft: "50px" }}>
        {this.state.restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="col-md-3 restaurant-card"
            style={{ marginBottom: "20px" }}
          >
            <Container>
              <figure className="position-relative" style={{ marginBottom: "0px" }}>
                <img
                  className="restaurantimgSize"
                  src={restaurant.image_url}
                  alt="Restaurant"
                />
                <figcaption>
                  <FavoriteIcon
                    className="fav_icon_red"
                    onClick={() => this.removeFavorite(restaurant)}
                  />
                </figcaption>
              </figure>
              <div
                onClick={() => this.redirectToRestaurant(restaurant)}
                style={{ cursor: "pointer" }}
              >
                <div className="restaurantName">{restaurant.name}</div>
                <div className="restaurantMeta">
                  <img src={tagIcon} alt="Tag Icon" className="tagIcon" />
                  &nbsp;•&nbsp;
                  {Math.floor(restaurant.distance) < 32 ? (
                    <>
                      ${Math.floor(restaurant.distance)}
                      &nbsp;Delivery fee&nbsp;•&nbsp;
                      <label className="deliveryTime">
                        {Math.ceil(
                          Math.ceil((0.621 * restaurant.distance) / 0.666) / 5
                        ) *
                          5 -
                          10}
                        -
                        {Math.ceil(
                          Math.ceil((0.621 * restaurant.distance) / 0.666) / 5
                        ) * 5}
                        Min
                      </label>
                    </>
                  ) : (
                    "Cannot be delivered to your location"
                  )}
                </div>
              </div>
            </Container>
          </div>
        ))}
      </div>
    );
  };

  render() {
    let redirectToRestaurant = null;
    if (this.state.redirectToRestaurant) {
      redirectToRestaurant = (
        <Navigate
          to="/customer/restaurant"
          state={{ restaurant: this.state.selectedRestaurant }}
        />
      );
    }
    return (
      <>
        {redirectToRestaurant}
        <div className="container-fluid" style={{ marginLeft: "3%", marginRight: "6%" }}>
          <div
            className="row"
            style={{
              marginLeft: "60px",
              padding: "30px",
              paddingTop: "10px",
              fontSize: "40px",
              fontWeight: "600",
            }}
          >
            Favorites
          </div>
          {this.renderRestaurants()}
        </div>
      </>
    );
  }
}

export default CustomerFavorites;
