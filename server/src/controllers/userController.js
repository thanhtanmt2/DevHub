const { User, Role, UserRole } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash', 'email_verify_token', 'reset_password_token'] },
      include: [{ model: Role, through: { attributes: [] }, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
};

// PUT /api/admin/users/:id/toggle-status  (ACTIVE ↔ LOCKED)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    if (req.user && req.user.id === req.params.id) {
      throw new AppError('Bạn không thể tự khóa tài khoản của chính mình', 400);
    }
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);
    if (user.status === 'INACTIVE') throw new AppError('Tài khoản này chưa được kích hoạt. Hãy kích hoạt thủ công trước.', 400);

    const newStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    await user.update({ status: newStatus });
    res.json({ success: true, message: newStatus === 'ACTIVE' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', data: { status: newStatus } });
  } catch (error) { next(error); }
};

// PUT /api/admin/users/:id/activate  (INACTIVE → ACTIVE, Admin kích hoạt thủ công)
exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);
    if (user.status !== 'INACTIVE') throw new AppError('Tài khoản này không cần kích hoạt', 400);

    await user.update({ status: 'ACTIVE', email_verified: true, email_verify_token: null });
    res.json({ success: true, message: 'Đã kích hoạt tài khoản thành công' });
  } catch (error) { next(error); }
};

// PUT /api/admin/users/:id/role  (Phân quyền – đổi role của user)
exports.assignRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['CANDIDATE', 'EMPLOYER', 'ADMIN'];
    if (!validRoles.includes(role)) throw new AppError('Vai trò không hợp lệ', 400);

    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, through: { attributes: [] } }]
    });
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);
    if (req.user && req.user.id === req.params.id) throw new AppError('Bạn không thể tự đổi vai trò của chính mình', 400);

    const newRole = await Role.findOne({ where: { name: role } });
    if (!newRole) throw new AppError('Vai trò không tồn tại trong hệ thống', 404);

    // Xóa toàn bộ role cũ rồi gán role mới
    await UserRole.destroy({ where: { user_id: user.id } });
    await user.addRole(newRole);

    res.json({ success: true, message: `Đã phân quyền thành công: ${role}` });
  } catch (error) { next(error); }
};
