const jwt = require('jsonwebtoken');

// Verify JWT token or session middleware
exports.verifyToken = (req, res, next) => {
  // First check if user is authenticated via session
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // If not authenticated via session, check for JWT token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token or session found.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is a customer
exports.isCustomer = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.'
    });
  }
  next();
};

// Check if user is a restaurant
exports.isRestaurant = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'restaurant') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Restaurant role required.'
    });
  }
  next();
};

// Middleware to check if user is authenticated through either JWT or session
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token or session found.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};