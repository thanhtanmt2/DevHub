const { sequelize } = require('../models');

// Các hàm nhỏ dùng chung cho phần "mạng xã hội" của diễn đàn (trạng thái trực tuyến, theo dõi, bỏ qua)

// Ghi nhận lần cuối thành viên hoạt động ở diễn đàn và chủ đề đang xem. Lỗi ghi nhận không được làm hỏng yêu cầu chính.
const lastTouch = new Map(); // userId → { at, threadId }: chỉ ghi lại khi đổi chủ đề hoặc sau 30 giây, tránh ghi DB ở mọi yêu cầu
async function touchPresence(userId, threadId = null) {
  if (!userId) return;
  const now = Date.now();
  const prev = lastTouch.get(userId);
  if (prev && prev.threadId === threadId && now - prev.at < 30 * 1000) return;
  lastTouch.set(userId, { at: now, threadId });
  try {
    await sequelize.query(
      `INSERT INTO forum_member_activity (user_id, last_seen_at, thread_id) VALUES (:u, NOW(), :t)
       ON CONFLICT (user_id) DO UPDATE SET last_seen_at = NOW(), thread_id = EXCLUDED.thread_id`,
      { replacements: { u: userId, t: threadId } }
    );
  } catch (e) { console.error('[forum] ghi nhận hoạt động lỗi:', e.message); }
}

// Danh sách id thành viên mà userId đã "bỏ qua"
async function ignoredIds(userId) {
  if (!userId) return [];
  const rows = await sequelize.query('SELECT ignored_id FROM forum_ignores WHERE user_id = :u', { replacements: { u: userId }, type: sequelize.QueryTypes.SELECT });
  return rows.map((r) => r.ignored_id);
}

// Danh sách id người đang theo dõi userId
async function followerIds(userId) {
  const rows = await sequelize.query('SELECT follower_id FROM forum_follows WHERE followee_id = :u', { replacements: { u: userId }, type: sequelize.QueryTypes.SELECT });
  return rows.map((r) => r.follower_id);
}

module.exports = { touchPresence, ignoredIds, followerIds };
