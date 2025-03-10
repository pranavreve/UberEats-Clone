import React from "react";
import "./restaurantCard.css";

const RestaurantCard = ({ profilePicture, name, deliveryFee, onClick }) => {
  return (
    <div className="restaurant-card" onClick={onClick}>
      <div className="card-image-container">
        <img
          className="imgSize"
          src={profilePicture || require("../../Images/rest.jpeg")}
          alt="Restaurant"
        />
      </div>
      <div className="card-details">
        <div className="restaurant-name">
          {name || "Restaurant Name Unavailable"}
        </div>
        <div className="delivery-fee">
          {deliveryFee ? `$${deliveryFee}` : "Delivery Fee Not Available"}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
