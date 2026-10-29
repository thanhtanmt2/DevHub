const { Notification, User } = require('../models');
const AppError = require('../utils/AppError');
const { emailNotification } = require('../utils/notificationMailer');

// Helper to create notification
// email = false khi sự kiện đã có email riêng (tránh gửi trùng)
exports.createNotification = async ({ user_id, type, title, message, link, metadata, email = true }) => {
  try {
    await Notification.create({ user_id, type, title, message, link, metadata: metadata || {} });
    if (email) emailNotification({ user_id, title, message, link }); // gửi nền, không chờ
  } catch (e) {
    console.error('Notification create error:', e.message);
  }
};

// Danh sách Admin đang hoạt động (người nhận các thông báo "việc cần xử lý")
async function getAdminUserIds() {
  const admins = await User.findAll({
    attributes: ['id'],
    where: { status: 'ACTIVE' },
    include: [{ association: 'Roles', where: { name: 'ADMIN' }, attributes: [], through: { attributes: [] } }],
  });
  return admins.map((u) => u.id);
}

// Gửi cho mọi Admin. Mặc định KHÔNG kèm email (việc chờ xử lý xuất hiện liên tục, tránh làm ngập hộp thư)
exports.notifyAdmins = async (payload) => {
  try {
    const ids = await getAdminUserIds();
    await Promise.all(ids.map((user_id) => exports.createNotification({ email: false, ...payload, user_id })));
  } catch (e) {
    console.error('notifyAdmins error:', e.message);
  }
};

// GET /api/notifications — Get my notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) { next(error); }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true });
  } catch (error) { next(error); }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
};
