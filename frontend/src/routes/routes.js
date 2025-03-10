import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from '../components/landingPage/LandingPage';
import CustomerLogin from '../components/customer/CustomerLogin';
import CustomerSignup from '../components/customer/CustomerSignup';
import RestaurantLogin from "../components/restaurant/restaurantLogin";
import RestaurantSignup from "../components/restaurant/restaurantSignup";
import CustomerHome from '../components/customer/CustomerHome';
import CustomerDetails from '../components/customer/customerDetails';
import CustomerOrders from '../components/customer/customerOrders';
import CustomerRestaurant from '../components/customer/customerRestaurant';
import CustomerCart from '../components/cart/cart';
import RestaurantHome from '../components/restaurant/restaurantHome';
import RestaurantOrders from '../components/restaurant/restaurantOrders';
import RestaurantDetails from '../components/restaurant/restaurantDetails';
import CustomerFavorites from '../components/customer/customerFavorites';
import Search from '../components/customer/Search';

// import CustomerDetails from '../components/customer/customerDetails';
// import CustomerFavorites from '../components/customer/customerFavorites';


const AppRouter = () => {
    return (
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
  
        {/* Customer Routes */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/signup" element={<CustomerSignup />} />
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/signup" element={<RestaurantSignup />} />
        <Route path="/customer/home" element={<CustomerHome />} />
        <Route path="/customer/search" element={<Search />} />
        <Route path="/customer/restaurant/:id" element={<CustomerRestaurant />} />
        <Route path="/customer/favorites" element={<CustomerFavorites />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route path="/customer/profile" element={<CustomerDetails />} />
        <Route path="/customer/cart" element={<CustomerCart />} />

        <Route path="/restaurant/home" element={<RestaurantHome />} />
        <Route path="/restaurant/orders" element={<RestaurantOrders />} />
        <Route path="/restaurant/profile" element={<RestaurantDetails />} />
        
        {/* <Route path="/customer/details" element={<CustomerDetails />} />
      //   <Route path="/customer/favorites" element={<CustomerFavorites />} /> */}
        
        {/* Add additional routes for other components as needed */}
      </Routes>
    );
  };
  
  export default AppRouter;
  
