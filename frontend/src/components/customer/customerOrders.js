import React, { Component } from "react";
import axios from "axios";
import "./customerOrders.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { format } from "date-fns";
import Navbar from "../navbar"; // Assuming navbar.js is the common navbar component
import CustomerFooter from "../footer/customerFooter";
import { FaRegClock, FaCheck, FaHistory, FaTimes } from "react-icons/fa";

class CustomerOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      error: null,
      openModal: false,
      selectedOrder: null,
      activeTab: "current", // 'current' or 'past'
      cancellingOrder: false,
      loadingOrderDetails: true,
    };
  }

  componentDidMount() {
    this.fetchOrders();
  }

  fetchOrders = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/customer/login";
      return;
    }

    this.setState({ loading: true });
    
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Orders response:", response.data);
        const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);
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
    const orderId = order.order_id || order.id;
    console.log("Order ID:", orderId);
    
    // Always fetch the latest order details to ensure we have the most up-to-date information
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/customer/login";
      return;
    }
    
    // Set the selected order first so the modal opens immediately
    this.setState({ 
      selectedOrder: order, 
      openModal: true,
      loadingOrderDetails: true
    });
    
    // Then fetch the complete order details
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/orders/${orderId}`,
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

  // Cancel/reject an order
  cancelOrder = (orderId) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/customer/login";
      return;
    }

    this.setState({ cancellingOrder: true });

    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        // Update the order status locally
        const updatedOrders = this.state.orders.map(order => {
          if (order.order_id === orderId || order.id === orderId) {
            return { ...order, status: "Cancelled" };
          }
          return order;
        });
        
        this.setState({ 
          orders: updatedOrders,
          cancellingOrder: false,
          openModal: false,
          selectedOrder: null
        });
        
        alert("Order cancelled successfully");
      })
      .catch((error) => {
        console.error("Error cancelling order:", error);
        this.setState({
          cancellingOrder: false,
        });
        alert("Failed to cancel order. Please try again.");
      });
  };

  // Debug function to check token and user info
  debugToken = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return;
    }
    
    // Log the token
    console.log("Token:", token);
    
    // Decode the token (just the payload part)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      console.log("Decoded token:", decoded);
      
      // Alert the user with the profile_id
      alert(`Your user ID: ${decoded.id}\nYour profile ID: ${decoded.profile_id}`);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  // Debug function to check user info from backend
  checkUserInfo = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return;
    }
    
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/debug/user-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("User info response:", response.data);
        alert(`Backend User Info:\nUser ID: ${response.data.user.id}\nProfile ID: ${response.data.user.profile_id}`);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        alert("Error fetching user info. Check console for details.");
      });
  };

  // Debug function to check orders for a specific customer ID
  checkOrdersForCustomerId = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return;
    }
    
    const customerId = prompt("Enter customer ID to check orders for:");
    if (!customerId) {
      return;
    }
    
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/debug/orders/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(`Orders for customer ID ${customerId}:`, response.data);
        const orders = response.data.orders || [];
        alert(`Found ${orders.length} orders for customer ID ${customerId}. Check console for details.`);
        
        // Update the state with these orders
        this.setState({ 
          orders: orders,
          loading: false 
        });
      })
      .catch((error) => {
        console.error(`Error fetching orders for customer ID ${customerId}:`, error);
        alert(`Error fetching orders for customer ID ${customerId}. Check console for details.`);
      });
  };

  // Debug function to query all orders directly from the database
  queryAllOrders = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.log("No token found");
      return;
    }
    
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/api/customers/debug/query-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("All orders in database:", response.data);
        const orders = response.data.orders || [];
        const customers = response.data.customers || [];
        const users = response.data.users || [];
        
        alert(`Found ${orders.length} total orders, ${customers.length} customers, and ${users.length} users in the database. Check console for details.`);
      })
      .catch((error) => {
        console.error("Error querying all orders:", error);
        alert("Error querying all orders. Check console for details.");
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
      
      // Get order ID
      const orderId = order.order_id || order.id;
      
      // Get total amount
      const totalAmount = order.total_amount || order.total_price || 0;
      
      return (
        <div 
          key={orderId} 
          className="order-item" 
          onClick={() => this.handleOpen(order)}
        >
          <div className="order-header">
            <div className="restaurant-name">
              {order.restaurant_name} 
              {order.restaurant_location && `(${order.restaurant_location})`}
            </div>
            <div className={`order-status status-${order.status?.toLowerCase().replace(/\s+/g, '-') || "new"}`}>
              {order.status || "New"}
            </div>
          </div>
          <div className="order-details">
            {totalItems} {(totalItems !== 1) ? "items" : "item"} 
            for ${parseFloat(totalAmount).toFixed(2)} • {formattedDate}
          </div>
        </div>
      );
    });
  };

  renderOrderModal = () => {
    const { selectedOrder, cancellingOrder, loadingOrderDetails } = this.state;
    if (!selectedOrder) return null;

    console.log("Selected order for modal:", selectedOrder);

    // Get order date
    const orderDate = selectedOrder.order_time || selectedOrder.created_at || selectedOrder.order_date;
    const formattedDate = orderDate ? format(new Date(orderDate), "PPpp") : "Unknown date";
    
    // Get total amount
    const totalAmount = selectedOrder.total_amount || selectedOrder.total_price || 0;

    // Get order ID
    const orderId = selectedOrder.order_id || selectedOrder.id;

    // Check if order can be cancelled
    const canCancel = this.isCurrentOrder(selectedOrder.status || "New");

    // Check if items exist
    const hasItems = selectedOrder.items && selectedOrder.items.length > 0;
    console.log("Order has items:", hasItems, selectedOrder.items);

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
                  <p><strong>Restaurant:</strong> {selectedOrder.restaurant_name}</p>
                  <p><strong>Order Date:</strong> {formattedDate}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${selectedOrder.status?.toLowerCase().replace(/\s+/g, '-') || "new"}`}>{selectedOrder.status || "Processing"}</span></p>
                  {selectedOrder.delivery_address && (
                    <p><strong>Delivery Address:</strong> {selectedOrder.delivery_address}</p>
                  )}
                </div>
                
                <h3>Order Items</h3>
                {hasItems ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={item.order_item_id || item.id || `item-${index}`} className="modal-item">
                      <div className="item-name">{item.dish_name || item.name || `Item ${index + 1}`}</div>
                      <div className="item-quantity">x{item.quantity}</div>
                      <div className="item-price">
                        ${(parseFloat(item.price_each || item.dish_price || item.price) * parseInt(item.quantity)).toFixed(2)}
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

                {canCancel && (
                  <button 
                    className="cancel-order-btn"
                    onClick={() => this.cancelOrder(orderId)}
                    disabled={cancellingOrder}
                  >
                    {cancellingOrder ? "Cancelling..." : "Cancel Order"}
                  </button>
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
      <div className="customer-orders-container">
        <Navbar />
        
        <div className="orders-content">
          {this.renderOrderModal()}
          
          <div className="orders-header">
            <h1>My Orders</h1>
            <div>
              <button 
                className="refresh-button" 
                onClick={this.fetchOrders}
                style={{ marginRight: '10px' }}
              >
                Refresh Orders
              </button>
              <button 
                className="refresh-button-small" 
                onClick={this.debugToken}
                style={{ marginRight: '10px' }}
              >
                Debug Token
              </button>
              <button 
                className="refresh-button-small" 
                onClick={this.checkUserInfo}
                style={{ marginRight: '10px' }}
              >
                Check User Info
              </button>
              <button 
                className="refresh-button-small" 
                onClick={this.checkOrdersForCustomerId}
                style={{ marginRight: '10px' }}
              >
                Check Orders by ID
              </button>
              <button 
                className="refresh-button-small" 
                onClick={this.queryAllOrders}
              >
                Query All Orders
              </button>
            </div>
          </div>
          
          <div className="orders-tabs">
            <button 
              className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('current')}
            >
              <FaRegClock className="tab-icon" /> Current Orders
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('past')}
            >
              <FaHistory className="tab-icon" /> Past Orders
            </button>
          </div>
          
          <div className="orders-list">
            {this.renderOrdersByType(activeTab)}
          </div>
          
          <button 
            className="refresh-button" 
            onClick={this.fetchOrders}
          >
            Refresh Orders
          </button>
        </div>
        
        <CustomerFooter />
      </div>
    );
  }
}

export default CustomerOrders;
