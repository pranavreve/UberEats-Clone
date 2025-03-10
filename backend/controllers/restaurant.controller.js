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
       FROM restaurants r
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

    // Ensure all required fields have default values if they're missing
    profile.description = profile.description || '';
    profile.location = profile.location || '';
    profile.delivery_type = profile.delivery_type || 'Both';
    profile.contact_info = profile.contact_info || '';
    profile.opening_time = profile.opening_time || '';
    profile.closing_time = profile.closing_time || '';

    // Format profile picture URL if exists
    if (profile.profile_image) {
      profile.profile_image = `${req.protocol}://${req.get('host')}/uploads/restaurants/${profile.profile_image}`;
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching restaurant profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
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

    console.log('Updating profile for user ID:', userId);
    console.log('Profile data:', { name, description, location, delivery_type, contact_info, opening_time, closing_time });

    // Update user name
    await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, userId]
    );

    // Check if all required columns exist in the restaurants table
    try {
      // First, check if the delivery_type column exists
      try {
        await pool.query('SELECT delivery_type FROM restaurants LIMIT 1');
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log('Adding missing delivery_type column to restaurants table');
          await pool.query(
            `ALTER TABLE restaurants 
             ADD COLUMN delivery_type VARCHAR(50) DEFAULT 'Both' AFTER location`
          );
        } else {
          throw error;
        }
      }

      // Check if the contact_info column exists
      try {
        await pool.query('SELECT contact_info FROM restaurants LIMIT 1');
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log('Adding missing contact_info column to restaurants table');
          await pool.query(
            `ALTER TABLE restaurants 
             ADD COLUMN contact_info VARCHAR(100) AFTER delivery_type`
          );
        } else {
          throw error;
        }
      }

      // Check if the opening_time column exists
      try {
        await pool.query('SELECT opening_time FROM restaurants LIMIT 1');
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log('Adding missing opening_time column to restaurants table');
          await pool.query(
            `ALTER TABLE restaurants 
             ADD COLUMN opening_time TIME AFTER contact_info`
          );
        } else {
          throw error;
        }
      }

      // Check if the closing_time column exists
      try {
        await pool.query('SELECT closing_time FROM restaurants LIMIT 1');
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log('Adding missing closing_time column to restaurants table');
          await pool.query(
            `ALTER TABLE restaurants 
             ADD COLUMN closing_time TIME AFTER opening_time`
          );
        } else {
          throw error;
        }
      }

      // Now that we've ensured all columns exist, update the restaurant profile
      console.log('Updating restaurant profile with all columns');
      await pool.query(
        `UPDATE restaurants 
         SET description = ?, location = ?, delivery_type = ?, 
             contact_info = ?, opening_time = ?, closing_time = ?
         WHERE user_id = ?`,
        [description, location, delivery_type, contact_info, opening_time, closing_time, userId]
      );

      console.log('Restaurant profile updated successfully');
    } catch (error) {
      console.error('Error during profile update:', error);
      throw error;
    }

    // Get the updated profile to return to the client
    const [profiles] = await pool.query(
      `SELECT r.*, u.name, u.email 
       FROM restaurants r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = ?`,
      [userId]
    );

    const profile = profiles[0];
    
    // Format profile picture URL if exists
    if (profile.profile_image) {
      profile.profile_image = `${req.protocol}://${req.get('host')}/uploads/restaurants/${profile.profile_image}`;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Upload restaurant profile picture
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
      'SELECT profile_image FROM restaurants WHERE user_id = ?',
      [userId]
    );

    if (profiles.length > 0 && profiles[0].profile_image) {
      const oldPicturePath = path.join(__dirname, '../uploads/restaurants', profiles[0].profile_image);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update profile picture
    await pool.query(
      'UPDATE restaurants SET profile_image = ? WHERE user_id = ?',
      [profileImage, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profile_image: `${req.protocol}://${req.get('host')}/uploads/restaurants/${profileImage}`
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
      'SELECT restaurant_id FROM restaurants WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    const restaurantId = profiles[0].restaurant_id;

    // Get dishes
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE restaurant_id = ?',
      [restaurantId]
    );

    // Format dish images
    const formattedDishes = dishes.map(dish => {
      if (dish.image_url) {
        dish.image_url = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image_url}`;
      }
      return dish;
    });

    res.json(formattedDishes);
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
    let restaurantId = req.user.profile_id;
    
    // If profile_id is not in the token, fetch the restaurant_id from the database
    if (!restaurantId) {
      const [profiles] = await pool.query(
        'SELECT restaurant_id FROM restaurants WHERE user_id = ?',
        [userId]
      );

      if (profiles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant profile not found'
        });
      }
      
      restaurantId = profiles[0].restaurant_id;
    }

    const { name, description, price, ingredients, category } = req.body;
    const imageUrl = req.file ? req.file.filename : null;

    // Add dish
    const [result] = await pool.query(
      `INSERT INTO dishes (restaurant_id, name, description, price, ingredients, category, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [restaurantId, name, description, price, ingredients || null, category, imageUrl]
    );

    const dishId = result.insertId;

    // Get the newly created dish
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE dish_id = ?',
      [dishId]
    );

    // Format image URL
    const dish = dishes[0];
    if (dish.image_url) {
      dish.image_url = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image_url}`;
    }

    res.status(201).json({
      success: true,
      message: 'Dish added successfully',
      dish
    });
  } catch (error) {
    console.error('Error adding dish:', error);
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

    const dishId = req.params.id;
    const restaurantId = req.user.profile_id;
    const { name, description, price, ingredients, category } = req.body;

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    // Check if dish belongs to this restaurant
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE dish_id = ? AND restaurant_id = ?',
      [dishId, restaurantId]
    );

    if (dishes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found or not owned by this restaurant'
      });
    }

    const oldImage = dishes[0].image_url;
    const newImage = req.file ? req.file.filename : null;
    
    // If new image is uploaded and old image exists, delete old image
    if (newImage && oldImage) {
      const oldImagePath = path.join(__dirname, '../uploads/dishes', oldImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old image:', err);
      });
    }

    // Update dish
    await pool.query(
      `UPDATE dishes
       SET name = ?, description = ?, price = ?, ingredients = ?, category = ?, 
           image_url = COALESCE(?, image_url)
       WHERE dish_id = ? AND restaurant_id = ?`,
      [name, description, price, ingredients || null, category, newImage, dishId, restaurantId]
    );

    // Get updated dish
    const [updatedDishes] = await pool.query(
      'SELECT * FROM dishes WHERE dish_id = ?',
      [dishId]
    );

    // Format image URL
    const dish = updatedDishes[0];
    if (dish.image_url) {
      dish.image_url = `${req.protocol}://${req.get('host')}/uploads/dishes/${dish.image_url}`;
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
    const dishId = req.params.id;
    const restaurantId = req.user.profile_id;

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    // Check if dish belongs to this restaurant
    const [dishes] = await pool.query(
      'SELECT * FROM dishes WHERE dish_id = ? AND restaurant_id = ?',
      [dishId, restaurantId]
    );

    if (dishes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found or not owned by this restaurant'
      });
    }

    // Delete dish image
    if (dishes[0].image_url) {
      const imagePath = path.join(__dirname, '../uploads/dishes', dishes[0].image_url);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    // Delete dish
    await pool.query(
      'DELETE FROM dishes WHERE dish_id = ? AND restaurant_id = ?',
      [dishId, restaurantId]
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
    const restaurantId = req.user.profile_id;
    console.log('Fetching orders for restaurant ID:', restaurantId);
    const { status } = req.query;

    // Build query based on status filter
    let query = `
      SELECT o.order_id, o.customer_id, o.restaurant_id, o.status, o.total_amount, o.delivery_address, o.order_time, 
             c.name as customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.restaurant_id = ?
    `;
    
    const queryParams = [restaurantId];
    
    if (status) {
      query += ' AND o.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY o.order_time DESC';

    // Get orders
    const [orders] = await pool.query(query, queryParams);
    console.log('Found orders:', orders.length);

    // Get order items for each order
    const formattedOrders = [];
    
    for (const order of orders) {
      try {
        const [items] = await pool.query(
          `SELECT oi.order_item_id, oi.order_id, oi.dish_id, oi.quantity, oi.price_each,
                  d.name as dish_name, d.price as dish_price
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

    console.log('Returning formatted orders:', formattedOrders.length);
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error getting restaurant orders:', error);
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

    const restaurantId = req.user.profile_id;
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating order ${id} status to ${status} for restaurant ${restaurantId}`);

    // Verify the order belongs to this restaurant
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE order_id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to this restaurant'
      });
    }

    try {
      // Update order status
      await pool.query(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        [status, id]
      );
      
      console.log(`Order ${id} status updated to ${status}`);
      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } catch (updateError) {
      console.error('Error updating order status:', updateError);
      
      // Check if it's a data truncation error
      if (updateError.code === 'WARN_DATA_TRUNCATED') {
        // Try to alter the column to accept longer values
        try {
          await pool.query(
            "ALTER TABLE orders MODIFY COLUMN status ENUM('New', 'Order Received', 'Preparing', 'On the Way', 'Pick-up Ready', 'Delivered', 'Picked Up', 'Cancelled', 'Rejected')"
          );
          
          // Try the update again
          await pool.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [status, id]
          );
          
          console.log(`Order ${id} status updated to ${status} after altering table`);
          res.json({
            success: true,
            message: 'Order status updated successfully'
          });
        } catch (alterError) {
          console.error('Error altering orders table:', alterError);
          res.status(500).json({
            success: false,
            message: 'Failed to update order status due to database constraints'
          });
        }
      } else {
        throw updateError;
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    next(error);
  }
};