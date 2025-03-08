// controllers/restaurant.controller.js
const { pool } = require('../config/db.config');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get restaurant profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get restaurant profile data
    const [profiles] = await pool.query(
      `SELECT r.*, u.name, u.email 
       FROM restaurant_profiles r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = ?`,
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const profile = profiles[0];

    // Format profile picture URL
    if (profile.profile_picture) {
      profile.profile_picture = `${req.protocol}://${req.get('host')}/uploads/restaurants/${profile.profile_picture}`;
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Update restaurant profile
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
    const { 
      name, description, location, delivery_type, 
      contact_info, opening_time, closing_time 
    } = req.body;

    // Update user name
    await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, userId]
    );

    // Update restaurant profile
    await pool.query(
      `UPDATE restaurant_profiles 
       SET description = ?, location = ?, delivery_type = ?, 
           contact_info = ?, opening_time = ?, closing_time = ?
       WHERE user_id = ?`,
      [description, location, delivery_type, contact_info, opening_time, closing_time, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload restaurant profile picture
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const userId = req.user.id;
    const profilePicture = req.file.filename;

    // Get existing profile picture to delete it
    const [profiles] = await pool.query(
      'SELECT profile_picture FROM restaurant_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length > 0 && profiles[0].profile_picture) {
      const oldPicturePath = path.join(__dirname, '../uploads/restaurants', profiles[0].profile_picture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update profile picture
    await pool.query(
      'UPDATE restaurant_profiles SET profile_picture = ? WHERE user_id = ?',
      [profilePicture, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profile_picture: `${req.protocol}://${req.get('host')}/uploads/restaurants/${profilePicture}`
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant menu
exports.getMenu = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get restaurant profile ID
    const [profiles] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const restaurantId = profiles[0].id;

    // Get dishes
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE restaurant_id = ?',
      [restaurantId]
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
      menu: formattedDishes
    });
  } catch (error) {
    next(error);
  }
};

// Add new dish
exports.addDish = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { name, description, price, ingredients, category } = req.body;

    // Get restaurant profile ID
    const [profiles] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const restaurantId = profiles[0].id;

    // Add dish
    const [result] = await pool.query(
      `INSERT INTO dishes (restaurant_id, name, description, price, ingredients, category, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [restaurantId, name, description, price, ingredients, category, req.file?.filename || null]
    );

    const dishId = result.insertId;

    // Get the newly created dish
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE id = ?',
      [dishId]
    );

    // Format image URL
    const dish = dishes[0];
    if (dish.image) {
      dish.image = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image}`;
    }

    res.status(201).json({
      success: true,
      message: 'Dish added successfully',
      dish
    });
  } catch (error) {
    next(error);
  }
};

// Update dish
exports.updateDish = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, price, ingredients, category } = req.body;

    // Get restaurant profile ID
    const [profiles] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const restaurantId = profiles[0].id;

    // Check if dish belongs to this restaurant
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );

    if (dishes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found or not owned by this restaurant'
      });
    }

    const oldImage = dishes[0].image;

    // If there's a new image, delete the old one
    if (req.file && oldImage) {
      const oldImagePath = path.join(__dirname, '../uploads/dishes', oldImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update dish
    await pool.query(
      `UPDATE dishes 
       SET name = ?, description = ?, price = ?, ingredients = ?, category = ?, 
           image = COALESCE(?, image)
       WHERE id = ? AND restaurant_id = ?`,
      [name, description, price, ingredients, category, req.file?.filename || null, id, restaurantId]
    );

    // Get updated dish
    const [updatedDishes] = await pool.query(
      'SELECT * FROM dishes WHERE id = ?',
      [id]
    );

    // Format image URL
    const dish = updatedDishes[0];
    if (dish.image) {
      dish.image = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image}`;
    }

    res.json({
      success: true,
      message: 'Dish updated successfully',
      dish
    });
  } catch (error) {
    next(error);
  }
};

// Delete dish
exports.deleteDish = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get restaurant profile ID
    const [profiles] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const restaurantId = profiles[0].id;

    // Check if dish belongs to this restaurant
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );

    if (dishes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found or not owned by this restaurant'
      });
    }

    // Delete dish image
    if (dishes[0].image) {
      const imagePath = path.join(__dirname, '../uploads/dishes', dishes[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete dish
    await pool.query(
      'DELETE FROM dishes WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );

    res.json({
      success: true,
      message: 'Dish deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant orders
exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Get restaurant profile ID
    const [profiles] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const restaurantId = profiles[0].id;

    // Build query based on status filter
    let query = `
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.restaurant_id = ?
    `;
    
    const queryParams = [restaurantId];
    
    if (status) {
      query += ' AND o.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY o.order_date DESC';

    // Get orders
    const [orders] = await pool.query(query, queryParams);

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

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Get restaurant profile ID
    const [profiles] = await pool.query(
      'SELECT id FROM restaurant_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const restaurantId = profiles[0].id;

    // Validate valid status transitions
    const validStatusTransitions = {
      'New': ['Order Received', 'Cancelled'],
      'Order Received': ['Preparing', 'Cancelled'],
      'Preparing': ['On the Way', 'Pick-up Ready', 'Cancelled'],
      'On the Way': ['Delivered', 'Cancelled'],
      'Pick-up Ready': ['Picked Up', 'Cancelled'],
      'Delivered': [],
      'Picked Up': [],
      'Cancelled': []
    };

    // Get current order status
    const [orders] = await pool.query(
      'SELECT status FROM orders WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not owned by this restaurant'
      });
    }

    const currentStatus = orders[0].status;

    // Check if status transition is valid
    if (!validStatusTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from '${currentStatus}' to '${status}'`
      });
    }

    // Update order status
    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND restaurant_id = ?',
      [status, id, restaurantId]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};