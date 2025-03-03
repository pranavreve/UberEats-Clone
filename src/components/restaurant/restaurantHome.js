
// import React, { Component } from "react";
// import "./restaurantHome.css";
// import axios from "axios";
// import { Link } from "react-scroll";
// import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import Modal from "@mui/material/Modal";
// import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";
// import dishIcon from "../../Images/bowl.svg";
// import Box from "@mui/material/Box";
// import NavBar from "../navbar";

// class RestaurantHome extends Component {
//   state = {
//     restaurantDetails: JSON.parse(sessionStorage.getItem("restaurantDetails")),
//     dishes: {}, // Stores dishes categorized by type
//     openAddDishModal: false,
//     successBanner: false, // State to control success banner visibility
//     newDish: {
//       name: "",
//       description: "",
//       price: "",
//       category: "",
//     },
//   };

//   componentDidMount() {
//     const token = sessionStorage.getItem("authToken"); // Updated key
//     const userType = sessionStorage.getItem("userType");
//     if (token && userType) {
//       // Navigate to home page if the customer is already logged in
//       this.fetchDishes();
//     }
//     else
//     {
//       window.location.href = "/restaurant/login";
//     }

//   }

//   // Function to fetch restaurant dishes
//   fetchDishes = () => {
//     console.log("restaurantDetails", this.state.restaurantDetails);

//     const restaurantId = this.state.restaurantDetails.id;
//     axios
//       .get(
//         `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/${restaurantId}/dishes/`,
//         {
//           headers: {
//             Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
//           },
//         }
//       )
//       .then((response) => {
//         if (response.status === 200) {
//           let dishesByCategory = {};
//           response.data.forEach((dish) => {
//             if (!dishesByCategory[dish.category]) {
//               dishesByCategory[dish.category] = [];
//             }
//             dishesByCategory[dish.category].push(dish);
//           });
//           this.setState({ dishes: dishesByCategory });
//         }
//       })
//       .catch((err) => {
//         console.log("Error fetching dishes:", err);
//       });
//   };

//   // Handlers for opening and closing the Add Dish modal
//   handleOpenAddDishModal = () => {
//     this.setState({ openAddDishModal: true });
//   };

//   handleCloseAddDishModal = () => {
//     this.setState({ openAddDishModal: false });
//   };

//   handleInputChange = (event) => {
//     const { name, value } = event.target;
//     this.setState((prevState) => ({
//       newDish: {
//         ...prevState.newDish,
//         [name]: value,
//       },
//     }));
//   };

//   // Function to handle adding a new dish
//   handleAddDishSubmit = () => {
//     const restaurantId = this.state.restaurantDetails.id;
//     const { newDish } = this.state;

//     axios
//       .post(
//         `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/add_dish/`,
//         newDish,
//         {
//           headers: {
//             Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
//           },
//         }
//       )
//       .then((response) => {
//         if (response.status === 201) {
//           // Show success banner and reset form data
//           this.setState({
//             successBanner: true,
//             openAddDishModal: false, // Close the modal
//             newDish: { name: "", description: "", price: "", category: "" },
//           });

//           // Refresh dishes list
//           this.fetchDishes();

//           // Hide the success banner after 2 seconds
//           setTimeout(() => {
//             this.setState({ successBanner: false });
//           }, 2000);
//         }
//       })
//       .catch((error) => {
//         console.error("Error adding dish:", error);
//       });
//   };

//   renderDishes = () => {
//     const { dishes } = this.state;
//     const categories = Object.keys(dishes);

//     return (
//       <>
//         <div className="row sticky-header">
//           <ul className="category-list">
//             {categories.map((category) => (
//               <li className="category-item" key={category}>
//                 <Link to={category} spy={true} smooth={false} duration={1000}>
//                   <label>{category}</label>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//           <hr className="horizontalRule" />
//         </div>

//         <div style={{ position: "relative" }}>
//           {categories.map((category) => (
//             <div className="row category-section" id={category} key={category}>
//               <label className="categorySubtxt">{category}</label>

//               {dishes[category].map((dish) => (
//                 <div className="col-md-4 dish-card-container" key={dish.id}>
//                   <Card className="dish-card">
//                     <CardContent className="dish-card-content">
//                       <div className="dish-info">
//                         <div className="dish-name">{dish.name}</div>
//                         <div className="dish-description">{dish.description}</div>
//                       </div>
//                       <div className="dish-price">${dish.price}</div>
//                     </CardContent>
//                     {dish.image && (
//                       <img src={dish.image} alt={dish.name} className="dish-card-media" />
//                     )}
//                   </Card>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </>
//     );
//   };

//   render() {
//     const { openAddDishModal, newDish, successBanner, restaurantDetails } = this.state;

