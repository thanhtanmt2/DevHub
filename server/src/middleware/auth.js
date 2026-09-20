const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
    });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.status === 'LOCKED') return res.status(403).json({ success: false, message: 'Account is locked' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Check if user has a specific role
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const userWithRoles = await User.findByPk(req.user.id, {
        include: [{ association: 'Roles', attributes: ['name'] }],
      });
      const userRoles = userWithRoles.Roles.map(r => r.name);
      const hasRole = roles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}` });
      }
      req.userRoles = userRoles;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { protect, authorize };
