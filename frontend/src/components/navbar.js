import React, { Component } from "react";
import { Link } from "react-router-dom";
import { ShoppingCartOutlined, HomeOutlined, FileOutlined, UserOutlined, LogoutOutlined, HeartOutlined } from '@ant-design/icons';
import "./navbar.css";

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      userType: "",
      activeLink: window.location.pathname
    };
  }

  componentDidMount() {
    const token = sessionStorage.getItem("authToken");
    const userType = sessionStorage.getItem("userType");
    if (token && userType) {
      this.setState({ isAuthenticated: true, userType });
    }
  }

  handleLogout = () => {
    sessionStorage.clear();
    this.setState({ isAuthenticated: false, userType: "" });
    window.location.href = "/";
  };

  handleCartIconClick = () => {
    if (this.props.onCartIconClick) {
      this.props.onCartIconClick();
    }
  };

  isLinkActive = (path) => {
    return this.state.activeLink === path;
  };

  renderCustomerLinks() {
    const { cartItemCount } = this.props;
    return (
      <>
        <div className="nav-links-main">
          <li className="nav-item">
            <Link 
              to="/customer/home" 
              className={`nav-links ${this.isLinkActive('/customer/home') ? 'active' : ''}`}
            >
              <HomeOutlined style={{ marginRight: '6px' }} />
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/customer/favorites" 
              className={`nav-links ${this.isLinkActive('/customer/favorites') ? 'active' : ''}`}
            >
              <HeartOutlined style={{ marginRight: '6px' }} />
              Favorites
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/customer/orders" 
              className={`nav-links ${this.isLinkActive('/customer/orders') ? 'active' : ''}`}
            >
              <FileOutlined style={{ marginRight: '6px' }} />
              Orders
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/customer/profile" 
              className={`nav-links ${this.isLinkActive('/customer/profile') ? 'active' : ''}`}
            >
              <UserOutlined style={{ marginRight: '6px' }} />
              Profile
            </Link>
          </li>
        </div>
        <div className="right-items">
          <li className="nav-item cart-icon">
            <Link 
              to="/customer/cart" 
              className={`nav-links ${this.isLinkActive('/customer/cart') ? 'active' : ''}`}
              onClick={this.handleCartIconClick}
            >
              <ShoppingCartOutlined style={{ fontSize: '18px' }} />
              Cart
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </Link>
          </li>
          <li className="nav-item">
            <button className="logout-button" onClick={this.handleLogout}>
              <LogoutOutlined />
              Sign out
            </button>
          </li>
        </div>
      </>
    );
  }

  renderRestaurantLinks() {
    return (
      <>
        <div className="nav-links-main">
          <li className="nav-item">
            <Link 
              to="/restaurant/home" 
              className={`nav-links ${this.isLinkActive('/restaurant/home') ? 'active' : ''}`}
            >
              <HomeOutlined style={{ marginRight: '6px' }} />
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/restaurant/orders" 
              className={`nav-links ${this.isLinkActive('/restaurant/orders') ? 'active' : ''}`}
            >
              <FileOutlined style={{ marginRight: '6px' }} />
              Orders
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/restaurant/profile" 
              className={`nav-links ${this.isLinkActive('/restaurant/profile') ? 'active' : ''}`}
            >
              <UserOutlined style={{ marginRight: '6px' }} />
              Profile
            </Link>
          </li>
        </div>
        <div className="right-items">
          <li className="nav-item">
            <button className="logout-button" onClick={this.handleLogout}>
              <LogoutOutlined />
              Sign out
            </button>
          </li>
        </div>
      </>
    );
  }

  render() {
    const { isAuthenticated, userType } = this.state;

    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/" className="logo-text">
              <span className="uber">Uber</span>
              <span className="eats">Eats</span>
            </Link>
          </div>
          
          <ul className="nav-menu">
            {isAuthenticated ? (
              <>
                {userType === "customer" && this.renderCustomerLinks()}
                {userType === "restaurant" && this.renderRestaurantLinks()}
              </>
            ) : (
              <div className="auth-links">
                <Link to="/customer/login" className="nav-links">
                  Sign in
                </Link>
                <Link to="/restaurant/login" className="nav-links">
                  Restaurant login
                </Link>
              </div>
            )}
          </ul>
        </div>
      </nav>
    );
  }
}

export default NavBar;
