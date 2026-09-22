const { User, Role, UserRole } = require('../models');
const AppError = require('../utils/AppError');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Role, through: { attributes: [] }, attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    if (req.user && req.user.id === req.params.id) {
      throw new AppError('Bạn không thể tự khóa hoặc thay đổi trạng thái tài khoản của chính mình', 400);
    }
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    
    const newStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    await user.update({ status: newStatus });
    res.json({ success: true, message: `User ${newStatus === 'ACTIVE' ? 'activated' : 'locked'}`, data: { status: newStatus } });
  } catch (error) { next(error); }
};
