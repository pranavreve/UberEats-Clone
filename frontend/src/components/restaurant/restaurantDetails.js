import React, { Component } from "react";
import "./restaurantDetails.css";
import { Navigate } from "react-router-dom";
import NavBar from "../navbar";
import { restaurantAPI } from "../../services/api";
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Alert, 
  Tabs, 
  Tab,
  ListGroup,
  Badge,
  Modal
} from 'react-bootstrap';

class RestaurantDetails extends Component {
  state = {
    redirectToHome: false,
    name: "",
    description: "",
    location: "",
    email: "",
    deliveryType: "",
    contact: "",
    startTime: "",
    endTime: "",
    selectedFile: null,
    profileImage: null,
    errors: {},
    successMessage: "",
    errorMessage: "",
    loading: true,
    dishes: [],
    showDishModal: false,
    currentDish: {
      dish_id: null,
      name: "",
      description: "",
      price: "",
      category: "",
      ingredients: "",
      image: null
    },
    isEditingDish: false,
    isSubmitting: false,
    isDishSubmitting: false,
    isDishDeleting: null
  };

  componentDidMount() {
    this.fetchProfileData();
    this.fetchDishes();
  }

  fetchProfileData = async () => {
    try {
      const response = await restaurantAPI.getProfile();
      const profile = response.data.profile;
      
      this.setState({
        name: profile.name || "",
        description: profile.description || "",
        location: profile.location || "",
        email: profile.email || "",
        contact: profile.contact_info || "",
        deliveryType: profile.delivery_type || "",
        startTime: profile.opening_time || "",
        endTime: profile.closing_time || "",
        profileImage: profile.profile_image || null,
        loading: false
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      this.setState({ 
        errorMessage: "Failed to load profile data. Please try again.",
        loading: false
      });
    }
  };

  fetchDishes = async () => {
    try {
      const response = await restaurantAPI.getDishes();
      this.setState({ dishes: response.data || [] });
    } catch (error) {
      console.error("Error fetching dishes:", error);
      this.setState({ errorMessage: "Failed to load dishes. Please try again." });
    }
  };

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errors: { ...this.state.errors, [e.target.name]: "" },
    });
  };

  handleDishInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      currentDish: {
        ...prevState.currentDish,
        [name]: value
      }
    }));
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ selectedFile: file });
  };

  handleDishImageChange = (e) => {
    const file = e.target.files[0];
    this.setState(prevState => ({
      currentDish: {
        ...prevState.currentDish,
        image: file
      }
    }));
  };

  validateForm = () => {
    const errors = {};
    const {
      name,
      description,
      location,
      deliveryType,
      contact,
      startTime,
      endTime,
    } = this.state;

    if (!name) errors.name = "Restaurant name is required";
    if (!description) errors.description = "Description is required";
    if (!location) errors.location = "Address is required";
    if (!deliveryType || deliveryType === "-1") errors.deliveryType = "Select delivery type";
    if (!contact) errors.contact = "Contact number is required";
    if (!startTime) errors.startTime = "Opening time is required";
    if (!endTime) errors.endTime = "Closing time is required";

    if (startTime && endTime) {
      const start = startTime.split(":");
      const end = endTime.split(":");

      if (start[0] > end[0] || (start[0] === end[0] && start[1] > end[1])) {
        errors.startTime = "Opening time should be before closing time";
      }
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  validateDishForm = () => {
    const { currentDish } = this.state;
    const errors = {};

    if (!currentDish.name) errors.dishName = "Dish name is required";
    if (!currentDish.description) errors.dishDescription = "Description is required";
    if (!currentDish.price) errors.dishPrice = "Price is required";
    if (!currentDish.category || currentDish.category === "-1") errors.dishCategory = "Category is required";

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    try {
      const {
        name,
        description,
        location,
        deliveryType,
        contact,
        startTime,
        endTime,
      } = this.state;

      // Show loading state
      this.setState({ isSubmitting: true, errorMessage: "" });

      // Update profile data
      const response = await restaurantAPI.updateProfile({
        name,
        description,
        location,
        delivery_type: deliveryType,
        contact_info: contact,
        opening_time: startTime,
        closing_time: endTime,
      });

      // If there's a new profile image, upload it
      if (this.state.selectedFile) {
        await restaurantAPI.uploadProfilePicture(this.state.selectedFile);
      }

      // Update session storage with new restaurant details
      if (response.data && response.data.profile) {
        sessionStorage.setItem(
          "restaurantDetails",
          JSON.stringify(response.data)
        );
      } else {
        // Refresh profile data if the response doesn't include the profile
        const profileResponse = await restaurantAPI.getProfile();
        sessionStorage.setItem(
          "restaurantDetails",
          JSON.stringify(profileResponse.data)
        );
      }
      
      this.setState({
        successMessage: "Profile updated successfully",
        errorMessage: "",
        selectedFile: null,
        isSubmitting: false
      });
      
      // Refresh profile data
      await this.fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      this.setState({
        errorMessage: "Failed to update profile. Please try again.",
        successMessage: "",
        isSubmitting: false
      });
    }
  };

  openAddDishModal = () => {
    this.setState({
      showDishModal: true,
      isEditingDish: false,
      currentDish: {
        dish_id: null,
        name: "",
        description: "",
        price: "",
        category: "",
        ingredients: "",
        image: null
      }
    });
  };

  openEditDishModal = (dish) => {
    this.setState({
      showDishModal: true,
      isEditingDish: true,
      currentDish: {
        ...dish,
        image: null // Don't load the existing image into the file input
      }
    });
  };

  closeDishModal = () => {
    this.setState({ showDishModal: false });
  };

  handleAddDish = async (e) => {
    e.preventDefault();
    
    if (!this.validateDishForm()) {
      return;
    }

    try {
      const { currentDish, isEditingDish } = this.state;
      
      // Show loading state
      this.setState({ isDishSubmitting: true, errorMessage: "" });
      
      if (isEditingDish) {
        await restaurantAPI.updateDish(currentDish.dish_id, currentDish);
      } else {
        await restaurantAPI.addDish(currentDish);
      }
      
      // Refresh dishes
      await this.fetchDishes();
      
      this.setState({
        showDishModal: false,
        successMessage: isEditingDish ? "Dish updated successfully" : "Dish added successfully",
        errorMessage: "",
        isDishSubmitting: false
      });
    } catch (error) {
      console.error("Error saving dish:", error);
      this.setState({
        errorMessage: "Failed to save dish. Please try again.",
        successMessage: "",
        isDishSubmitting: false
      });
    }
  };

  handleDeleteDish = async (dishId) => {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      try {
        // Show loading state
        this.setState({ isDishDeleting: dishId, errorMessage: "" });
        
        await restaurantAPI.deleteDish(dishId);
        
        // Refresh dishes
        await this.fetchDishes();
        
        this.setState({
          successMessage: "Dish deleted successfully",
          errorMessage: "",
          isDishDeleting: null
        });
      } catch (error) {
        console.error("Error deleting dish:", error);
        this.setState({
          errorMessage: "Failed to delete dish. Please try again.",
          successMessage: "",
          isDishDeleting: null
        });
      }
    }
  };

  render() {
    const { 
      errors, 
      successMessage, 
      errorMessage, 
      loading,
      dishes,
      showDishModal,
      currentDish,
      isEditingDish,
      isSubmitting,
      isDishSubmitting,
      isDishDeleting
    } = this.state;

    if (this.state.redirectToHome) {
      return <Navigate to="/restaurant/home" />;
    }

    if (loading) {
      return (
        <div>
          <NavBar />
          <Container className="mt-5">
            <div className="text-center">
              <h3>Loading profile data...</h3>
            </div>
          </Container>
        </div>
      );
    }

    return (
      <div>
        <NavBar />
        <Container className="mt-4 mb-5">
          <h2 className="text-center mb-4">Restaurant Management</h2>
          
          {successMessage && (
            <Alert variant="success" onClose={() => this.setState({ successMessage: "" })} dismissible>
              {successMessage}
            </Alert>
          )}
          
          {errorMessage && (
            <Alert variant="danger" onClose={() => this.setState({ errorMessage: "" })} dismissible>
              {errorMessage}
            </Alert>
          )}
          
          <Tabs defaultActiveKey="profile" className="mb-4">
            <Tab eventKey="profile" title="Profile Information">
              <Card>
                <Card.Body>
                  <Form onSubmit={this.handleProfileUpdate}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Restaurant Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleInputChange}
                            isInvalid={!!errors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={this.state.email}
                            disabled
                          />
                          <Form.Text className="text-muted">
                            Email cannot be changed
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={this.state.description}
                            onChange={this.handleInputChange}
                            isInvalid={!!errors.description}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.description}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="location"
                            value={this.state.location}
                            onChange={this.handleInputChange}
                            isInvalid={!!errors.location}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.location}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Delivery Type</Form.Label>
                          <Form.Select
                            name="deliveryType"
                            value={this.state.deliveryType}
                            onChange={this.handleInputChange}
                            isInvalid={!!errors.deliveryType}
                          >
                            <option value="-1">Select Delivery Type</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Pickup">Pickup</option>
                            <option value="Both">Both</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.deliveryType}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Contact Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="contact"
                            value={this.state.contact}
                            onChange={this.handleInputChange}
                            isInvalid={!!errors.contact}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.contact}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Row>
                          <Col>
                            <Form.Group className="mb-3">
                              <Form.Label>Opening Time</Form.Label>
                              <Form.Control
                                type="time"
                                name="startTime"
                                value={this.state.startTime}
                                onChange={this.handleInputChange}
                                isInvalid={!!errors.startTime}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.startTime}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          
                          <Col>
                            <Form.Group className="mb-3">
                              <Form.Label>Closing Time</Form.Label>
                              <Form.Control
                                type="time"
                                name="endTime"
                                value={this.state.endTime}
                                onChange={this.handleInputChange}
                                isInvalid={!!errors.endTime}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.endTime}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Profile Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={this.handleFileChange}
                          />
                          {this.state.profileImage && (
                            <div className="mt-2">
                              <img 
                                src={this.state.profileImage} 
                                alt="Restaurant" 
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                              />
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="menu" title="Menu Management">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Menu Items</h4>
                    <Button variant="success" onClick={this.openAddDishModal}>
                      Add New Dish
                    </Button>
                  </div>
                  
                  {dishes.length === 0 ? (
                    <Alert variant="info">
                      You haven't added any dishes yet. Click "Add New Dish" to get started.
                    </Alert>
                  ) : (
                    <ListGroup>
                      {dishes.map(dish => (
                        <ListGroup.Item key={dish.dish_id} className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            {dish.image_url && (
                              <img 
                                src={dish.image_url} 
                                alt={dish.name} 
                                style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }} 
                              />
                            )}
                            <div>
                              <h5>{dish.name}</h5>
                              <p className="mb-0">{dish.description}</p>
                              <div>
                                <Badge bg="secondary" className="me-2">${dish.price}</Badge>
                                <Badge bg="info">{dish.category}</Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => this.openEditDishModal(dish)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => this.handleDeleteDish(dish.dish_id)}
                              disabled={isDishDeleting === dish.dish_id}
                            >
                              {isDishDeleting === dish.dish_id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Container>
        
        {/* Dish Modal */}
        <Modal show={showDishModal} onHide={this.closeDishModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isEditingDish ? 'Edit Dish' : 'Add New Dish'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.handleAddDish}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dish Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={currentDish.name}
                      onChange={this.handleDishInputChange}
                      isInvalid={!!errors.dishName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dishName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={currentDish.category}
                      onChange={this.handleDishInputChange}
                      isInvalid={!!errors.dishCategory}
                    >
                      <option value="-1">Select Category</option>
                      <option value="Appetizer">Appetizer</option>
                      <option value="Salad">Salad</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Side Dish">Side Dish</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.dishCategory}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={currentDish.price}
                      onChange={this.handleDishInputChange}
                      isInvalid={!!errors.dishPrice}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dishPrice}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={currentDish.description}
                      onChange={this.handleDishInputChange}
                      isInvalid={!!errors.dishDescription}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dishDescription}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Ingredients (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="ingredients"
                      value={currentDish.ingredients || ""}
                      onChange={this.handleDishInputChange}
                      placeholder="Enter ingredients separated by commas"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Dish Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={this.handleDishImageChange}
                    />
                    {isEditingDish && currentDish.image_url && (
                      <div className="mt-2">
                        <img 
                          src={currentDish.image_url} 
                          alt={currentDish.name} 
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                        />
                        <Form.Text className="text-muted d-block">
                          Current image will be kept unless you upload a new one
                        </Form.Text>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeDishModal} disabled={isDishSubmitting}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={this.handleAddDish}
              disabled={isDishSubmitting}
            >
              {isDishSubmitting ? 
                (isEditingDish ? 'Updating...' : 'Adding...') : 
                (isEditingDish ? 'Update Dish' : 'Add Dish')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default RestaurantDetails;
