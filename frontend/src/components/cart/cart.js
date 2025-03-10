import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './cart.css';
import Navbar from '../navbar.js';
import CustomerFooter from '../footer/customerFooter.js';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart items from sessionStorage
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = () => {
    const cartJSON = sessionStorage.getItem('cart');
    const cartItems = cartJSON ? JSON.parse(cartJSON) : [];
    setCartItems(cartItems);
    
    // Get restaurant info
    const restaurantId = sessionStorage.getItem('cartRestaurantId');
    const restaurantName = sessionStorage.getItem('cartRestaurantName');
    setRestaurantId(restaurantId);
    setRestaurantName(restaurantName);
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
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => 
      item.id !== itemId && item.dish_id !== itemId
    );
    
    setCartItems(updatedCart);
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // If cart is empty, clear restaurant info
    if (updatedCart.length === 0) {
      sessionStorage.removeItem('cartRestaurantId');
      sessionStorage.removeItem('cartRestaurantName');
      setRestaurantId(null);
      setRestaurantName('');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    sessionStorage.removeItem('cart');
    sessionStorage.removeItem('cartRestaurantId');
    sessionStorage.removeItem('cartRestaurantName');
    setRestaurantId(null);
    setRestaurantName('');
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
      setError(null); // Clear any previous errors
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        navigate('/customer/login');
        return;
      }

      // Get user's address or use a default one
      // In a real app, you would get this from the user's profile or prompt them to enter it
      const userAddress = prompt("Please enter your delivery address:", "");
      if (!userAddress) {
        setLoading(false);
        return; // User cancelled
      }

      // Prepare order data
      const orderData = {
        restaurant_id: parseInt(restaurantId),
        items: cartItems.map(item => ({
          dish_id: item.dish_id || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        delivery_address: userAddress,
        total_amount: parseFloat(calculateTotal())
      };

      console.log('Placing order with data:', orderData);

      // Place order
      const response = await axios.post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Provide more specific error messages based on the error
      if (error.response?.status === 404) {
        setError('Restaurant not found. Please try again.');
      } else if (error.response?.status === 401) {
        setError('You need to be logged in to place an order.');
        navigate('/customer/login');
      } else {
        setError(`Failed to place order: ${error.response?.data?.message || error.message}`);
      }
      
      alert('Failed to place order. Please try again.');
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
        <h1>Your Cart</h1>
        
        {restaurantName && (
          <div className="restaurant-info">
            <h2>From: {restaurantName}</h2>
            <button className="view-restaurant-btn" onClick={goToRestaurant}>
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
                    <h3>{item.name}</h3>
                    <p className="item-price">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id || item.dish_id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id || item.dish_id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id || item.dish_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              
              <div className="cart-actions">
                <button className="clear-cart-btn" onClick={clearCart}>
                  Clear Cart
                </button>
                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button className="browse-btn" onClick={() => navigate('/customer/home')}>
              Browse Restaurants
            </button>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <CustomerFooter />
    </div>
  );
};

export default Cart;
