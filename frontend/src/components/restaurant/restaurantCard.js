import React from "react";
import "./restaurantCard.css";
import { restaurantImages } from "./restaurantImages";

const RestaurantCard = ({ profilePicture, name, deliveryFee, cuisine, onClick }) => {
  // Function to get the appropriate image based on cuisine type
  const getRestaurantImage = () => {
    if (profilePicture) return profilePicture;
    
    // If cuisine is provided and exists in our images, use that
    if (cuisine && restaurantImages[cuisine]) {
      return restaurantImages[cuisine];
    }
    
    // If no matching cuisine or no cuisine provided, use default image
    return restaurantImages.default;
  };

  return (
    <div 
      className="restaurant-card" 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-image-container">
        <img
          className="imgSize"
          src={getRestaurantImage()}
          alt={`${name || 'Restaurant'}`}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = restaurantImages.default;
          }}
        />
      </div>
      <div className="card-details">
        <div className="restaurant-name">
          {name || "Restaurant Name Unavailable"}
        </div>
        <div className="delivery-fee">
          {deliveryFee ? `$${deliveryFee}` : "Delivery Fee Not Available"}
        </div>
        {cuisine && (
          <div className="cuisine-type">
            {cuisine}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
