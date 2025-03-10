// routes/customer.routes.js
const express = require('express');
const { check } = require('express-validator');
const customerController = require('../controllers/customer.controller');
const { verifyToken, isCustomer } = require('../middleware/auth.middleware');
const { uploadCustomerImage } = require('../middleware/upload.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);
router.use(isCustomer);

// Get customer profile
router.get('/profile', customerController.getProfile);

// Get current user info (for debugging)
router.get('/debug/user-info', customerController.getCurrentUserInfo);

// Update customer profile
router.put(
  '/profile',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('state', 'State must be 2 characters').optional().isLength({ min: 2, max: 2 }),
    check('country', 'Country is required').optional(),
    check('phone', 'Phone number is required').optional()
  ],
  customerController.updateProfile
);

// Upload profile picture
router.post(
  '/profile/upload-picture',
  uploadCustomerImage,
  customerController.uploadProfilePicture
);

// Get all restaurants
router.get('/restaurants', customerController.getAllRestaurants);

// Get restaurant details
router.get('/restaurants/:id', customerController.getRestaurantById);

// Get restaurant menu
router.get('/restaurants/:id/menu', customerController.getRestaurantMenu);

// Get all dishes for a specific restaurant
router.get('/restaurants/:id/dishes', customerController.getRestaurantDishes);

// Add restaurant to favorites
router.post(
  '/favorites/add',
  [
    check('restaurant_id', 'Restaurant ID is required').isNumeric()
  ],
  customerController.addToFavorites
);

// Remove restaurant from favorites
router.post(
  '/favorites/remove',
  [
    check('restaurant_id', 'Restaurant ID is required').isNumeric()
  ],
  customerController.removeFromFavorites
);

// Get favorites list
router.get('/favorites', customerController.getFavorites);

// Place an order
router.post(
  '/orders',
  [
    check('restaurant_id', 'Restaurant ID is required').isNumeric(),
    check('items', 'Items are required').isArray(),
    check('items.*.dish_id', 'Dish ID is required').isNumeric(),
    check('items.*.quantity', 'Quantity is required').isNumeric(),
    check('items.*.price', 'Price is required').isNumeric(),
    check('delivery_address', 'Delivery address is required').not().isEmpty(),
    check('total_amount', 'Total amount is required').isNumeric()
  ],
  customerController.placeOrder
);

// Get customer orders
router.get('/orders', customerController.getOrders);

// Get order details
router.get('/orders/:id', customerController.getOrderDetails);

// Get orders for a specific customer ID (for debugging)
router.get('/debug/orders/:customerId', customerController.getOrdersByCustomerId);

// Debug function to directly query the database
router.get('/debug/query-orders', customerController.debugQueryOrders);

// Cancel an order
router.post('/orders/:id/cancel', customerController.cancelOrder);

module.exports = router;