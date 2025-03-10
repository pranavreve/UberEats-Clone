import React, { Component } from "react";
import axios from "axios";
import "./customerOrders.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { format } from "date-fns";
import Navbar from "../navbar";
import CustomerFooter from "../footer/customerFooter";
import { 
  FaRegClock, 
  FaHistory, 
  FaTimes, 
  FaMotorcycle, 
  FaStore,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

class CustomerOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      error: null,
      openModal: false,
      selectedOrder: null,
      activeTab: "current",
      cancellingOrder: false,
      loadingOrderDetails: true,
    };
  }

  componentDidMount() {
    this.fetchOrders();
    // Set up auto-refresh for current orders
    this.refreshInterval = setInterval(() => {
      if (this.state.activeTab === "current") {
        this.fetchOrders(false); // false means don't show loading state
      }
    }, 30000); // Refresh every 30 seconds
  }

  componentWillUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  fetchOrders = (showLoading = true) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/customer/login";
      return;
    }

    if (showLoading) {
      this.setState({ loading: true });
    }
    
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
        const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);
        this.setState({ 
          orders: orders,
          loading: false,
          error: null
        });
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        this.setState({
          error: "Unable to load orders at this time. Please try again later.",
          loading: false,
        });
      });
  };

  getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'new':
      case 'order received':
        return <FaRegClock />;
      case 'preparing':
        return <FaStore />;
      case 'on the way':
        return <FaMotorcycle />;
      case 'delivered':
      case 'picked up':
        return <FaCheckCircle />;
      case 'cancelled':
      case 'rejected':
        return <FaTimesCircle />;
      default:
        return <FaRegClock />;
    }
  };

  formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  handleOpen = (order) => {
    const orderId = order.order_id || order.id;
    const token = sessionStorage.getItem("authToken");
    
    if (!token) {
      window.location.href = "/customer/login";
      return;
    }
    
    this.setState({ 
      selectedOrder: order, 
      openModal: true,
      loadingOrderDetails: true
    });
    
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
        const orderDetails = response.data.order || response.data;
        this.setState({ 
          selectedOrder: orderDetails, 
          loadingOrderDetails: false
        });
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
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

  isCurrentOrder = (status) => {
    const currentStatuses = ["New", "Order Received", "Preparing", "On the Way", "Pick-up Ready"];
    return currentStatuses.some(s => status?.toLowerCase() === s.toLowerCase());
  };

  isPastOrder = (status) => {
    const pastStatuses = ["Delivered", "Picked Up", "Cancelled", "Rejected"];
    return pastStatuses.some(s => status?.toLowerCase() === s.toLowerCase());
  };

  cancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

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
      })
      .catch((error) => {
        console.error("Error cancelling order:", error);
        this.setState({
          cancellingOrder: false,
        });
        alert("Unable to cancel order at this time. Please try again later.");
      });
  };

  renderOrdersByType = (type) => {
    const { orders, loading, error } = this.state;
    
    if (loading) {
      return (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Loading your orders...
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-message">
          {error}
          <button 
            className="refresh-button" 
            onClick={() => this.fetchOrders()}
          >
            Try Again
          </button>
        </div>
      );
    }
    
    const filteredOrders = orders.filter(order => {
      const status = order.status || "New";
      return type === "current" ? this.isCurrentOrder(status) : this.isPastOrder(status);
    });

    if (filteredOrders.length === 0) {
      return (
        <div className="empty-message">
          {type === "current" ? (
            <>
              <FaRegClock size={24} />
              <p>No ongoing orders</p>
              <p>When you place an order, it will appear here</p>
            </>
          ) : (
            <>
              <FaHistory size={24} />
              <p>No past orders</p>
              <p>When you complete an order, it will appear here</p>
            </>
          )}
        </div>
      );
    }

    return filteredOrders.map((order) => {
      const orderDate = order.order_time || order.created_at || order.order_date;
      const formattedDate = orderDate ? format(new Date(orderDate), "MMM d, h:mm a") : "Unknown date";
      const totalItems = order.total_items || 
        (order.items ? order.items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0) : 0);
      const orderId = order.order_id || order.id;
      const totalAmount = order.total_amount || order.total_price || 0;
      
      return (
        <div 
          key={orderId} 
          className="order-item" 
          onClick={() => this.handleOpen(order)}
        >
          <div className="order-header">
            <div className="restaurant-info">
              <div className="restaurant-name">
                {order.restaurant_name}
              </div>
              <div className="order-details">
                {formattedDate} • {totalItems} {totalItems === 1 ? 'item' : 'items'} • {this.formatPrice(totalAmount)}
              </div>
            </div>
            <div className="order-status">
              {this.getStatusIcon(order.status)}
              <span>{order.status || "New"}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  renderOrderModal = () => {
    const { selectedOrder, cancellingOrder, loadingOrderDetails } = this.state;
    if (!selectedOrder) return null;

    const orderDate = selectedOrder.order_time || selectedOrder.created_at || selectedOrder.order_date;
    const formattedDate = orderDate ? format(new Date(orderDate), "PPpp") : "Unknown date";
    const totalAmount = selectedOrder.total_amount || selectedOrder.total_price || 0;
    const orderId = selectedOrder.order_id || selectedOrder.id;
    const canCancel = this.isCurrentOrder(selectedOrder.status || "New");
    const hasItems = selectedOrder.items && selectedOrder.items.length > 0;

    return (
      <Modal 
        open={this.state.openModal} 
        onClose={this.handleClose}
        aria-labelledby="order-details-modal"
      >
        <Box className="order-modal-box">
          <div className="modal-header">
            <h2>Order Details</h2>
            <button className="close-button" onClick={this.handleClose}>
              <FaTimes />
            </button>
          </div>
          <div className="modal-content">
            {loadingOrderDetails ? (
              <div className="loading-message">
                <div className="loading-spinner"></div>
                Loading order details...
              </div>
            ) : (
              <>
                <div className="order-info">
                  <p><strong>Order ID:</strong> #{orderId}</p>
                  <p><strong>Restaurant:</strong> {selectedOrder.restaurant_name}</p>
                  <p><strong>Ordered:</strong> {formattedDate}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span className={`status-badge status-${selectedOrder.status?.toLowerCase().replace(/\s+/g, '-') || "new"}`}>
                      {this.getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status || "Processing"}
                    </span>
                  </p>
                  {selectedOrder.delivery_address && (
                    <p><strong>Delivery to:</strong> {selectedOrder.delivery_address}</p>
                  )}
                </div>
                
                <h3>Order Items</h3>
                {hasItems ? (
                  <div className="order-items">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.order_item_id || item.id || `item-${index}`} className="modal-item">
                        <div className="item-name">{item.dish_name || item.name}</div>
                        <div className="item-quantity">×{item.quantity}</div>
                        <div className="item-price">
                          {this.formatPrice((item.price_each || item.dish_price || item.price) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-message">No items found for this order</div>
                )}

                <div className="modal-total">
                  <span>Total</span>
                  <span>{this.formatPrice(totalAmount)}</span>
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
            <h1>Orders</h1>
            <button 
              className="refresh-button" 
              onClick={() => this.fetchOrders()}
            >
              Refresh
            </button>
          </div>
          
          <div className="orders-tabs">
            <button 
              className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('current')}
            >
              <FaRegClock className="tab-icon" /> Current
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('past')}
            >
              <FaHistory className="tab-icon" /> Past
            </button>
          </div>
          
          <div className="orders-list">
            {this.renderOrdersByType(activeTab)}
          </div>
        </div>
        
        <CustomerFooter />
      </div>
    );
  }
}

export default CustomerOrders;
