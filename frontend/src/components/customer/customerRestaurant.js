import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "../navbar.js";
import CustomerFooter from "../footer/customerFooter.js";
import './customerRestaurant.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const CustomerRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasMenu, setHasMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchRestaurantDetails();
    
    // Set up interval to update cart count
    const cartInterval = setInterval(updateCartCount, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(cartInterval);
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        navigate('/customer/login');
        return;
      }

      // Fetch restaurant details
      const restaurantResponse = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRestaurant(restaurantResponse.data);

      // Fetch menu
      const menuResponse = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants/${id}/menu`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMenu(menuResponse.data.menu);
      setHasMenu(menuResponse.data.menu.length > 0);

      // Check if restaurant is a favorite
      const favoritesResponse = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Check if the response has the expected structure
      const favorites = favoritesResponse.data.favorites || [];
      const isRestaurantFavorite = favorites.some(
        (fav) => fav.restaurant_id === parseInt(id)
      );
      setIsFavorite(isRestaurantFavorite);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setError('Failed to load restaurant details. Please try again later.');
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    const cartJSON = sessionStorage.getItem('cart');
    if (cartJSON) {
      try {
        const cart = JSON.parse(cartJSON);
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } catch (e) {
        console.error('Error parsing cart data', e);
      }
    } else {
      setCartCount(0);
    }
  };

  const addToCart = (dish) => {
    // Get existing cart from sessionStorage
    const existingCartJSON = sessionStorage.getItem('cart');
    let existingCart = existingCartJSON ? JSON.parse(existingCartJSON) : [];
    
    // Check if restaurant is different
    const cartRestaurantId = sessionStorage.getItem('cartRestaurantId');
    if (cartRestaurantId && parseInt(cartRestaurantId) !== parseInt(id)) {
      if (window.confirm('Adding items from a different restaurant will clear your current cart. Continue?')) {
        existingCart = [];
      } else {
        return;
      }
    }
    
    // Set restaurant ID for the cart
    sessionStorage.setItem('cartRestaurantId', id);
    sessionStorage.setItem('cartRestaurantName', restaurant.name);
    
    // Find if item already exists in cart
    const existingItemIndex = existingCart.findIndex(item => 
      (item.id === dish.id || item.dish_id === dish.dish_id)
    );
    
    if (existingItemIndex >= 0) {
      // If item already exists, increment quantity
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Otherwise add new item with quantity 1
      const dishWithId = {
        ...dish,
        id: dish.id || dish.dish_id,
        quantity: 1,
        restaurant_id: parseInt(id)
      };
      existingCart.push(dishWithId);
    }
    
    // Save updated cart to sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show notification instead of redirecting
    showAddToCartNotification(dish.name);
  };
  
  // Function to show a temporary notification
  const showAddToCartNotification = (dishName) => {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('cart-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'cart-notification';
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = '#52c41a';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '4px';
      notification.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      notification.style.zIndex = '1000';
      notification.style.transition = 'opacity 0.3s';
      document.body.appendChild(notification);
    }
    
    // Update notification text and show it
    notification.textContent = `${dishName} added to cart!`;
    notification.style.opacity = '1';
    
    // Hide notification after 2 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 2000);
  };

  const removeFromCart = (dishId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== dishId && item.dish_id !== dishId));
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        (item.id === dishId || item.dish_id === dishId) ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const toggleFavorite = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        navigate('/customer/login');
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        await axios.post(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites/remove`,
          { restaurant_id: parseInt(id) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Add to favorites
        await axios.post(
          `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites/add`,
          { restaurant_id: parseInt(id) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const finalizeOrder = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        navigate('/customer/login');
        return;
      }

      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      // Prepare order data
      const orderData = {
        restaurant_id: parseInt(id),
        items: cart.map((item) => ({
          dish_id: item.dish_id || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        delivery_address: "Customer Address", // This should be replaced with actual address
        total_amount: parseFloat(calculateTotal())
      };

      // Place order
      await axios.post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear cart and show success message
      setCart([]);
      alert('Order placed successfully!');
      
      // Navigate to orders page
      navigate('/customer/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loading-message">Loading restaurant details...</div>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="error-message">{error}</div>
        <CustomerFooter />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="error-message">Restaurant not found</div>
    );
  }

  return (
    <div className="customer-restaurant-container">
      <Navbar />
      
      <div className="restaurant-header">
        <h1 className="restaurant-name">{restaurant.name}</h1>
        <p className="restaurant-location">Location: {restaurant.location}</p>
        <button 
          className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={toggleFavorite}
        >
          {isFavorite ? '❤️ Remove from favorites' : '🤍 Add to favorites'}
        </button>
      </div>

      <div className="restaurant-content">
        <div className="menu-container">
          <h2>Menu</h2>
          {hasMenu ? (
            <div className="menu-grid">
              {menu.map((dish, index) => (
                <div key={dish.id || dish.dish_id || `dish-${index}`} className="dish-card">
                  {dish.image_url && (
                    <img src={dish.image_url} alt={dish.name} className="dish-image" />
                  )}
                  <div className="dish-details">
                    <h3>{dish.name}</h3>
                    <p className="dish-description">{dish.description || `${dish.category} dish`}</p>
                    <div className="dish-price-action">
                      <span className="dish-price">${parseFloat(dish.price).toFixed(2)}</span>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(dish)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-menu-message">No menu items available</div>
          )}
        </div>
      </div>

      {/* Floating View Cart Button */}
      <div className="view-cart-button-container">
        <button 
          className="view-cart-button"
          onClick={() => navigate('/customer/cart')}
        >
          View Cart {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
        </button>
      </div>

      <CustomerFooter />
    </div>
  );
};

export default CustomerRestaurant;

