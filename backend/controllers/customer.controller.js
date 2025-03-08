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
       FROM customer_profiles c
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
    if (profile.profile_picture) {
      profile.profile_picture = `${req.protocol}://${req.get('host')}/uploads/customers/${profile.profile_picture}`;
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
    const { name, address, city, state, country, phone } = req.body;

    // Update user name
    await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, userId]
    );

    // Update profile
    await pool.query(
      `UPDATE customer_profiles 
       SET address = ?, city = ?, state = ?, country = ?, phone = ?
       WHERE user_id = ?`,
      [address, city, state, country, phone, userId]
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
    const profilePicture = req.file.filename;

    // Get current profile picture to delete old one
    const [profiles] = await pool.query(
      'SELECT profile_picture FROM customer_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length > 0 && profiles[0].profile_picture) {
      const oldPicturePath = path.join(__dirname, '../uploads/customers', profiles[0].profile_picture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update profile picture
    await pool.query(
      'UPDATE customer_profiles SET profile_picture = ? WHERE user_id = ?',
      [profilePicture, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profile_picture: `${req.protocol}://${req.get('host')}/uploads/customers/${profilePicture}`
    });
  } catch (error) {
    next(error);
  }
};

// Get all restaurants
exports.getAllRestaurants = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deliveryType } = req.query;

    // Build query based on delivery type filter
    let query = `
      SELECT r.id, r.description, r.location, r.delivery_type, 
             r.profile_picture, r.opening_time, r.closing_time,
             u.name
      FROM restaurant_profiles r
      JOIN users u ON r.user_id = u.id
    `;
    
    const queryParams = [];
    
    if (deliveryType) {
      query += ` WHERE r.delivery_type = ? OR r.delivery_type = 'Both'`;
      queryParams.push(deliveryType);
    }

    const [restaurants] = await pool.query(query, queryParams);

    // Get favorites for this customer
    const [favorites] = await pool.query(
      'SELECT restaurant_id FROM favorites WHERE customer_id = ?',
      [userId]
    );

    const favoriteIds = favorites.map(fav => fav.restaurant_id);

    // Format data
    const formattedRestaurants = restaurants.map(restaurant => {
      // Format profile picture path
      if (restaurant.profile_picture) {
        restaurant.profile_picture = `${req.protocol}://${req.get('host')}/uploads/restaurants/${restaurant.profile_picture}`;
      }

      return {
        ...restaurant,
        isFavorite: favoriteIds.includes(restaurant.id)
      };
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
exports.getRestaurantDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get restaurant info
    const [restaurants] = await pool.query(
      `SELECT r.*, u.name 
       FROM restaurant_profiles r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurant = restaurants[0];
    
    // Format profile picture
    if (restaurant.profile_picture) {
      restaurant.profile_picture = `${req.protocol}://${req.get('host')}/uploads/restaurants/${restaurant.profile_picture}`;
    }

    // Check if restaurant is a favorite
    const [favorites] = await pool.query(
      'SELECT id FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
      [userId, id]
    );
    
    restaurant.isFavorite = favorites.length > 0;

    // Get menu
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE restaurant_id = ?',
      [id]
    );

    // Format dish images
    const formattedDishes = dishes.map(dish => {
      if (dish.image) {
        dish.image = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image}`;
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

// Add restaurant to favorites
exports.addToFavorites = async (req, res, next) => {
  try {
    const { restaurant_id } = req.body;
    const userId = req.user.id;

    // Check if restaurant exists
    const [restaurants] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE id = ?',
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
      'SELECT id FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
      [userId, restaurant_id]
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
      [userId, restaurant_id]
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
    const userId = req.user.id;

    // Remove from favorites
    await pool.query(
      'DELETE FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
      [userId, restaurant_id]
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
    const userId = req.user.id;

    // Get favorite restaurants
    const [favorites] = await pool.query(
      `SELECT r.id, r.description, r.location, r.profile_picture, 
              r.opening_time, r.closing_time, u.name,
              f.id as favorite_id
       FROM favorites f
       JOIN restaurant_profiles r ON f.restaurant_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE f.customer_id = ?`,
      [userId]
    );

    // Format profile pictures
    const formattedFavorites = favorites.map(restaurant => {
      if (restaurant.profile_picture) {
        restaurant.profile_picture = `${req.protocol}://${req.get('host')}/uploads/restaurants/${restaurant.profile_picture}`;
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
    const { restaurant_id, items, delivery_address, total_amount } = req.body;

    // Validate restaurant
    const [restaurants] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE id = ?',
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
        [userId, restaurant_id, delivery_address, total_amount]
      );

      const orderId = orderResult.insertId;

      // Add order items
      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (order_id, dish_id, quantity, price)
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
    const userId = req.user.id;

    // Get orders
    const [orders] = await pool.query(
      `SELECT o.*, r.id as restaurant_id, u.name as restaurant_name
       FROM orders o
       JOIN restaurant_profiles r ON o.restaurant_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE o.customer_id = ?
       ORDER BY o.order_date DESC`,
      [userId]
    );

    // Get order items for each order
    const formattedOrders = [];
    
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, d.name, d.image
         FROM order_items oi
         JOIN dishes d ON oi.dish_id = d.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      // Format dish images
      const formattedItems = items.map(item => {
        if (item.image) {
          item.image = `${req.protocol}://${req.get('host')}/uploads/dishes/${item.image}`;
        }
        return item;
      });
      
      formattedOrders.push({
        ...order,
        items: formattedItems
      });
    }

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    next(error);
  }
};

// Get order details
exports.getOrderDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get order
    const [orders] = await pool.query(
      `SELECT o.*, r.id as restaurant_id, u.name as restaurant_name
       FROM orders o
       JOIN restaurant_profiles r ON o.restaurant_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE o.id = ? AND o.customer_id = ?`,
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.query(
      `SELECT oi.*, d.name, d.image
       FROM order_items oi
       JOIN dishes d ON oi.dish_id = d.id
       WHERE oi.order_id = ?`,
      [id]
    );
    
    // Format dish images
    const formattedItems = items.map(item => {
      if (item.image) {
        item.image = `${req.protocol}://${req.get('host')}/uploads/dishes/${item.image}`;
      }
      return item;
    });
    
    order.items = formattedItems;

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};