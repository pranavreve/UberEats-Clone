// routes/restaurant.routes.js
const express = require('express');
const { check } = require('express-validator');
const restaurantController = require('../controllers/restaurant.controller');
const { verifyToken, isRestaurant } = require('../middleware/auth.middleware');
const { uploadRestaurantImage, uploadDishImage } = require('../middleware/upload.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);
router.use(isRestaurant);

// Get restaurant profile
router.get('/profile', restaurantController.getProfile);

// Update restaurant profile
router.put(
  '/profile',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('delivery_type', 'Delivery type is required').isIn(['Delivery', 'Pickup', 'Both']),
    check('contact_info', 'Contact info is required').not().isEmpty()
  ],
  restaurantController.updateProfile
);

// Upload profile picture
router.post(
  '/profile/upload-picture',
  uploadRestaurantImage,
  restaurantController.uploadProfilePicture
);

// Get restaurant menu
router.get('/menu', restaurantController.getMenu);

// Add new dish
router.post(
  '/dishes',
  uploadDishImage,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('category', 'Category is required').not().isEmpty()
  ],
  restaurantController.addDish
);

// Update dish
router.put(
  '/dishes/:id',
  uploadDishImage,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('category', 'Category is required').not().isEmpty()
  ],
  restaurantController.updateDish
);

// Delete dish
router.delete('/dishes/:id', restaurantController.deleteDish);

// Get restaurant orders
router.get('/orders', restaurantController.getOrders);

// Update order status
router.put(
  '/orders/:id/status',
  [
    check('status', 'Status is required').not().isEmpty(),
    check('status', 'Invalid status').isIn([
      'New', 'Order Received', 'Preparing', 'On the Way', 
      'Pick-up Ready', 'Delivered', 'Picked Up', 'Cancelled', 'Rejected'
    ])
  ],
  restaurantController.updateOrderStatus
);

module.exports = router;