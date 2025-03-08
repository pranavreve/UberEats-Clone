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

    const { name, email, password, user_type, location } = req.body;

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
      // Create user
      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, user_type]
      );

      const userId = userResult.insertId;

      // Create profile based on user type
      if (user_type === 'customer') {
        await connection.query(
          'INSERT INTO customer_profiles (user_id) VALUES (?)',
          [userId]
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
          'INSERT INTO restaurant_profiles (user_id, location) VALUES (?, ?)',
          [userId, location]
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
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get profile ID
    let profileId = null;
    if (user.user_type === 'customer') {
      const [profiles] = await pool.query(
        'SELECT id FROM customer_profiles WHERE user_id = ?',
        [user.id]
      );
      if (profiles.length > 0) {
        profileId = profiles[0].id;
      }
    } else if (user.user_type === 'restaurant') {
      const [profiles] = await pool.query(
        'SELECT id FROM restaurant_profiles WHERE user_id = ?',
        [user.id]
      );
      if (profiles.length > 0) {
        profileId = profiles[0].id;
      }
    }

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
        expiresIn: process.env.JWT_EXPIRES_IN
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

// Get current user profile
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user data (excluding password)
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
      const [profiles] = await pool.query(
        'SELECT * FROM customer_profiles WHERE user_id = ?',
        [userId]
      );
      if (profiles.length > 0) {
        profileData = profiles[0];
      }
    } else if (user.user_type === 'restaurant') {
      const [profiles] = await pool.query(
        'SELECT * FROM restaurant_profiles WHERE user_id = ?',
        [userId]
      );
      if (profiles.length > 0) {
        profileData = profiles[0];
      }
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