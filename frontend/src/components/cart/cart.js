// import React, { Component } from 'react';
// import { Button } from 'react-bootstrap';
// import axios from 'axios';
// import './cart.css';
// import NavBar from '../navbar';

// class CustomerCart extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       cartItems: [], // Initialized as an empty array to avoid undefined issues
//     };
//   }

//   componentDidMount() {
//     // Fetch cart items when the component is mounted
//     this.fetchCartItems();
//   }

//   fetchCartItems = () => {
//     // Assuming there is a backend API to get cart items
//     axios
//       .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/cart/get_cart_items/`, {
//         headers: {
//           Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
//         },
//       })
//       .then((response) => {
//         if (response.status === 200) {
//           this.setState({ cartItems: response.data || [] });
//         }
//       })
//       .catch((err) => {
//         console.log('Error fetching cart items', err);
//       });
//   };

//   handleRemoveFromCart = (cartItemId) => {
//     // Assuming there's an API to remove items from the cart
//     axios
//       .delete(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/cart/remove_cart_item/${cartItemId}/`, {
//         headers: {
//           Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
//         },
//       })
//       .then((response) => {
//         if (response.status === 200) {
//           // Refresh cart items after removing
//           this.fetchCartItems();
//         }
//       })
//       .catch((err) => {
//         console.log('Error removing item from cart', err);
//       });
//   };

//   handleQuantityChange = (itemId, newQuantity) => {
//     // Update the quantity in the state
//     this.setState((prevState) => ({
//       cartItems: prevState.cartItems.map((item) =>
//         item.id === itemId ? { ...item, quantity: newQuantity } : item
//       ),
//     }));
//   };

//   handleUpdateQuantity = (itemId, newQuantity) => {
//     // Assuming there's an API to update the quantity of an item in the cart
//     axios
//       .put(
//         `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/cart/update_cart_item/${itemId}/`,
//         { item_id: itemId, quantity: newQuantity },
//         {
//           headers: {
//             Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
//           },
//         }
//       )
//       .then((response) => {
//         if (response.status === 200) {
//           // Refresh cart items after updating the quantity
//           this.fetchCartItems();
//         }
//       })
//       .catch((err) => {
//         console.log('Error updating item quantity', err);
//       });
//   };

//   handlePlaceOrder = () => {
//     // Assuming there's an API to place the order for all items in the cart
//     axios
//       .post(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/create_order/`, {}, {
//         headers: {
//           Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
//         },
//       })
//       .then((response) => {
//         if (response.status === 200) {
//           alert('Order placed successfully!');
//           // Clear the cart after placing the order
//           this.fetchCartItems();
//         }
//       })
//       .catch((err) => {
//         console.log('Error placing order', err);
//       });
//   };

//   renderCartItems = () => {
//     const { cartItems } = this.state;

//     console.log('cartItems', cartItems);

//     if (!cartItems || cartItems.length === 0) {
//       return (
//         <tr>
//           <td colSpan="5">Your cart is empty</td>
//         </tr>
//       );
//     }

//     return cartItems.map((item) => (
//       <tr key={item.id}>
//         <td>{item.dish_name}</td>
//         <td>
//           <input
//             type="number"
//             min="1"
//             value={item.quantity}
//             onChange={(e) => this.handleQuantityChange(item.id, e.target.value)}
//           />
//         </td>
//         <td>${item.total_price}</td>
//         <td>
//           <Button
//             variant="primary"
//             onClick={() => this.handleUpdateQuantity(item.id, item.quantity)}
//           >
//             Update
//           </Button>
//         </td>
//         <td>
//           <Button
//             variant="danger"
//             onClick={() => this.handleRemoveFromCart(item.id)}
//           >
//             Remove
//           </Button>
//         </td>
//       </tr>
//     ));
//   };

