import React, { Component } from "react";
import axios from "axios";
import "./restaurantOrders.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Navbar from "../navbar";
import { format } from "date-fns";

class RestaurantOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      filteredOrders: [],
      selectedOrder: null,
      openModal: false,
      loading: true,
      error: null,
      activeTab: "current"
    };
  }

  componentDidMount() {
    this.fetchOrders();
  }

  fetchOrders = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/restaurant/login";
      return;
    }

    this.setState({ loading: true });
    
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/restaurants/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Orders response:", response.data);
        const orders = Array.isArray(response.data) ? response.data : [];
        console.log("Processed orders:", orders);
        console.log("Current orders:", orders.filter(order => this.isCurrentOrder(order.status || "New")));
        console.log("Past orders:", orders.filter(order => this.isPastOrder(order.status || "New")));
        this.setState({ 
          orders: orders,
          loading: false 
        });
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        this.setState({
          error: "Failed to load orders. Please try again later.",
          loading: false,
        });
      });
  };

  handleOpen = (order) => {
    console.log("Opening order:", order);
    
    // Get the order ID
    const orderId = order.order_id;
    console.log("Order ID:", orderId);
    
    // Set the selected order first so the modal opens immediately
    this.setState({ 
      selectedOrder: order, 
      openModal: true,
      loadingOrderDetails: true
    });
    
    // Then fetch the complete order details
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/restaurant/login";
      return;
    }
    
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Order details response:", response.data);
        const orderDetails = response.data.order || response.data;
        
        // Update the selected order with the complete details
        this.setState({ 
          selectedOrder: orderDetails, 
          loadingOrderDetails: false
        });
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
        // Keep the modal open with the basic order info
        this.setState({ 
          loadingOrderDetails: false
        });
      });
  };

  handleClose = () => {
    this.setState({ 
      openModal: false, 
      selectedOrder: null 
    });
  };

  // Determine if an order is current or past
  isCurrentOrder = (status) => {
    if (!status) return true; // Default to current if no status
    
    const currentStatuses = ["New", "Order Received", "Preparing", "On the Way", "Pick-up Ready"];
    return currentStatuses.some(s => status.toLowerCase() === s.toLowerCase());
  };

  isPastOrder = (status) => {
    if (!status) return false; // Default to not past if no status
    
    const pastStatuses = ["Delivered", "Picked Up", "Cancelled", "Rejected"];
    return pastStatuses.some(s => status.toLowerCase() === s.toLowerCase());
  };

  updateOrderStatus = (status) => {
    const { selectedOrder } = this.state;
    const orderId = selectedOrder.order_id;
    
    console.log(`Updating order ${orderId} status to ${status}`);
    
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/restaurant/login";
      return;
    }
    
    axios
      .put(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Status update response:", response.data);
        alert(`Order status updated to ${status}`);
        this.handleClose();
        this.fetchOrders(); // Refresh orders
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
        alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
      });
  };

  renderOrdersByType = (type) => {
    const { orders, loading, error } = this.state;
    
    if (loading) {
      return <div className="loading-message">Loading orders...</div>;
    }
    
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    
    if (!orders || orders.length === 0) {
      return (
        <div className="empty-message">
          No orders found
          <button 
            className="refresh-button-small" 
            onClick={this.fetchOrders}
          >
            Refresh
          </button>
        </div>
      );
    }

    console.log(`Rendering ${type} orders from:`, orders);

    // Filter orders based on type
    let filteredOrders;
    if (type === "current") {
      filteredOrders = orders.filter(order => {
        const status = order.status || "New";
        const isCurrent = this.isCurrentOrder(status);
        console.log(`Order ${order.order_id} status: ${status}, isCurrent: ${isCurrent}`);
        return isCurrent;
      });
    } else {
      filteredOrders = orders.filter(order => {
        const status = order.status || "New";
        const isPast = this.isPastOrder(status);
        console.log(`Order ${order.order_id} status: ${status}, isPast: ${isPast}`);
        return isPast;
      });
    }

    console.log(`Filtered ${type} orders:`, filteredOrders);

    if (filteredOrders.length === 0) {
      return (
        <div className="empty-message">
          {type === "current" ? "No current orders" : "No past orders"}
          <button 
            className="refresh-button-small" 
            onClick={this.fetchOrders}
          >
            Refresh
          </button>
        </div>
      );
    }

    return filteredOrders.map((order) => {
      const orderDate = order.order_time || order.created_at || order.order_date;
      const formattedDate = orderDate ? format(new Date(orderDate), "PPpp") : "Unknown date";
      
      // Calculate total items if not already provided
      const totalItems = order.total_items || 
        (order.items ? order.items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0) : 0);
      
      // Get total amount
      const totalAmount = order.total_amount || 0;
      
      return (
        <div 
          key={order.order_id} 
          className="order-item" 
          onClick={() => this.handleOpen(order)}
        >
          <div className="order-header">
            <div className="customer-name">
              {order.customer_name || "Customer"}
            </div>
            <div className={`order-status status-${order.status?.toLowerCase().replace(/\s+/g, '-') || "new"}`}>
              {order.status || "New"}
            </div>
          </div>
          <div className="order-details">
            {totalItems} {(totalItems !== 1) ? "items" : "item"} 
            for ${parseFloat(totalAmount).toFixed(2)} • {formattedDate}
          </div>
          {order.delivery_address && (
            <div className="order-address">
              Delivery to: {order.delivery_address}
            </div>
          )}
        </div>
      );
    });
  };

  renderOrderModal = () => {
    const { selectedOrder, loadingOrderDetails } = this.state;
    if (!selectedOrder) return null;

    console.log("Selected order for modal:", selectedOrder);

    // Get order date
    const orderDate = selectedOrder.order_time || selectedOrder.created_at || selectedOrder.order_date;
    const formattedDate = orderDate ? format(new Date(orderDate), "PPpp") : "Unknown date";
    
    // Get total amount
    const totalAmount = selectedOrder.total_amount || 0;

    // Check if items exist
    const hasItems = selectedOrder.items && selectedOrder.items.length > 0;
    console.log("Order has items:", hasItems, selectedOrder.items);

    // Determine available status transitions
    const currentStatus = selectedOrder.status || "New";
    const statusTransitions = {
      'New': ['Order Received', 'Rejected'],
      'Order Received': ['Preparing', 'Rejected'],
      'Preparing': ['On the Way', 'Pick-up Ready'],
      'On the Way': ['Delivered'],
      'Pick-up Ready': ['Picked Up'],
      'Delivered': [],
      'Picked Up': [],
      'Rejected': []
    };
    
    const availableStatuses = statusTransitions[currentStatus] || [];

    return (
      <Modal open={this.state.openModal} onClose={this.handleClose}>
        <Box className="order-modal-box">
          <div className="modal-header">
            <h2>Order Details</h2>
            <button className="close-button" onClick={this.handleClose}>
              &times;
            </button>
          </div>
          <div className="modal-content">
            {loadingOrderDetails ? (
              <div className="loading-message">Loading order details...</div>
            ) : (
              <>
                <div className="order-info">
                  <p><strong>Customer:</strong> {selectedOrder.customer_name || "Customer"}</p>
                  <p><strong>Order Date:</strong> {formattedDate}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${selectedOrder.status?.toLowerCase().replace(/\s+/g, '-') || "new"}`}>{selectedOrder.status || "New"}</span></p>
                  {selectedOrder.delivery_address && (
                    <p><strong>Delivery Address:</strong> {selectedOrder.delivery_address}</p>
                  )}
                </div>
                
                <h3>Order Items</h3>
                {hasItems ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={item.order_item_id || `item-${index}`} className="modal-item">
                      <div className="item-name">{item.dish_name || `Item ${index + 1}`}</div>
                      <div className="item-quantity">x{item.quantity}</div>
                      <div className="item-price">
                        ${(parseFloat(item.price_each || item.dish_price) * parseInt(item.quantity)).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">No items found for this order</div>
                )}
                <div className="modal-total">
                  <div>Total</div>
                  <div>${parseFloat(totalAmount).toFixed(2)}</div>
                </div>

                {availableStatuses.length > 0 && (
                  <div className="order-status-actions">
                    <h3>Update Status</h3>
                    <div className="status-buttons">
                      {availableStatuses.map(status => (
                        <button 
                          key={status}
                          className={`status-button ${status === 'Rejected' ? 'status-button-reject' : ''}`}
                          onClick={() => this.updateOrderStatus(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Box>
      </Modal>
    );
  };

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab });
  };

  render() {
    const { activeTab } = this.state;
    
    return (
      <div className="restaurant-orders-container">
        <Navbar />
        
        <div className="orders-content">
          {this.renderOrderModal()}
          
          <div className="orders-header">
            <h1>Restaurant Orders</h1>
            <button 
              className="refresh-button" 
              onClick={this.fetchOrders}
            >
              Refresh Orders
            </button>
          </div>
          
          <div className="orders-tabs">
            <button 
              className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('current')}
            >
              Current Orders
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('past')}
            >
              Past Orders
            </button>
          </div>
          
          <div className="orders-list">
            {this.renderOrdersByType(activeTab)}
          </div>
        </div>
      </div>
    );
  }
}

export default RestaurantOrders;
