/**
 * activityLogger.js
 * Central service: ghi ActivityLog + tự động tạo Notification cho người liên quan
 * 
 * Usage:
 *   const { logActivity } = require('../utils/activityLogger');
 *   await logActivity(req, { action, entity_type, entity_id, entity_name, description, ... });
 */

const { ActivityLog, Notification, User } = require('../models');

// Notification settings per action — admin có thể extend
const NOTIFICATION_MAP = {
  TASK_CREATED:                { type: 'TASK_ASSIGNED',       title: '📌 Task mới được tạo',         notifyKey: 'assignees' },
  TASK_STATUS_CHANGED:         { type: 'TASK_STATUS_CHANGED', title: '🔄 Task thay đổi trạng thái',  notifyKey: 'assignees' },
  TASK_APPROVED:               { type: 'TASK_APPROVED',       title: '✅ Task được duyệt',            notifyKey: 'assignees' },
  TASK_REVISION_REQUESTED:     { type: 'TASK_REVISION',       title: '↩️ Task yêu cầu chỉnh sửa',    notifyKey: 'assignees' },
  TASK_COMMENTED:              { type: 'TASK_COMMENT',        title: '💬 Bình luận mới trong task',   notifyKey: 'assignees' },
  WORKSPACE_MEMBER_ADDED:      { type: 'MEMBER_ADDED',        title: '👤 Bạn được thêm vào workspace', notifyKey: 'target_user' },
  WORKSPACE_MEMBER_REMOVED:    { type: 'MEMBER_ROLE_CHANGED', title: '👋 Bạn đã bị xóa khỏi workspace', notifyKey: 'target_user' },
  WORKSPACE_MEMBER_ROLE_CHANGED: { type: 'MEMBER_ROLE_CHANGED', title: '🔐 Vai trò của bạn đã thay đổi', notifyKey: 'target_user' },
  APPLICATION_STATUS_CHANGED:  { type: 'APPLICATION_STATUS', title: '📋 Đơn ứng tuyển cập nhật',    notifyKey: 'target_user' },
  INTERVIEW_SCHEDULED:         { type: 'INTERVIEW_SCHEDULED', title: '📅 Lịch phỏng vấn được đặt',  notifyKey: 'target_user' },
  MEMBER_EVALUATED:            { type: 'APPLICATION_STATUS', title: '⭐ Bạn đã được đánh giá',       notifyKey: 'target_user' },
};

/**
 * @param {Object} req - Express request (for ip_address, user_agent, req.user)
 * @param {Object} opts
 *   - action: string (from ENUM)
 *   - entity_type: string
 *   - entity_id: uuid
 *   - entity_name: string
 *   - old_value: string|null
 *   - new_value: string|null
 *   - description: string (tiếng Việt)
 *   - metadata: object — e.g. { project_id, workspace_id }
 *   - notify_user_ids: string[] — user IDs to notify
 *   - notify_link: string — frontend link for notification
 */
async function logActivity(req, opts) {
  try {
    const user = req?.user;
    let userName = 'Hệ thống';
    let userRole = 'SYSTEM';

    if (user?.id) {
      const u = await User.findByPk(user.id, { attributes: ['full_name'] });
      userName = u?.full_name || user.email || 'Unknown';
      userRole = user.role || 'CANDIDATE';
    }

    const log = await ActivityLog.create({
      user_id: user?.id || null,
      user_name: userName,
      user_role: userRole,
      action: opts.action,
      entity_type: opts.entity_type || null,
      entity_id: opts.entity_id || null,
      entity_name: opts.entity_name || null,
      old_value: opts.old_value ? String(opts.old_value) : null,
      new_value: opts.new_value ? String(opts.new_value) : null,
      description: opts.description || null,
      metadata: opts.metadata || {},
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.headers?.['user-agent']?.substring(0, 500) || null,
    });

    // Auto-send notifications
    const notifConfig = NOTIFICATION_MAP[opts.action];
    if (notifConfig && opts.notify_user_ids?.length) {
      const link = opts.notify_link || null;
      await Promise.all(
        opts.notify_user_ids
          .filter(uid => uid && uid !== user?.id) // don't notify self
          .map(uid =>
            Notification.create({
              user_id: uid,
              type: notifConfig.type,
              title: notifConfig.title,
              message: opts.description || opts.entity_name,
              link,
              metadata: { log_id: log.id, ...opts.metadata },
            }).catch(() => {}) // non-blocking
          )
      );
    }

    return log;
  } catch (e) {
    console.error('[ActivityLogger] Error:', e.message);
    return null; // never throw — logging must not break business logic
  }
}

module.exports = { logActivity };