//   render() {
//     return (
//       <>
//         <NavBar />
//         <div className="cart-container">
//           <div className="cart-table-wrapper">
//             <h2 className="cart-heading">Your Cart</h2>
//             <table className="cart-table">
//               <thead>
//                 <tr>
//                   <th>Dish Name</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                   <th>Update</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>{this.renderCartItems()}</tbody>
//             </table>
//           </div>
//           {this.state.cartItems.length > 0 && (
//             <div className="place-order-wrapper-bottom">
//               <Button
//                 variant="success"
//                 onClick={this.handlePlaceOrder}
//                 className="place-order-button"
//               >
//                 Place Order
//               </Button>
//             </div>
//           )}
//         </div>
//       </>
//     );
//   }
// }

// export default CustomerCart;

import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import './cart.css';
import NavBar from '../navbar';

class CustomerCart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [], // Initialized as an empty array to avoid undefined issues
      successBanner: false, // State to control visibility of the success banner
    };
  }

  componentDidMount() {
    // Fetch cart items when the component is mounted
    this.fetchCartItems();
  }

  fetchCartItems = () => {
    // Assuming there is a backend API to get cart items
    axios
      .get(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/cart/get_cart_items/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          this.setState({ cartItems: response.data || [] });
        }
      })
      .catch((err) => {
        console.log('Error fetching cart items', err);
      });
  };

  handleRemoveFromCart = (cartItemId) => {
    // Assuming there's an API to remove items from the cart
    axios
      .delete(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/cart/remove_cart_item/${cartItemId}/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          // Refresh cart items after removing
          this.fetchCartItems();
        }
      })
      .catch((err) => {
        console.log('Error removing item from cart', err);
      });
  };

  handleQuantityChange = (itemId, newQuantity) => {
    // Update the quantity in the state
    this.setState((prevState) => ({
      cartItems: prevState.cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }));
  };

  handleUpdateQuantity = (itemId, newQuantity) => {
    // Assuming there's an API to update the quantity of an item in the cart
    axios
      .put(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/cart/update_cart_item/${itemId}/`,
        { item_id: itemId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          // Refresh cart items after updating the quantity
          this.fetchCartItems();
        }
      })
      .catch((err) => {
        console.log('Error updating item quantity', err);
      });
  };

  handlePlaceOrder = () => {
    // Assuming there's an API to place the order for all items in the cart
    axios
      .post(`${process.env.REACT_APP_UBEREATS_BACKEND_URL}/order/create_order/`, {}, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      })
      .then((response) => {
        if (response.status === 201) { // Status 201 indicates a successful creation
          // Show success banner and clear cart items
          this.setState({ successBanner: true, cartItems: [] });

          // Hide the success banner after 3 seconds
          setTimeout(() => {
            this.setState({ successBanner: false });
          }, 3000);
        }
      })
      .catch((err) => {
        console.log('Error placing order', err);
      });
  };

  renderCartItems = () => {
    const { cartItems } = this.state;

    if (!cartItems || cartItems.length === 0) {
      return (
        <tr>
          <td colSpan="5">Your cart is empty</td>
        </tr>
      );
    }

    return cartItems.map((item) => (
      <tr key={item.id}>
        <td>{item.dish_name}</td>
        <td>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => this.handleQuantityChange(item.id, e.target.value)}
          />
        </td>
        <td>${item.total_price}</td>
        <td>
          <Button
            variant="primary"
            onClick={() => this.handleUpdateQuantity(item.id, item.quantity)}
          >
            Update
          </Button>
        </td>
        <td>
          <Button
            variant="danger"
            onClick={() => this.handleRemoveFromCart(item.id)}
          >
            Remove
          </Button>
        </td>
      </tr>
    ));
  };

  render() {
    return (
      <>
        <NavBar />
        {this.state.successBanner && (
          <div className="success-banner">
            Order placed successfully!
          </div>
        )}
        <div className="cart-container">
          <div className="cart-table-wrapper">
            <h2 className="cart-heading">Your Cart</h2>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Dish Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>{this.renderCartItems()}</tbody>
            </table>
          </div>
          {this.state.cartItems.length > 0 && (
            <div className="place-order-wrapper-bottom">
              <Button
                variant="success"
                onClick={this.handlePlaceOrder}
                className="place-order-button"
              >
                Place Order
              </Button>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default CustomerCart;
