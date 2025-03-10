const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and tables
const initDatabase = async () => {
  try {
    // First, create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();
    
    // Now create tables using the pool (which uses the database)
    const tables = [
      // Users table - central authentication table
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type ENUM('customer', 'restaurant') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )`,
      
      // Customers Table
      `CREATE TABLE IF NOT EXISTS customers (
        customer_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        country VARCHAR(100),
        state VARCHAR(2),
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )`,
      
      // Restaurants Table
      `CREATE TABLE IF NOT EXISTS restaurants (
        restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        phone VARCHAR(20),
        profile_image VARCHAR(255),
        opening_time TIME,
        closing_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_location (location)
      )`,
      
      // Dishes Table
      `CREATE TABLE IF NOT EXISTS dishes (
        dish_id INT PRIMARY KEY AUTO_INCREMENT,
        restaurant_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        ingredients TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
        INDEX idx_restaurant_id (restaurant_id),
        INDEX idx_category (category)
      )`,
      
      // Orders Table
      `CREATE TABLE IF NOT EXISTS orders (
        order_id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        status ENUM('New', 'Order Received', 'Preparing', 'On the Way', 'Pick-up Ready', 'Delivered', 'Picked Up', 'Cancelled') DEFAULT 'New',
        total_amount DECIMAL(10, 2) NOT NULL,
        order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id),
        INDEX idx_restaurant_id (restaurant_id),
        INDEX idx_status (status)
      )`,
      
      // OrderItems Table
      `CREATE TABLE IF NOT EXISTS order_items (
        order_item_id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        dish_id INT NOT NULL,
        quantity INT NOT NULL,
        price_each DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id)
      )`,
      
      // Favorites Table
      `CREATE TABLE IF NOT EXISTS favorites (
        customer_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (customer_id, restaurant_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id)
      )`,
      
      // Sessions table for authentication
      `CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
        expires INT UNSIGNED NOT NULL,
        data MEDIUMTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (session_id),
        INDEX idx_expires (expires)
      )`
    ];
    
    // Execute all table creation queries
    for (const query of tables) {
      await pool.query(query);
    }
    
    console.log('Database and tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

module.exports = { pool, initDatabase };