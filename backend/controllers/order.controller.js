// controllers/order.controller.js
const { pool } = require('../config/db.config');

// Get all orders for a customer
exports.getCustomerOrders = async (req, res, next) => {
  try {
    const customerId = req.user.profile_id;
    console.log('Fetching orders for customer ID:', customerId);
    
    // Get all orders for this customer without ORDER BY to avoid column errors
    const [orders] = await pool.query(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.restaurant_id
       WHERE o.customer_id = ?`,
      [customerId]
    );
    
    console.log('Found orders:', orders.length);
    
    // Get items for each order
    for (let order of orders) {
      try {
        const [items] = await pool.query(
          `SELECT oi.*, d.name as dish_name, d.price as dish_price
           FROM order_items oi
           JOIN dishes d ON oi.dish_id = d.dish_id
           WHERE oi.order_id = ?`,
          [order.order_id]
        );
        
        order.items = items;
        order.total_items = items.reduce((sum, item) => sum + parseInt(item.quantity), 0);
      } catch (itemError) {
        console.error(`Error fetching items for order ${order.order_id}:`, itemError);
        order.items = [];
        order.total_items = 0;
        order.itemsError = itemError.message;
      }
    }
    
    // Sort orders by order_time if available, otherwise don't sort
    if (orders.length > 0 && orders[0].order_time) {
      orders.sort((a, b) => new Date(b.order_time) - new Date(a.order_time));
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    next(error);
  }
};

// Get order details by ID - accessible to both customer and restaurant
exports.getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileId = req.user.profile_id;
    const { id } = req.params;
    const userType = req.user.user_type;

    let query, queryParams;

    if (userType === 'customer') {
      // If customer, only show their own orders
      query = `
        SELECT o.*, r.restaurant_id, r.name as restaurant_name
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.restaurant_id
        WHERE o.order_id = ? AND o.customer_id = ?
      `;
      queryParams = [id, profileId];
    } else {
      // If restaurant, only show orders for their restaurant
      query = `
        SELECT o.*, c.customer_id, c.name as customer_name
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        WHERE o.order_id = ? AND o.restaurant_id = ?
      `;
      queryParams = [id, profileId];
    }

    const [orders] = await pool.query(query, queryParams);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.query(
      `SELECT oi.*, d.name, d.image_url
       FROM order_items oi
       JOIN dishes d ON oi.dish_id = d.dish_id
       WHERE oi.order_id = ?`,
      [id]
    );
    
    // Format dish images
    const formattedItems = items.map(item => {
      if (item.image_url) {
        item.image_url = `${req.protocol}://${req.get('host')}/uploads/dishes/${item.image_url}`;
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

// Update order status (restaurant only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const restaurantId = req.user.profile_id;
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating order ${id} status to ${status} for restaurant ${restaurantId}`);

    // Validate valid status transitions
    const validStatusTransitions = {
      'New': ['Order Received', 'Rejected'],
      'Order Received': ['Preparing', 'Rejected'],
      'Preparing': ['On the Way', 'Pick-up Ready'],
      'On the Way': ['Delivered'],
      'Pick-up Ready': ['Picked Up'],
      'Delivered': [],
      'Picked Up': [],
      'Rejected': []
    };

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

    const currentStatus = orders[0].status;

    // Check if status transition is valid
    if (!validStatusTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from '${currentStatus}' to '${status}'`
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