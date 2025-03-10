# UberEats Clone

A full-stack food delivery application similar to UberEats, built with React.js for the frontend and Node.js with Express for the backend. The application uses MySQL for database storage.

## Features

- **User Authentication**: Sign up and login for both customers and restaurants
- **Customer Features**:
  - Browse nearby restaurants
  - View restaurant menus
  - Add items to cart
  - Place orders
  - Track order status
  - Add restaurants to favorites
  - View order history
- **Restaurant Features**:
  - Manage restaurant profile
  - Add, edit, and delete menu items
  - View and manage incoming orders
  - Update order status (Order Received, Preparing, On the Way, Delivered, etc.)

## Tech Stack

- **Frontend**: React.js, React Router, CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

The project is organized into two main directories:

- `/frontend`: Contains the React application
- `/backend`: Contains the Node.js/Express API server

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v8 or higher)

### Database Setup

1. Install MySQL if you haven't already
2. Create a new database:
   ```sql
   CREATE DATABASE ubereats_clone;
   ```
3. The application will automatically create the required tables on first run

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
   
2. Install dependencies:
   ```bash
   npm install
   ```
   
3. Create a `.env` file in the backend directory with the following content:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=ubereats_clone
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```
   
4. Start the backend server:
   ```bash
   npm start
   ```
   
5. The server will be running at http://localhost:5001

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
   
2. Install dependencies:
   ```bash
   npm install
   ```
   
3. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5001
   ```
   
4. Start the frontend development server:
   ```bash
   npm start
   ```
   
5. The application will be running at http://localhost:3000

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Register as either a customer or a restaurant
3. Explore the features based on your user type

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License. 