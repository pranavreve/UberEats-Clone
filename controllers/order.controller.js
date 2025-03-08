// controllers/order.controller.js
const { pool } = require('../config/db.config');

// Get order details by ID - accessible to both customer and restaurant
exports.getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const userType = req.user.user_type;

    let query, queryParams;

    if (userType === 'customer') {
      // If customer, only show their own orders
      query = `
        SELECT o.*, r.id as restaurant_id, u.name as restaurant_name
        FROM orders o
        JOIN restaurant_profiles r ON o.restaurant_id = r.id
        JOIN users u ON r.user_id = u.id
        WHERE o.id = ? AND o.customer_id = ?
      `;
      queryParams = [id, userId];
    } else {
      // If restaurant, only show orders for their restaurant
      query = `
        SELECT o.*, c.id as customer_id, u.name as customer_name
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        JOIN restaurant_profiles r ON o.restaurant_id = r.id
        JOIN customer_profiles c ON o.customer_id = c.user_id
        WHERE o.id = ? AND r.user_id = ?
      `;
      queryParams = [id, userId];
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
      `SELECT oi.*, d.name, d.image
       FROM order_items oi
       JOIN dishes d ON oi.dish_id = d.id
       WHERE oi.order_id = ?`,
      [id]
    );
    
    // Format dish images
    const formattedItems = items.map(item => {
      if (item.image) {
        item.image = `${req.protocol}://${req.get('host')}/uploads/dishes/${item.image}`;
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