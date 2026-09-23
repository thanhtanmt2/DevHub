const { Notification } = require('../models');
const AppError = require('../utils/AppError');

// Helper to create notification
exports.createNotification = async ({ user_id, type, title, message, link, metadata }) => {
  try {
    await Notification.create({ user_id, type, title, message, link, metadata: metadata || {} });
  } catch (e) {
    console.error('Notification create error:', e.message);
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
