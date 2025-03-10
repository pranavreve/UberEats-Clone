const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db.config');
const { validationResult } = require('express-validator');

// Register a new user (customer or restaurant)
exports.register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, user_type, location, phone, country, state, profile_image } = req.body;

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create user in the users table (central authentication)
      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, user_type]
      );

      const userId = userResult.insertId;

      // Create profile based on user type
      if (user_type === 'customer') {
        await connection.query(
          'INSERT INTO customers (user_id, name, email, password_hash, phone, country, state, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [userId, name, email, hashedPassword, phone || null, country || null, state || null, profile_image || null]
        );
      } else if (user_type === 'restaurant') {
        if (!location) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            success: false,
            message: 'Location is required for restaurants'
          });
        }

        await connection.query(
          'INSERT INTO restaurants (user_id, name, email, password_hash, location, phone, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, name, email, hashedPassword, location, phone || null, profile_image || null]
        );
      } else {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: 'User registered successfully'
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

// Login user and generate JWT token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get profile ID based on user type
    let profileId = null;
    if (user.user_type === 'customer') {
      const [customers] = await pool.query(
        'SELECT customer_id FROM customers WHERE user_id = ?',
        [user.id]
      );
      if (customers.length > 0) {
        profileId = customers[0].customer_id;
      }
    } else if (user.user_type === 'restaurant') {
      const [restaurants] = await pool.query(
        'SELECT restaurant_id FROM restaurants WHERE user_id = ?',
        [user.id]
      );
      if (restaurants.length > 0) {
        profileId = restaurants[0].restaurant_id;
      }
    }

    // Create session for the user (using express-session)
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      user_type: user.user_type,
      profile_id: profileId
    };

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        profile_id: profileId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        profile_id: profileId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

// Get current user profile
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user data
    const [users] = await pool.query(
      'SELECT id, name, email, user_type FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    let profileData = {};

    // Get profile data based on user type
    if (user.user_type === 'customer') {
      const [customers] = await pool.query(
        'SELECT * FROM customers WHERE user_id = ?',
        [userId]
      );
      if (customers.length > 0) {
        profileData = customers[0];
      }
    } else if (user.user_type === 'restaurant') {
      const [restaurants] = await pool.query(
        'SELECT * FROM restaurants WHERE user_id = ?',
        [userId]
      );
      if (restaurants.length > 0) {
        profileData = restaurants[0];
      }
    }

    // Remove sensitive fields
    if (profileData.password_hash) {
      delete profileData.password_hash;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        profile: profileData
      }
    });
  } catch (error) {
    next(error);
  }
};