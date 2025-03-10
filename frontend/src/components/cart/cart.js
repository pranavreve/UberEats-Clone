import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './cart.css';
import Navbar from '../navbar.js';
import CustomerFooter from '../footer/customerFooter.js';
import { ShoppingCartOutlined, ShopOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const CART_STORAGE_KEY = 'ubereats_cart';

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      console.log('Loading cart from storage:', savedCart);
      setCartItems(savedCart);
      
      // Get restaurant info from the first item in cart
      if (savedCart.length > 0) {
        setRestaurantId(savedCart[0].restaurant_id);
        setRestaurantName(savedCart[0].restaurant_name);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const updatedCart = cartItems.map(item => 
      (item.id === itemId || item.dish_id === itemId) 
        ? { ...item, quantity } 
        : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => 
      item.id !== itemId && item.dish_id !== itemId
    );
    
    setCartItems(updatedCart);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
    
    // If cart is empty, clear restaurant info
    if (updatedCart.length === 0) {
      setRestaurantId(null);
      setRestaurantName('');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName('');
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        navigate('/customer/login');
        return;
      }

      // Get customer ID from token
      const customerResponse = await axios.get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const customerId = customerResponse.data.customer_id;

      // Prepare order data to match backend validation requirements
      const orderData = {
        customer_id: customerId,
        restaurant_id: parseInt(restaurantId),
        delivery_address: "Pickup at Restaurant", // Added back for validation
        status: "New",
        total_amount: parseFloat(calculateTotal()),
        items: cartItems.map(item => ({
          dish_id: parseInt(item.id || item.dish_id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price), // Changed from price_each to price for validation
          price_each: parseFloat(item.price) // Keep this for database
        }))
      };

      console.log('Placing order with data:', orderData);

      // Place order
      const response = await axios.post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Order placed successfully:', response.data);

      // Clear cart after successful order
      clearCart();
      alert('Order placed successfully! You can view your order in the Orders tab.');
      
      // Navigate to orders page
      navigate('/customer/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      
      let errorMessage = 'Failed to place order. ';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 404) {
          errorMessage += 'Restaurant not found.';
        } else if (error.response.status === 401) {
          errorMessage += 'Please login again.';
          navigate('/customer/login');
        } else if (error.response.data && error.response.data.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors
            .map(err => err.msg)
            .join(', ');
          errorMessage += validationErrors;
        } else if (error.response.data && error.response.data.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += 'Please try again.';
        }
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToRestaurant = () => {
    if (restaurantId) {
      navigate(`/customer/restaurant/${restaurantId}`);
    }
  };

  return (
    <div className="cart-page">
      <Navbar />
      
      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <ShoppingCartOutlined style={{ marginRight: '10px' }} />
            Your Cart
          </h1>
          <p>Review your items and checkout when ready! 🛍️</p>
        </div>

        <div>
          {restaurantName && (
            <div className="restaurant-info">
              <h2>
                <ShopOutlined style={{ marginRight: '8px' }} />
                {restaurantName}
              </h2>
              <button className="view-restaurant-btn" onClick={goToRestaurant}>
                <ShopOutlined />
                View Restaurant
              </button>
            </div>
          )}

          {cartItems.length > 0 ? (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id || item.dish_id || `item-${item.name}`} className="cart-item">
                    <div className="item-details">
                      <span role="img" aria-label="food">🍽️</span>
                      <div>
                        <h3>{item.name}</h3>
                        <p className="item-price">${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id || item.dish_id, item.quantity - 1)}
                        >
                          <MinusOutlined />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id || item.dish_id, item.quantity + 1)}
                        >
                          <PlusOutlined />
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id || item.dish_id)}
                      >
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="cart-total">
                  <span>Total Amount</span>
                  <span>${calculateTotal()} 💰</span>
                </div>
                
                <div className="cart-actions">
                  <button className="clear-cart-btn" onClick={clearCart}>
                    <DeleteOutlined /> Clear Cart
                  </button>
                  <button 
                    className="checkout-btn" 
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (
                      <>
                        Checkout <ArrowRightOutlined />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>Your cart is empty! Let's add some delicious items 😋</p>
              <button className="browse-btn" onClick={() => navigate('/customer/home')}>
                <ShopOutlined /> Browse Restaurants
              </button>
            </div>
          )}

        </div>
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>
      
      <CustomerFooter />
    </div>
  );
};

export default Cart;