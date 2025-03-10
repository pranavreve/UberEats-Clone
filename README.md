# UberEATS Clone

A prototype of UberEATS built with React for the frontend and Node.js (Express.js) for the backend.

## Features

### Customer Features
- Signup with name, email ID, and password
- Login/Logout with session-based authentication
- Profile management (update profile picture, personal information)
- Browse restaurants and view their menus
- Add dishes to cart and place orders
- Mark restaurants as favorites

### Restaurant Features
- Signup with name, email ID, password, and location
- Login/Logout with session-based authentication
- Profile management (update restaurant details, images, etc.)
- Menu management (add, edit, delete dishes)
- Order management (view and update order status)

## Tech Stack

### Backend
- Node.js with Express.js
- MySQL database
- RESTful API architecture
- Authentication using express-session and JWT
- Image uploads with Multer

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- CSS for styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5001
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ubereats_clone
   SESSION_SECRET=your_session_secret
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   UPLOAD_PATH=./uploads
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   REACT_APP_UBEREATS_BACKEND_URL=http://localhost:5001/api
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## API Documentation

The API endpoints are documented using Postman. You can import the Postman collection from the `postman` directory.

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user (customer or restaurant)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

#### Customer
- `GET /api/customers/profile` - Get customer profile
- `PUT /api/customers/profile` - Update customer profile
- `GET /api/customers/restaurants` - Get list of restaurants
- `GET /api/customers/restaurants/:id` - Get restaurant details and menu
- `POST /api/customers/favorites/add` - Add restaurant to favorites
- `POST /api/customers/favorites/remove` - Remove restaurant from favorites
- `GET /api/customers/favorites` - Get favorites list

#### Restaurant
- `GET /api/restaurants/profile` - Get restaurant profile
- `PUT /api/restaurants/profile` - Update restaurant profile
- `GET /api/restaurants/dishes` - Get restaurant dishes
- `POST /api/restaurants/dishes` - Add new dish
- `PUT /api/restaurants/dishes/:id` - Update dish
- `DELETE /api/restaurants/dishes/:id` - Delete dish
- `GET /api/restaurants/orders` - Get restaurant orders

#### Orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

## Database Schema

The database consists of the following tables:
- `users` - Central authentication table
- `customers` - Customer profiles
- `restaurants` - Restaurant profiles
- `dishes` - Menu items for restaurants
- `orders` - Customer orders
- `order_items` - Items within an order
- `favorites` - Customer's favorite restaurants
- `sessions` - User sessions

## License

This project is part of a lab assignment and is for educational purposes only. 