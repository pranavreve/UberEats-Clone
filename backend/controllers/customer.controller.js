const { pool } = require('../config/db.config');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// Get customer profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get customer profile data
    const [profiles] = await pool.query(
      `SELECT c.*, u.name, u.email 
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const profile = profiles[0];

    // Format profile picture URL if exists
    if (profile.profile_image) {
      profile.profile_image = `${req.protocol}://${req.get('host')}/uploads/customers/${profile.profile_image}`;
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Update customer profile
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { name, state, country, phone } = req.body;

    // Update user name
    await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, userId]
    );

    // Update profile
    await pool.query(
      `UPDATE customers 
       SET state = ?, country = ?, phone = ?
       WHERE user_id = ?`,
      [state, country, phone, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const profileImage = req.file.filename;

    // Get current profile picture to delete old one
    const [profiles] = await pool.query(
      'SELECT profile_image FROM customers WHERE user_id = ?',
      [userId]
    );

    if (profiles.length > 0 && profiles[0].profile_image) {
      const oldPicturePath = path.join(__dirname, '../uploads/customers', profiles[0].profile_image);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update profile picture
    await pool.query(
      'UPDATE customers SET profile_image = ? WHERE user_id = ?',
      [profileImage, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profile_image: `${req.protocol}://${req.get('host')}/uploads/customers/${profileImage}`
    });
  } catch (error) {
    next(error);
  }
};

// Get all restaurants
exports.getAllRestaurants = async (req, res, next) => {
  try {
    // Get all active restaurants
    const [restaurants] = await pool.query(
      `SELECT r.restaurant_id, r.name, r.location, r.description, 
              r.profile_image, r.opening_time, r.closing_time,
              r.email, r.phone
       FROM restaurants r
       ORDER BY r.name ASC`
    );

    // Format profile images
    const formattedRestaurants = restaurants.map(restaurant => {
      if (restaurant.profile_image) {
        restaurant.profile_image = `${req.protocol}://${req.get('host')}/uploads/restaurants/${restaurant.profile_image}`;
      }
      return restaurant;
    });

    res.json({
      success: true,
      restaurants: formattedRestaurants
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant details
exports.getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user.profile_id;

    // Get restaurant details
    const [restaurants] = await pool.query(
      `SELECT r.restaurant_id, r.name, r.location, r.description, 
              r.profile_image, r.opening_time, r.closing_time,
              r.email, r.phone
       FROM restaurants r
       WHERE r.restaurant_id = ?`,
      [id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurant = restaurants[0];

    // Check if this restaurant is in favorites
    const [favorites] = await pool.query(
      'SELECT * FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
      [customerId, id]
    );

    restaurant.isFavorite = favorites.length > 0;

    // Format profile image
    if (restaurant.profile_image) {
      restaurant.profile_image = `${req.protocol}://${req.get('host')}/uploads/restaurants/${restaurant.profile_image}`;
    }

    // Get restaurant menu
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE restaurant_id = ?',
      [id]
    );

    // Format dish images
    const formattedDishes = dishes.map(dish => {
      if (dish.image_url) {
        dish.image_url = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image_url}`;
      }
      return dish;
    });

    res.json({
      success: true,
      restaurant,
      menu: formattedDishes
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant menu
exports.getRestaurantMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate restaurant exists
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get dishes for the restaurant
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE restaurant_id = ?',
      [id]
    );

    // Format dish images
    const formattedDishes = dishes.map(dish => {
      if (dish.image_url) {
        dish.image_url = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image_url}`;
      }
      return dish;
    });

    res.json({
      success: true,
      menu: formattedDishes
    });
  } catch (error) {
    next(error);
  }
};

// Add restaurant to favorites
exports.addToFavorites = async (req, res, next) => {
  try {
    const { restaurant_id } = req.body;
    const customerId = req.user.profile_id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Check if restaurant exists
    const [restaurants] = await pool.query(
      'SELECT restaurant_id FROM restaurants WHERE restaurant_id = ?',
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if already a favorite
    const [existingFavorites] = await pool.query(
      'SELECT * FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
      [customerId, restaurant_id]
    );

    if (existingFavorites.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is already in favorites'
      });
    }

    // Add to favorites
    await pool.query(
      'INSERT INTO favorites (customer_id, restaurant_id) VALUES (?, ?)',
      [customerId, restaurant_id]
    );

    res.json({
      success: true,
      message: 'Restaurant added to favorites'
    });
  } catch (error) {
    next(error);
  }
};

// Remove restaurant from favorites
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const { restaurant_id } = req.body;
    const customerId = req.user.profile_id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Remove from favorites
    await pool.query(
      'DELETE FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
      [customerId, restaurant_id]
    );

    res.json({
      success: true,
      message: 'Restaurant removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

// Get favorites list
exports.getFavorites = async (req, res, next) => {
  try {
    const customerId = req.user.profile_id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Get favorite restaurants
    const [favorites] = await pool.query(
      `SELECT r.restaurant_id, r.name, r.description, r.location, r.profile_image,
              r.opening_time, r.closing_time, r.email, r.phone,
              f.favorited_at
       FROM favorites f
       JOIN restaurants r ON f.restaurant_id = r.restaurant_id
       WHERE f.customer_id = ?`,
      [customerId]
    );

    // Format profile pictures
    const formattedFavorites = favorites.map(restaurant => {
      if (restaurant.profile_image) {
        restaurant.profile_image = `${req.protocol}://${req.get('host')}/uploads/restaurants/${restaurant.profile_image}`;
      }
      return {
        ...restaurant,
        isFavorite: true
      };
    });

    res.json({
      success: true,
      favorites: formattedFavorites
    });
  } catch (error) {
    next(error);
  }
};

// Place a new order
exports.placeOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const profileId = req.user.profile_id;
    const { restaurant_id, items, delivery_address, total_amount } = req.body;

    // Validate restaurant
    const [restaurants] = await pool.query(
      'SELECT restaurant_id FROM restaurants WHERE restaurant_id = ?',
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.query(
        `INSERT INTO orders (customer_id, restaurant_id, delivery_address, total_amount)
         VALUES (?, ?, ?, ?)`,
        [profileId, restaurant_id, delivery_address, total_amount]
      );

      const orderId = orderResult.insertId;

      // Add order items
      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (order_id, dish_id, quantity, price_each)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.dish_id, item.quantity, item.price]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order_id: orderId
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get customer orders
exports.getOrders = async (req, res, next) => {
  try {
    // Use profile_id instead of id to match the customer_id in the orders table
    const userId = req.user.profile_id;
    console.log("Getting orders for user profile ID:", userId);

    // Get orders
    const [orders] = await pool.query(
      `SELECT o.*, r.restaurant_id, r.name as restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.restaurant_id
       WHERE o.customer_id = ?
       ORDER BY o.order_time DESC`,
      [userId]
    );

    console.log("Found orders:", orders.length);

    // Get order items for each order
    const formattedOrders = [];
    
    for (const order of orders) {
      try {
        const [items] = await pool.query(
          `SELECT oi.*, d.name as dish_name, d.price as dish_price
           FROM order_items oi
           JOIN dishes d ON oi.dish_id = d.dish_id
           WHERE oi.order_id = ?`,
          [order.order_id]
        );
        
        // Calculate total items
        const totalItems = items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
        
        formattedOrders.push({
          ...order,
          items: items,
          total_items: totalItems
        });
      } catch (itemError) {
        console.error(`Error fetching items for order ${order.order_id}:`, itemError);
        // Still include the order even if items can't be fetched
        formattedOrders.push({
          ...order,
          items: [],
          total_items: 0,
          itemsError: itemError.message
        });
      }
    }

    console.log("Returning formatted orders:", formattedOrders.length);
    res.json(formattedOrders);
  } catch (error) {
    console.error("Error getting orders:", error);
    next(error);
  }
};

// Get order details
exports.getOrderDetails = async (req, res, next) => {
  try {
    // Use profile_id instead of id to match the customer_id in the orders table
    const userId = req.user.profile_id;
    const { id } = req.params;
    console.log(`Getting order details for order ID: ${id}, user profile ID: ${userId}`);

    // Get order
    const [orders] = await pool.query(
      `SELECT o.*, r.restaurant_id, r.name as restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.restaurant_id
       WHERE o.order_id = ? AND o.customer_id = ?`,
      [id, userId]
    );

    if (orders.length === 0) {
      console.log(`Order not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];
    console.log(`Found order: ${order.order_id}`);

    // Get order items
    try {
      const [items] = await pool.query(
        `SELECT oi.*, d.name as dish_name, d.price as dish_price
         FROM order_items oi
         JOIN dishes d ON oi.dish_id = d.dish_id
         WHERE oi.order_id = ?`,
        [id]
      );
      
      console.log(`Found ${items.length} items for order ${id}`);
      
      // Calculate total items
      const totalItems = items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
      
      order.items = items;
      order.total_items = totalItems;

      console.log(`Returning order details for order ${id}`);
      res.json({
        success: true,
        order
      });
    } catch (itemError) {
      console.error(`Error fetching items for order ${id}:`, itemError);
      // Still return the order even if items can't be fetched
      order.items = [];
      order.total_items = 0;
      order.itemsError = itemError.message;
      
      res.json({
        success: true,
        order
      });
    }
  } catch (error) {
    console.error(`Error getting order details: ${error.message}`);
    next(error);
  }
};

// Get dishes for a specific restaurant
exports.getRestaurantDishes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query to get all dishes for the specified restaurant
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE restaurant_id = ?',
      [id]
    );
    
    // Return the dishes
    return res.status(200).json(dishes);
  } catch (error) {
    console.error('Error fetching restaurant dishes:', error);
    return res.status(500).json({ 
      message: 'Error fetching restaurant dishes', 
      error: error.message 
    });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileId = req.user.profile_id;
    const { id } = req.params;

    // Check if order exists and belongs to this customer
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE order_id = ? AND customer_id = ?`,
      [id, profileId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not owned by this customer'
      });
    }

    const order = orders[0];
    
    // Check if order can be cancelled (only if it's in certain statuses)
    const cancellableStatuses = ['New', 'Order Received', 'Preparing', 'On the Way', 'Pick-up Ready'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status "${order.status}"`
      });
    }

    // Update order status to Cancelled
    await pool.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      ['Cancelled', id]
    );
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's profile information
exports.getCurrentUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileId = req.user.profile_id;
    
    console.log("Current user info:", {
      userId,
      profileId,
      user: req.user
    });
    
    res.json({
      success: true,
      user: {
        id: userId,
        profile_id: profileId,
        name: req.user.name,
        email: req.user.email,
        user_type: req.user.user_type
      }
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    next(error);
  }
};

// Get orders for a specific customer ID (for debugging)
exports.getOrdersByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    console.log(`Getting orders for specific customer ID: ${customerId}`);

    // Get orders
    const [orders] = await pool.query(
      `SELECT o.*, r.restaurant_id, r.name as restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.restaurant_id
       WHERE o.customer_id = ?
       ORDER BY o.order_time DESC`,
      [customerId]
    );

    console.log(`Found ${orders.length} orders for customer ID: ${customerId}`);

    // Get order items for each order
    const formattedOrders = [];
    
    for (const order of orders) {
      try {
        const [items] = await pool.query(
          `SELECT oi.*, d.name as dish_name, d.price as dish_price
           FROM order_items oi
           JOIN dishes d ON oi.dish_id = d.dish_id
           WHERE oi.order_id = ?`,
          [order.order_id]
        );
        
        // Calculate total items
        const totalItems = items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
        
        formattedOrders.push({
          ...order,
          items: items,
          total_items: totalItems
        });
      } catch (itemError) {
        console.error(`Error fetching items for order ${order.order_id}:`, itemError);
        // Still include the order even if items can't be fetched
        formattedOrders.push({
          ...order,
          items: [],
          total_items: 0,
          itemsError: itemError.message
        });
      }
    }

    console.log(`Returning ${formattedOrders.length} formatted orders for customer ID: ${customerId}`);
    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error(`Error getting orders for customer ID ${req.params.customerId}:`, error);
    next(error);
  }
};

// Debug function to directly query the database for orders
exports.debugQueryOrders = async (req, res, next) => {
  try {
    console.log("Directly querying the database for orders");
    
    // Get all orders
    const [orders] = await pool.query(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.restaurant_id`
    );
    
    console.log(`Found ${orders.length} total orders in the database`);
    
    // Get customer info
    const [customers] = await pool.query(
      `SELECT customer_id, user_id, name, email
       FROM customers`
    );
    
    console.log(`Found ${customers.length} customers in the database`);
    
    // Get user info
    const [users] = await pool.query(
      `SELECT id, name, email, user_type
       FROM users`
    );
    
    console.log(`Found ${users.length} users in the database`);
    
    res.json({
      success: true,
      orders,
      customers,
      users
    });
  } catch (error) {
    console.error("Error in debug query:", error);
    next(error);
  }
};