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
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để tiếp tục' });
    }
    // giải mã token và lấy thông tin user 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // giải mã được id sau đó tìm user trong database dựa vào id đó 
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }]
    });
    // không tìm thấy báo lỗi 401
    if (!user) return res.status(401).json({ success: false, message: 'Không tìm thấy tài khoản' });
    // user bị khóa báo lỗi 403 
    if (user.status === 'LOCKED') return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });

    // nếu mọi thứ ok thì gán thông tin user vào req.user và userRoles vào req.userRoles 
    req.user = user;
    req.userRoles = user.Roles ? user.Roles.map(r => r.name) : [];
    // gọi next() để đưa gói tin đi sâu vào bên trong  
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
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
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này' });
      }
      // có quyền thì cho qua 
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Đăng nhập tùy chọn: có token hợp lệ thì gắn req.user / req.userRoles, không có (hoặc token hỏng/hết hạn) thì coi là khách.
// Dùng cho các API công khai nhưng cá nhân hóa nội dung khi đã đăng nhập (vd: việc làm đề xuất ở trang chủ).
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.startsWith('Bearer') ? header.split(' ')[1] : req.cookies?.accessToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
        include: [{ association: 'Roles', attributes: ['name'] }],
      });
      if (user && user.status !== 'LOCKED') {
        req.user = user;
        req.userRoles = user.Roles ? user.Roles.map((r) => r.name) : [];
      }
    }
  } catch { /* token không hợp lệ: bỏ qua, xử lý như khách */ }
  next();
};

module.exports = { protect, authorize, optionalAuth };
