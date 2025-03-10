# UberEATS Clone Frontend

## Overview
This is the frontend implementation of an UberEATS prototype developed using React for the Lab 1 Assignment. The application supports two main user roles: Customer and Restaurant, with features for food ordering, restaurant management, and order processing.

## Features

### Customer Features
- **Signup/Login**: Secure authentication with email and password
- **Profile Management**: Update profile information, picture, and preferences
- **Restaurant Browsing**: View restaurant details and menus
- **Favorites**: Save and manage favorite restaurants
- **Cart**: Add dishes, adjust quantities, and checkout
- **Order Tracking**: View past and current orders with status updates

### Restaurant Features
- **Signup/Login**: Secure authentication for restaurant owners
- **Profile Management**: Update restaurant details, location, description, and contact information
- **Menu Management**: Add, edit, and remove dishes with details like name, ingredients, price, and images
- **Order Management**: View and update order statuses, track delivery progress

## Tech Stack
- **React**: Frontend framework
- **CSS**: Custom styling for components
- **Axios/Fetch API**: For API communication with backend

## Project Structure

frontend/
├── public/               # Static files
│   ├── dish_images/      # Dish image assets
│   ├── images/           # General image assets
│   └── restaurant_pictures/ # Restaurant image assets
├── src/
│   ├── components/       # React components
│   │   ├── cart/         # Cart functionality
│   │   ├── customer/     # Customer-specific components
│   │   ├── footer/       # Footer components
│   │   ├── landingPage/  # Landing page components
│   │   ├── location/     # Location components
│   │   └── restaurant/   # Restaurant-specific components
│   ├── Images/           # Frontend image assets
│   └── routes/           # Application routing

