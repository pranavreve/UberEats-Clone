import React, { Component } from "react";
import axios from "axios";
import "./customerOrders.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { format } from "date-fns";
import Navbar from "../navbar"; // Assuming navbar.js is the common navbar component
import CustomerFooter from "../footer/customerFooter";

class CustomerOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      openModal: false,
      selectedOrder: null,
      selectedStatus: "",
    };
  }

  componentDidMount() {
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/list_customer_orders/`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          this.setState({ orders: response.data });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleOpen = (orderId) => {
    // Fetch order details
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/view_order/${orderId}/`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          this.setState({ selectedOrder: response.data, openModal: true });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleClose = () => {
    this.setState({ openModal: false, selectedOrder: null });
  };

  renderOrders = () => {
    const { orders, selectedStatus } = this.state;
    console.log("orders", orders);

    let filteredOrders = orders.filter((order) =>
      order.status.includes(selectedStatus)
    );

    if (filteredOrders.length === 0) {
      return <div>No orders found</div>;
    }

    console.log("filtered orders", filteredOrders);

    return filteredOrders.map((order) => {
      const formattedDate = format(new Date(order.created_at), "PPpp");
      return (
        <div key={order.id} className="order-item" onClick={() => this.handleOpen(order.id)}>
          <div className="order-header">
            <div className="restaurant-name">
              {order.restaurant_name} ({order.restaurant_location})
            </div>
            <div className="order-status">{order.status}</div>
          </div>
          <div className="order-details">
            {order.total_items} {order.total_items > 1 ? "items" : "item"} for ${order.total_price} • {formattedDate}
          </div>
        </div>
      );
    });
  };

  renderOrderModal = () => {
    const { selectedOrder } = this.state;
    if (!selectedOrder) return null;

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
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="modal-item">
                <div className="item-name">{item.dish_name}</div>
                <div className="item-quantity">x{item.quantity}</div>
                <div className="item-price">
                  ${parseFloat(item.dish_price) * parseInt(item.quantity)}
                </div>
              </div>
            ))}
            <div className="modal-total">
              <div>Total</div>
              <div>${parseFloat(selectedOrder.total_price)}</div>
            </div>
          </div>
        </Box>
      </Modal>
    );
  };

  handleStatusChange = (e) => {
    this.setState({ selectedStatus: e.target.value });
  };

  render() {
    return (
      <div className="customer-orders-container">
        <div>
        <Navbar />
        {this.renderOrderModal()}
        <div className="orders-header">
          <h3>Past Orders</h3>
          <select className="status-select" onChange={this.handleStatusChange}>
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Preparing">Preparing</option>
            <option value="On the Way">On the Way</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        <div className="orders-list">{this.renderOrders()}</div>
      </div>
      <CustomerFooter />
      </div>
    );
  }
}

export default CustomerOrders;
