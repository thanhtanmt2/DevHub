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
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    
    // Toggle active status (true/false)
    await user.update({ is_active: !user.is_active });
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}` });
  } catch (error) { next(error); }
};
