import React from "react";
import "./restaurantCard.css";

const RestaurantCard = ({ profilePicture, name, deliveryFee, onClick }) => {
  const handleClick = (e) => {
    console.log("Restaurant card clicked:", name);
    
    // Stop any event propagation
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof onClick === 'function') {
      onClick();
    } else {
      console.error("No onClick handler provided to RestaurantCard or it's not a function");
    }
  };

  return (
    <div 
      className="restaurant-card" 
      onClick={handleClick}
      style={{cursor: 'pointer'}}
    >
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