//     return (
//       <>
//         <NavBar />
//         {successBanner && (
//           <div style={{ backgroundColor: "green", color: "white", padding: "10px", textAlign: "center" }}>
//             Dish Added Successfully
//           </div>
//         )}
//         <div>
//           {restaurantDetails && (
//             <>
//               <div className="imgBck">
//                 <div className="imgBckspace"></div>
//                 <div className="imgtxtContainer">
//                   <div className="imgtxtCo">
//                     <div className="imgtxtleftspace"></div>
//                     <div className="imgtxtleftContainer">
//                       <div className="spacer_40"></div>
//                       <div>
//                         <h2 style={{ color: "white", marginBottom: "50px" }}>
//                           {`${restaurantDetails.name} (${restaurantDetails.location.split(",")[0]})`}
//                         </h2>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="imgButtons sticky-add-dish">
//                     <button className="priceButton" onClick={this.handleOpenAddDishModal}>
//                       <div className="button-content">
//                         <img src={dishIcon} alt="Add Dish" className="dish-icon" />
//                         <span style={{ cursor: "pointer" }}>Add Dish</span>
//                       </div>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//         <div className="content-container">
//           {restaurantDetails && <div className="restaurant-address">{restaurantDetails.location}</div>}
//           {this.renderDishes()}
//         </div>

//         <Modal
//           open={openAddDishModal}
//           onClose={this.handleCloseAddDishModal}
//           aria-labelledby="add-dish-modal"
//           aria-describedby="modal-to-add-dish"
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: 400,
//               bgcolor: "background.paper",
//               boxShadow: 24,
//               p: 4,
//               borderRadius: 2,
//             }}
//           >
//             <h2>Add New Dish</h2>
//             <TextField
//               label="Dish Name"
//               name="name"
//               value={newDish.name}
//               onChange={this.handleInputChange}
//               fullWidth
//               margin="normal"
//             />
//             <TextField
//               label="Description"
//               name="description"
//               value={newDish.description}
//               onChange={this.handleInputChange}
//               fullWidth
//               margin="normal"
//             />
//             <TextField
//               label="Price"
//               name="price"
//               value={newDish.price}
//               onChange={this.handleInputChange}
//               fullWidth
//               margin="normal"
//             />
//             <TextField
//               label="Category"
//               name="category"
//               value={newDish.category}
//               onChange={this.handleInputChange}
//               fullWidth
//               margin="normal"
//             />
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={this.handleAddDishSubmit}
//               fullWidth
//               style={{ marginTop: "20px" }}
//             >
//               Add Dish
//             </Button>
//             <Button
//               variant="outlined"
//               color="secondary"
//               onClick={this.handleCloseAddDishModal}
//               fullWidth
//               style={{ marginTop: "10px" }}
//             >
//               Cancel
//             </Button>
//           </Box>
//         </Modal>
//       </>
//     );
//   }
// }

// export default RestaurantHome;


import React, { Component } from "react";
import "./restaurantHome.css";
import axios from "axios";
import { Link } from "react-scroll";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import dishIcon from "../../Images/bowl.svg";
import Box from "@mui/material/Box";
import NavBar from "../navbar";

class RestaurantHome extends Component {
  state = {
    restaurantDetails: JSON.parse(sessionStorage.getItem("restaurantDetails")),
    dishes: {}, // Stores dishes categorized by type
    openAddDishModal: false,
    successBanner: false, // State to control success banner visibility
    newDish: {
      name: "",
      description: "",
      price: "",
      category: "",
    },
  };

  componentDidMount() {
    const token = sessionStorage.getItem("authToken"); // Updated key
    const userType = sessionStorage.getItem("userType");
    if (token && userType) {
      this.fetchDishes();
    } else {
      window.location.href = "/restaurant/login";
    }
  }

