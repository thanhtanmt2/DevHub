const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Lớp 1: người gọi API phải xuất trình accessToken. Để biết họ là ai, có quyền gì 
const protect = async (req, res, next) => {
  try {
    let token;
    // tìm token trong header hoặc cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // dùng split để cắt bỏ Bearer lấy phần token phía sau 
      token = req.headers.authorization.split(' ')[1];
      // nếu không có trong header thì tìm trong cookie 
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // không có token thì từ chối truy cập 
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    // giải mã token và lấy thông tin user 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // giải mã được id sau đó tìm user trong database dựa vào id đó 
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }]
    });
    // không tìm thấy báo lỗi 401
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    // user bị khóa báo lỗi 403 
    if (user.status === 'LOCKED') return res.status(403).json({ success: false, message: 'Account is locked' });

    // nếu mọi thứ ok thì gán thông tin user vào req.user và userRoles vào req.userRoles 
    req.user = user;
    req.userRoles = user.Roles ? user.Roles.map(r => r.name) : [];
    // gọi next() để đưa gói tin đi sâu vào bên trong  
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Lớp 2: Kiểm tra xem quyền vừa xác minh được có được phép hay không 
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // xem trong mảng các quyền user có quyền nào khớp hay không 
      const hasRole = roles.some(role => req.userRoles && req.userRoles.includes(role));
      if (!hasRole) {
        // không có quyền từ chối 
        return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}` });
      }
      // có quyền thì cho qua 
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { protect, authorize };
