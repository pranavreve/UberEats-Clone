// routes/order.routes.js
const express = require('express');
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get order by ID
router.get('/:id', orderController.getOrderById);

module.exports = router;