  // Function to fetch restaurant dishes
  fetchDishes = () => {
    const restaurantId = this.state.restaurantDetails.id;
    axios
      .get(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/${restaurantId}/dishes/`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          let dishesByCategory = {};
          response.data.forEach((dish) => {
            if (!dishesByCategory[dish.category]) {
              dishesByCategory[dish.category] = [];
            }
            dishesByCategory[dish.category].push(dish);
          });
          this.setState({ dishes: dishesByCategory });
        }
      })
      .catch((err) => {
        console.log("Error fetching dishes:", err);
      });
  };

  // Handlers for opening and closing the Add Dish modal
  handleOpenAddDishModal = () => {
    this.setState({ openAddDishModal: true });
  };

  handleCloseAddDishModal = () => {
    this.setState({ openAddDishModal: false });
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      newDish: {
        ...prevState.newDish,
        [name]: value,
      },
    }));
  };

  // Function to handle adding a new dish
  handleAddDishSubmit = () => {
    const restaurantId = this.state.restaurantDetails.id;
    const { newDish } = this.state;

    axios
      .post(
        `${process.env.REACT_APP_UBEREATS_BACKEND_URL}/restaurant/add_dish/`,
        newDish,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 201) {
          // Show success banner and reset form data
          this.setState({
            successBanner: true,
            openAddDishModal: false, // Close the modal
            newDish: { name: "", description: "", price: "", category: "" },
          });

          // Refresh dishes list
          this.fetchDishes();

          // Hide the success banner after 2 seconds
          setTimeout(() => {
            this.setState({ successBanner: false });
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Error adding dish:", error);
      });
  };

  // renderDishes = () => {
  //   const { dishes } = this.state;
  //   const categories = Object.keys(dishes);

  //   return (
  //     <>
  //       <div className="row sticky-header">
  //         <ul className="category-list">
  //           {categories.map((category) => (
  //             <li className="category-item" key={category}>
  //               <Link to={category} spy={true} smooth={false} duration={1000}>
  //                 <label>{category}</label>
  //               </Link>
  //             </li>
  //           ))}
  //         </ul>
  //         <hr className="horizontalRule" />
  //       </div>

  //       <div style={{ position: "relative" }}>
  //         {categories.map((category) => (
  //           <div className="row category-section" id={category} key={category}>
  //             <label className="categorySubtxt">{category}</label>

  //             {dishes[category].map((dish) => (
  //               <div className="col-md-4 dish-card-container" key={dish.id}>
  //                 <Card className="dish-card">
  //                   <CardContent className="dish-card-content">
  //                     <div className="dish-info">
  //                       <div className="dish-name-price">
  //                         <span className="dish-name">{dish.name}</span>
  //                         <span className="dish-price">${dish.price}</span>
  //                       </div>
  //                       <div className="dish-description">{dish.description}</div>
  //                     </div>
  //                   </CardContent>
  //                   {dish.image && (
  //                     <img src={dish.image} alt={dish.name} className="dish-card-media" />
  //                   )}
  //                 </Card>
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //       </div>
  //     </>
  //   );
  // };
  // Updated renderDishes method in RestaurantHome component

  renderDishes = () => {
    const { dishes } = this.state;
    const categories = Object.keys(dishes);
  
    return (
      <>
        <div className="row sticky-header">
          <ul className="category-list">
            {categories.map((category) => (
              <li className="category-item" key={category}>
                <Link to={category} spy={true} smooth={false} duration={1000}>
                  <label>{category}</label>
                </Link>
              </li>
            ))}
          </ul>
          <hr className="horizontalRule" />
        </div>
  
        <div style={{ position: "relative" }}>
          {categories.map((category) => (
            <div className="row category-section" id={category} key={category}>
              <label className="categorySubtxt">{category}</label>
  
              {dishes[category].map((dish) => (
                <div className="col-md-4 dish-card-container" key={dish.id}>
                  <Card className="dish-card">
                    <CardContent className="dish-card-content">
                      <div className="dish-header">
                        <div className="dish-name">{dish.name}</div>
                        <div className="dish-price">${dish.price}</div>
                      </div>
                      <div className="dish-description">{dish.description}</div>
                    </CardContent>
                    {dish.image && (
                      <img src={dish.image} alt={dish.name} className="dish-card-media" />
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  };
  
  



  render() {
    const { openAddDishModal, newDish, successBanner, restaurantDetails } = this.state;

    return (
      <>
        <NavBar />
        {successBanner && (
          <div style={{ backgroundColor: "green", color: "white", padding: "10px", textAlign: "center" }}>
            Dish Added Successfully
          </div>
        )}
        <div>
          {restaurantDetails && (
            <>
              <div className="imgBck">
                <div className="imgBckspace"></div>
                <div className="imgtxtContainer">
                  <div className="imgtxtCo">
                    <div className="imgtxtleftspace"></div>
                    <div className="imgtxtleftContainer">
                      <div className="spacer_40"></div>
                      <div>
                        <h2 style={{ color: "white", marginBottom: "50px" }}>
                          {`${restaurantDetails.name} (${restaurantDetails.location.split(",")[0]})`}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="imgButtons sticky-add-dish">
                    <button className="priceButton" onClick={this.handleOpenAddDishModal}>
                      <div className="button-content">
                        <img src={dishIcon} alt="Add Dish" className="dish-icon" />
                        <span style={{ cursor: "pointer" }}>Add Dish</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="content-container">
          {restaurantDetails && <div className="restaurant-address">{restaurantDetails.location}</div>}
          {this.renderDishes()}
        </div>

        <Modal
          open={openAddDishModal}
          onClose={this.handleCloseAddDishModal}
          aria-labelledby="add-dish-modal"
          aria-describedby="modal-to-add-dish"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <h2>Add New Dish</h2>
            <TextField
              label="Dish Name"
              name="name"
              value={newDish.name}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={newDish.description}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Price"
              name="price"
              value={newDish.price}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Category"
              name="category"
              value={newDish.category}
              onChange={this.handleInputChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAddDishSubmit}
              fullWidth
              style={{ marginTop: "20px" }}
            >
              Add Dish
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.handleCloseAddDishModal}
              fullWidth
              style={{ marginTop: "10px" }}
            >
              Cancel
            </Button>
          </Box>
        </Modal>
      </>
    );
  }
}

export default RestaurantHome;
