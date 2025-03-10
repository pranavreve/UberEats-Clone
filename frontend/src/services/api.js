import axios from 'axios';

// Create an axios instance with default configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_UBEREATS_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - adds auth token to all requests
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login page
      sessionStorage.removeItem('authToken');
      window.location.href = '/customer/login';
    }
    return Promise.reject(error);
  }
);

// Customer API endpoints
export const customerAPI = {
  // Restaurant listing and details
  getAllRestaurants: (deliveryType) => {
    let url = '/api/customers/restaurants';
    if (deliveryType) {
      url += `?deliveryType=${deliveryType}`;
    }
    return API.get(url);
  },
  
  getRestaurantDetails: (restaurantId) => {
    return API.get(`/api/customers/restaurants/${restaurantId}`);
  },
  
  // Favorites management
  getFavorites: () => {
    return API.get('/api/customers/favorites');
  },
  
  addToFavorites: (restaurantId) => {
    return API.post('/api/customers/favorites/add', { 
      restaurant_id: parseInt(restaurantId) 
    });
  },
  
  removeFromFavorites: (restaurantId) => {
    return API.post('/api/customers/favorites/remove', { 
      restaurant_id: parseInt(restaurantId) 
    });
  },
  
  // Profile management
  getProfile: () => {
    return API.get('/api/customers/profile');
  },
  
  updateProfile: (profileData) => {
    return API.put('/api/customers/profile', profileData);
  },
  
  // Order management
  placeOrder: (orderData) => {
    return API.post('/api/customers/orders', orderData);
  },
  
  getOrders: () => {
    return API.get('/api/customers/orders');
  },
  
  getOrderDetails: (orderId) => {
    return API.get(`/api/customers/orders/${orderId}`);
  }
};

// Restaurant API endpoints
export const restaurantAPI = {
  // Profile management
  getProfile: () => {
    return API.get('/api/restaurants/profile');
  },
  
  updateProfile: (profileData) => {
    return API.put('/api/restaurants/profile', profileData);
  },
  
  uploadProfilePicture: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return API.post('/api/restaurants/profile/upload-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Menu management
  getDishes: () => {
    return API.get('/api/restaurants/menu');
  },
  
  addDish: (dishData) => {
    // We need to use FormData for file uploads to work with multer
    const formData = new FormData();
    
    // Add all fields to the form data
    Object.keys(dishData).forEach(key => {
      if (key === 'image' && dishData[key]) {
        formData.append('image', dishData[key]);
      } else if (dishData[key] !== null && dishData[key] !== undefined) {
        formData.append(key, dishData[key]);
      }
    });
    
    // Override the default Content-Type header for FormData
    return API.post('/api/restaurants/dishes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  updateDish: (dishId, dishData) => {
    // If there's an image file, we need to use FormData
    if (dishData.image) {
      const formData = new FormData();
      
      // Add all fields to the form data
      Object.keys(dishData).forEach(key => {
        if (key === 'image' && dishData[key]) {
          formData.append('image', dishData[key]);
        } else if (dishData[key] !== null && dishData[key] !== undefined) {
          formData.append(key, dishData[key]);
        }
      });
      
      return API.put(`/api/restaurants/dishes/${dishId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // If no image, use regular JSON
      return API.put(`/api/restaurants/dishes/${dishId}`, dishData);
    }
  },
  
  deleteDish: (dishId) => {
    return API.delete(`/api/restaurants/dishes/${dishId}`);
  },
  
  // Order management
  getOrders: (status) => {
    let url = '/api/restaurants/orders';
    if (status) {
      url += `?status=${status}`;
    }
    return API.get(url);
  },
  
  updateOrderStatus: (orderId, status) => {
    return API.put(`/api/restaurants/orders/${orderId}/status`, { status });
  }
};

// Authentication endpoints
export const authAPI = {
  login: (credentials) => {
    return API.post('/api/auth/login', credentials);
  },
  
  register: (userData) => {
    return API.post('/api/auth/register', userData);
  },
  
  getCurrentUser: () => {
    return API.get('/api/auth/me');
  },
  
  logout: () => {
    return API.post('/api/auth/logout');
  },
  
  // Keep the old methods for backward compatibility
  customerLogin: (credentials) => {
    return API.post('/api/auth/login', credentials);
  },
  
  customerSignup: (userData) => {
    return API.post('/api/auth/register', {
      ...userData,
      user_type: 'customer'
    });
  },
  
  restaurantLogin: (credentials) => {
    return API.post('/api/auth/login', credentials);
  },
  
  restaurantSignup: (userData) => {
    return API.post('/api/auth/register', {
      ...userData,
      user_type: 'restaurant'
    });
  }
};

export default API;