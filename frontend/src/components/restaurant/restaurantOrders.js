import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-scroll";
import "./restaurantOrders.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import UpdateIcon from "@mui/icons-material/Update";
import NavBar from "../navbar";

class RestaurantOrders extends Component {
  state = {
    restaurantDetails: JSON.parse(sessionStorage.getItem("restaurantDetails")),
    orders: {},
    selectedOrder: null,
    selectedCustomer: null,
    openOrderModal: false,
    openCustomerModal: false,
  };

  componentDidMount() {
    const restaurantId = this.state.restaurantDetails.id;

    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/restaurant/${restaurantId}/`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          const ordersByStatus = {};
          response.data.forEach((order) => {
            if (!ordersByStatus[order.order_status]) {
              ordersByStatus[order.order_status] = [];
            }
            ordersByStatus[order.order_status].push(order);
          });
          this.setState({ orders: ordersByStatus });
          console.log("ordersByStatus", ordersByStatus);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleOrderModalOpen = (orderId) => {
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
          this.setState({ selectedOrder: response.data, openOrderModal: true });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleOrderModalClose = () => {
    this.setState({ openOrderModal: false, selectedOrder: null });
  };

  handleCustomerModalOpen = (customerId) => {
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/customer/${customerId}/`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            selectedCustomer: response.data,
            openCustomerModal: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleCustomerModalClose = () => {
    this.setState({ openCustomerModal: false, selectedCustomer: null });
  };

  changeOrderStatus = (status) => {
    const { selectedOrder } = this.state;
    axios
      .put(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/update/${selectedOrder.id}/`,
        { order_status: status },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          this.setState({ openOrderModal: false, selectedOrder: null });
          this.componentDidMount(); // Refresh orders
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  renderOrderModal = () => {
    const { selectedOrder } = this.state;
    if (!selectedOrder) return null;

    return (
      <Modal
        open={this.state.openOrderModal}
        onClose={this.handleOrderModalClose}
      >
        <Box className="modal-box">
          <div className="modal-header">
            <h2>Order Details</h2>
            <button
              className="close-button"
              onClick={this.handleOrderModalClose}
            >
              &times;
            </button>
          </div>
          <div className="modal-content">
            <div className="order-items">
              {selectedOrder.items.map((item) => (
                <div className="order-item" key={item.id}>
                  <div className="item-name">{item.dish_name}</div>
                  <div className="item-quantity">x{item.quantity}</div>
                  <div className="item-price">
                    ${parseFloat(item.dish_price) * parseInt(item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-total">
              <div>Total</div>
              <div>${parseFloat(selectedOrder.total_price)}</div>
            </div>
            <div className="order-status-actions">
              {selectedOrder.order_status === "Placed" && (
                <button
                  className="status-button"
                  onClick={() => this.changeOrderStatus("Preparing")}
                >
                  Start Preparing
                </button>
              )}
              {selectedOrder.order_status === "Preparing" && (
                <button
                  className="status-button"
                  onClick={() => this.changeOrderStatus("ReadyToBePicked")}
                >
                  Mark as Ready
                </button>
              )}
              {selectedOrder.order_status === "ReadyToBePicked" && (
                <button
                  className="status-button"
                  onClick={() => this.changeOrderStatus("Delivered")}
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </Box>
      </Modal>
    );
  };

  renderCustomerModal = () => {
    const { selectedCustomer } = this.state;
    if (!selectedCustomer) return null;

    return (
      <Modal
        open={this.state.openCustomerModal}
        onClose={this.handleCustomerModalClose}
      >
        <Box className="modal-box">
          <div className="modal-header">
            <h2>Customer Profile</h2>
            <button
              className="close-button"
              onClick={this.handleCustomerModalClose}
            >
              &times;
            </button>
          </div>
          <div className="modal-content">
            <div className="customer-profile">
              <img
                src={selectedCustomer.avatar}
                alt="Customer Avatar"
                className="customer-avatar"
              />
              <div className="customer-info">
                <div className="customer-name">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </div>
                <div className="customer-email">{selectedCustomer.email}</div>
                <div className="customer-phone">
                  {selectedCustomer.phone_number}
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    );
  };

  renderOrders = () => {
    const { orders } = this.state;
    const statuses = Object.keys(orders);

    return (
      <>
        <div className="order-status-tabs">
          <ul className="status-list">
            {statuses.map((status) => (
              <li className="status-item" key={status}>
                <Link to={status} spy={true} smooth={false} duration={500}>
                  {status}
                </Link>
              </li>
            ))}
          </ul>
          <hr className="horizontal-rule" />
        </div>
        <div className="orders-container">
          {statuses.map((status) => (
            <div className="order-status-section" id={status} key={status}>
              <h3 className="status-heading">{status}</h3>
              <div className="order-cards">
                {orders[status].map((order) => (
                  <Card className="order-card" key={order.order_id}>
                    <CardContent className="order-card-content">
                      <div className="order-info">
                        <div
                          className="customer-name"
                          onClick={() =>
                            this.handleCustomerModalOpen(order.customer_id)
                          }
                        >
                          {order.customer_name}
                        </div>
                        <div
                          className="order-details-button"
                          onClick={() => this.handleOrderModalOpen(order.order_id)}
                        >
                          <UpdateIcon />
                        </div>
                      </div>
                      <div className="order-date">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                      <div className="order-address">
                        {order.delivery_address}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  render() {
    return (
      <>
        <NavBar/>
        {this.renderOrderModal()}
        {this.renderCustomerModal()}
        <div>
          <figure className="figureClass">
            <div className="figureDiv">
              <img
                className="imginFig"
                src={this.state.restaurantDetails.profile_picture}
                alt={this.state.restaurantDetails.name}
              />
            </div>
          </figure>
          <div className="imgBck">
            <div className="imgBckspace"></div>
            <div className="imgtxtContainer">
              <div className="imgtxtCo">
                <div className="imgtxtleftspace"></div>
                <div className="imgtxtleftContainer">
                  <div className="spacer_40"></div>
                  <div>
                    <h2 style={{ color: "white", marginBottom: "50px" }}>
                      {this.state.restaurantDetails.name}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-container">
            <div className="restaurant-address">
              {this.state.restaurantDetails.location}
            </div>
            {this.renderOrders()}
          </div>
        </div>
      </>
    );
  }
}

export default RestaurantOrders;
