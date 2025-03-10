// routes/order.routes.js
const express = require('express');
const { check } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { verifyToken, isRestaurant, isCustomer } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all orders for a customer
router.get('/list_customer_orders/', isCustomer, orderController.getCustomerOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Update order status (restaurant only)
router.put(
  '/:id/status',
  isRestaurant,
  [
    check('status', 'Status is required').not().isEmpty(),
    check('status', 'Invalid status').isIn([
      'New', 'Order Received', 'Preparing', 'On the Way', 
      'Pick-up Ready', 'Delivered', 'Picked Up', 'Cancelled', 'Rejected'
    ])
  ],
  orderController.updateOrderStatus
);

module.exports = router;