import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "../navbar.js";
import CustomerFooter from "../footer/customerFooter.js";
import './customerRestaurant.css';
import { FaHeart, FaRegHeart, FaStar, FaClock, FaWallet, FaMapMarkerAlt } from 'react-icons/fa';
import { message } from 'antd';

const CustomerRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cart, setCart] = useState([]);

  const CART_STORAGE_KEY = 'ubereats_cart';

  useEffect(() => {
    fetchRestaurantDetails();
    loadCart();
  }, [id]);

  const loadCart = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      console.log('Loaded cart from localStorage:', savedCart);
      if (Array.isArray(savedCart)) {
        setCart(savedCart);
      } else {
        console.error('Invalid cart data format');
        setCart([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        navigate('/customer/login');
        return;
      }

      const restaurantResponse = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!restaurantResponse.data) {
        throw new Error('Restaurant not found');
      }
      
      setRestaurant(restaurantResponse.data);

      const menuResponse = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/restaurants/${id}/menu`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const menuItems = menuResponse.data.menu || [];
      setMenu(menuItems);

      // Extract unique categories
      const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
      setCategories(uniqueCategories);
      setActiveCategory(uniqueCategories[0]);

      const favoritesResponse = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
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

  const addToCart = (dish) => {
    try {
      // Ensure we have a valid dish ID
      const dishId = dish.id || dish.dish_id;
      if (!dishId) {
        message.error('Invalid dish data');
        return;
      }

      const cartItem = {
        id: dishId,
        name: dish.name,
        price: dish.price,
        image_url: dish.image_url,
        description: dish.description,
        category: dish.category,
        restaurant_id: parseInt(id),
        restaurant_name: restaurant.name,
        quantity: 1,
      };

      let updatedCart;
      const existingCartItem = cart.find(
        (item) => item.id === dishId && item.restaurant_id === parseInt(id)
      );

      if (existingCartItem) {
        updatedCart = cart.map((item) =>
          item.id === dishId && item.restaurant_id === parseInt(id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        message.success(`Increased quantity of ${dish.name} in cart`);
      } else {
        // Check if cart has items from a different restaurant
        if (cart.length > 0 && cart[0].restaurant_id !== parseInt(id)) {
          if (!window.confirm('Adding items from a different restaurant will clear your current cart. Would you like to proceed?')) {
            return;
          }
          updatedCart = [cartItem];
          message.info('Cart has been cleared and new item added');
        } else {
          updatedCart = [...cart, cartItem];
          message.success(`${dish.name} added to cart`);
        }
      }

      // Save to localStorage and update state
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
        console.log('Saved cart to localStorage:', updatedCart);
        
        // Verify the data was saved correctly
        const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
        console.log('Verified saved cart:', savedCart);
        
        setCart(updatedCart);
        
        // Update cart item count in sessionStorage for global access
        sessionStorage.setItem('cartItemCount', updatedCart.length.toString());
      } catch (error) {
        console.error('Error saving cart:', error);
        message.error('Failed to save cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Failed to add item to cart. Please try again.');
    }
  };

  const viewCart = () => {
    // Verify cart data before navigation
    const currentCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    console.log('Navigating to cart with data:', currentCart);
    
    // Ensure cart data is saved before navigation
    if (currentCart.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
      sessionStorage.setItem('cartItemCount', currentCart.length.toString());
    }
    
    navigate('/customer/cart');
  };

  const toggleFavorite = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        navigate('/customer/login');
        return;
      }

      const endpoint = isFavorite ? 'remove' : 'add';
      await axios.post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/favorites/${endpoint}`,
        { restaurant_id: parseInt(id) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsFavorite(!isFavorite);
      message.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorites:', error);
      message.error('Failed to update favorites. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="customer-restaurant-container">
        <Navbar />
        <div className="loading-message">Loading restaurant details...</div>
        <CustomerFooter />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="customer-restaurant-container">
        <Navbar />
        <div className="error-message">
          {error || 'Restaurant not found'}
          <button onClick={fetchRestaurantDetails} className="retry-button">
            Try Again
          </button>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  const filteredMenu = activeCategory
    ? menu.filter(item => item.category === activeCategory)
    : menu;

  return (
    <div className="customer-restaurant-container">
      <Navbar />
      
      <div className="restaurant-header">
        <div className="restaurant-banner">
          {restaurant.banner_image ? (
            <img src={restaurant.banner_image} alt={restaurant.name} />
          ) : (
            <div className="default-banner" />
          )}
        </div>
        <div className="restaurant-info">
          <h1 className="restaurant-name">{restaurant.name}</h1>
          <div className="restaurant-meta">
            <span><FaStar /> {restaurant.rating || '4.5'} ({restaurant.total_reviews || '50'}+ ratings)</span>
            <span><FaClock /> {restaurant.delivery_time || '30-45'} mins</span>
            <span><FaWallet /> Delivery Fee: ${restaurant.delivery_fee || '2.99'}</span>
            <span><FaMapMarkerAlt /> {restaurant.distance || '1.2'} miles away</span>
          </div>
          <p className="restaurant-description">{restaurant.description}</p>
          <button 
            className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
            onClick={toggleFavorite}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>

      <div className="restaurant-content">
        <div className="menu-section">
          <div className="menu-categories">
            <div className="category-list">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`category-item ${category === activeCategory ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>

          <div className="menu-items">
            {filteredMenu.map((dish) => (
              <div key={dish.id || dish.dish_id} className="menu-item">
                <div className="menu-item-info">
                  <h3>{dish.name}</h3>
                  <p>{dish.description || `${dish.category} dish`}</p>
                  <div className="price-action">
                    <span className="price">${parseFloat(dish.price).toFixed(2)}</span>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(dish)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                {dish.image_url && (
                  <img src={dish.image_url} alt={dish.name} className="menu-item-image" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <button className="view-cart-button" onClick={viewCart}>
          View Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
        </button>
      )}

      <CustomerFooter />
    </div>
  );
};

export default CustomerRestaurant;

