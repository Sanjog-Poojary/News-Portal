const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const store = require('../data/store');

/**
 * Verifies JWT token from Authorization header or cookie.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Validate current user exists in database/store
    const user = store.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Session invalid or user no longer exists.' });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token expired or invalid signature.' });
  }
}

/**
 * Optional authentication middleware for public endpoints that enhance response if authenticated.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.getUserById(decoded.id);
    if (user) {
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Role-based access control guardrail.
 * Reader role is strictly prevented from Author/Admin endpoints.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied. Role '${req.user.role}' is insufficient. Required: ${roles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};
