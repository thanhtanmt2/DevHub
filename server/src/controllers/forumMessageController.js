const { sequelize, User, ForumMessage } = require('../models');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');
const forum = require('./forumController');

const { isUuid, authorInfo, checkRate, excerpt } = forum.internals;

// Tin nhắn riêng giữa hai thành viên diễn đàn. Người nhận "bỏ qua" bạn thì không nhắn được cho họ.
const MAX_MESSAGE = 2000;
const HISTORY = 100; // số tin gần nhất trả về khi mở một cuộc trò chuyện

async function loadPeer(id, selfId) {
  if (!isUuid(id)) throw new AppError('Không tìm thấy thành viên', 404);
  if (id === selfId) throw new AppError('Bạn không thể nhắn tin cho chính mình', 400);
  const user = await User.findByPk(id, { attributes: ['id', 'full_name', 'status'] });
  if (!user) throw new AppError('Không tìm thấy thành viên', 404);
  return user;
}

const blockedBy = async (peerId, meId) => {
  const [r] = await sequelize.query('SELECT EXISTS (SELECT 1 FROM forum_ignores WHERE user_id = :peer AND ignored_id = :me) AS b', { replacements: { peer: peerId, me: meId }, type: sequelize.QueryTypes.SELECT });
  return !!r.b;
};

// GET /api/forum/messages/conversations — danh sách cuộc trò chuyện (tin mới nhất trước) kèm số tin chưa đọc
exports.listConversations = async (req, res, next) => {
  try {
    const rows = await sequelize.query(
      `WITH m AS (
         SELECT CASE WHEN sender_id = :me THEN recipient_id ELSE sender_id END AS other_id, sender_id, content, created_at
           FROM forum_messages WHERE sender_id = :me OR recipient_id = :me
       ), latest AS (
         SELECT DISTINCT ON (other_id) other_id, sender_id, content, created_at FROM m ORDER BY other_id, created_at DESC
       ), unread AS (
         SELECT sender_id AS other_id, COUNT(*) AS n FROM forum_messages WHERE recipient_id = :me AND read_at IS NULL GROUP BY sender_id
       )
       SELECT l.other_id, l.sender_id, l.content, l.created_at, COALESCE(u.n, 0) AS unread
         FROM latest l LEFT JOIN unread u ON u.other_id = l.other_id
        ORDER BY l.created_at DESC LIMIT 60`,
      { replacements: { me: req.user.id }, type: sequelize.QueryTypes.SELECT }
    );
    const people = await authorInfo(rows.map((r) => r.other_id));
    res.json({
      success: true,
      data: rows.map((r) => ({
        user: people.get(r.other_id) ? { id: r.other_id, full_name: people.get(r.other_id).full_name, avatar_url: people.get(r.other_id).avatar_url, role: people.get(r.other_id).role } : { id: r.other_id, full_name: 'Tài khoản đã xóa' },
        last_message: excerpt(r.content, 90), last_mine: r.sender_id === req.user.id, last_at: r.created_at, unread: Number(r.unread),
      })),
      unread_total: rows.reduce((s, r) => s + Number(r.unread), 0),
    });
  } catch (error) { next(error); }
};

// GET /api/forum/messages/with/:userId — mở cuộc trò chuyện (đồng thời đánh dấu tin của họ là đã đọc)
exports.getConversation = async (req, res, next) => {
  try {
    const peer = await loadPeer(req.params.userId, req.user.id);
    await sequelize.query('UPDATE forum_messages SET read_at = NOW() WHERE recipient_id = :me AND sender_id = :peer AND read_at IS NULL', { replacements: { me: req.user.id, peer: peer.id } });
    const rows = await sequelize.query(
      `SELECT * FROM (
         SELECT id, sender_id, content, created_at, read_at FROM forum_messages
          WHERE (sender_id = :me AND recipient_id = :peer) OR (sender_id = :peer AND recipient_id = :me)
          ORDER BY created_at DESC LIMIT :n
       ) x ORDER BY created_at ASC`,
      { replacements: { me: req.user.id, peer: peer.id, n: HISTORY }, type: sequelize.QueryTypes.SELECT }
    );
    const info = (await authorInfo([peer.id])).get(peer.id);
    res.json({
      success: true,
      data: {
        user: info ? { id: info.id, full_name: info.full_name, avatar_url: info.avatar_url, role: info.role, company_name: info.company_name } : { id: peer.id, full_name: peer.full_name },
        can_send: !(await blockedBy(peer.id, req.user.id)),
        messages: rows.map((r) => ({ id: r.id, mine: r.sender_id === req.user.id, content: r.content, created_at: r.created_at, read: !!r.read_at })),
      },
    });
  } catch (error) { next(error); }
};

// POST /api/forum/messages/with/:userId { content }
exports.sendMessage = async (req, res, next) => {
  try {
    const peer = await loadPeer(req.params.userId, req.user.id);
    const content = String(req.body.content ?? '').replace(/\r\n/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
    if (!content) throw new AppError('Vui lòng nhập nội dung tin nhắn', 400);
    if (content.length > MAX_MESSAGE) throw new AppError(`Tin nhắn tối đa ${MAX_MESSAGE.toLocaleString('vi-VN')} ký tự`, 400);
    if (peer.status === 'LOCKED') throw new AppError('Không thể nhắn tin cho tài khoản này', 403);
    if (await blockedBy(peer.id, req.user.id)) throw new AppError('Thành viên này không nhận tin nhắn từ bạn', 403);
    checkRate(req.user.id, 'message');

    // Chỉ báo thông báo ở tin đầu tiên chưa đọc, tránh mỗi tin một thông báo
    const [pending] = await sequelize.query('SELECT COUNT(*) AS n FROM forum_messages WHERE sender_id = :me AND recipient_id = :peer AND read_at IS NULL', { replacements: { me: req.user.id, peer: peer.id }, type: sequelize.QueryTypes.SELECT });
    const msg = await ForumMessage.create({ sender_id: req.user.id, recipient_id: peer.id, content });
    if (Number(pending.n) === 0) {
      await createNotification({
        user_id: peer.id, type: 'FORUM_MESSAGE', email: false,
        title: 'Bạn có tin nhắn mới', message: `${req.user.full_name}: ${excerpt(content, 80)}`,
        link: `/forum/messages?with=${req.user.id}`, metadata: { from: req.user.id },
      });
    }
    res.status(201).json({ success: true, data: { id: msg.id, mine: true, content: msg.content, created_at: msg.createdAt, read: false } });
  } catch (error) { next(error); }
};

// GET /api/forum/messages/unread-count
exports.unreadCount = async (req, res, next) => {
  try {
    const [r] = await sequelize.query('SELECT COUNT(*) AS n FROM forum_messages WHERE recipient_id = :me AND read_at IS NULL', { replacements: { me: req.user.id }, type: sequelize.QueryTypes.SELECT });
    res.json({ success: true, data: { unread: Number(r.n) } });
  } catch (error) { next(error); }
};
