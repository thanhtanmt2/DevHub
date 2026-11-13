const { sequelize, User, ForumMessage } = require('../models');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');
const forum = require('./forumController');

const { isUuid, authorInfo, checkRate, excerpt } = forum.internals;

// Tin nhắn riêng giữa hai thành viên diễn đàn (kiểu Zalo): trả lời, thu hồi, thả cảm xúc,
// xóa ở phía mình, ghim tin nhắn, ghim hội thoại. Người nhận "bỏ qua" bạn thì không nhắn được cho họ.
const MAX_MESSAGE = 2000;
const HISTORY = 100; // số tin gần nhất trả về khi mở một cuộc trò chuyện
const RECALL_WINDOW_MS = 24 * 60 * 60 * 1000; // chỉ thu hồi được tin gửi trong vòng 24 giờ
const MAX_PINNED_MESSAGES = 3; // số tin ghim tối đa trong một cuộc trò chuyện
const MAX_PINNED_CHATS = 5; // số hội thoại ghim tối đa của mỗi người
const REACTIONS = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
const RECALLED_TEXT = 'Tin nhắn đã được thu hồi';

// Điều kiện "tin này còn hiện với tôi" (chưa bị tôi xóa ở phía mình); `:me` là id người dùng hiện tại
const VISIBLE = '((sender_id = :me AND NOT hidden_for_sender) OR (recipient_id = :me AND NOT hidden_for_recipient))';
// Hai tin thuộc cuộc trò chuyện giữa :me và :peer
const PAIR = '((sender_id = :me AND recipient_id = :peer) OR (sender_id = :peer AND recipient_id = :me))';

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

// Tổng hợp cảm xúc của các tin: { [message_id]: { counts: { like: 2 }, mine: 'like' | null } }
async function reactionSummary(messageIds, meId) {
  const map = new Map();
  if (!messageIds.length) return map;
  const rows = await sequelize.query(
    'SELECT message_id, user_id, reaction FROM forum_message_reactions WHERE message_id IN (:ids)',
    { replacements: { ids: messageIds }, type: sequelize.QueryTypes.SELECT }
  );
  for (const r of rows) {
    if (!map.has(r.message_id)) map.set(r.message_id, { counts: {}, mine: null });
    const s = map.get(r.message_id);
    s.counts[r.reaction] = (s.counts[r.reaction] || 0) + 1;
    if (r.user_id === meId) s.mine = r.reaction;
  }
  return map;
}

const emptyReactions = () => ({ counts: {}, mine: null });

// GET /api/forum/messages/conversations — danh sách cuộc trò chuyện (ghim lên đầu, rồi tin mới nhất trước) kèm số tin chưa đọc
exports.listConversations = async (req, res, next) => {
  try {
    const rows = await sequelize.query(
      `WITH m AS (
         SELECT CASE WHEN sender_id = :me THEN recipient_id ELSE sender_id END AS other_id, sender_id, content, created_at, recalled_at
           FROM forum_messages WHERE ${VISIBLE}
       ), latest AS (
         SELECT DISTINCT ON (other_id) other_id, sender_id, content, created_at, recalled_at FROM m ORDER BY other_id, created_at DESC
       ), unread AS (
         SELECT sender_id AS other_id, COUNT(*) AS n FROM forum_messages
          WHERE recipient_id = :me AND read_at IS NULL AND recalled_at IS NULL AND NOT hidden_for_recipient GROUP BY sender_id
       )
       SELECT l.other_id, l.sender_id, l.content, l.created_at, l.recalled_at, COALESCE(u.n, 0) AS unread, s.pinned_at AS chat_pinned_at
         FROM latest l
         LEFT JOIN unread u ON u.other_id = l.other_id
         LEFT JOIN forum_conversation_settings s ON s.user_id = :me AND s.peer_id = l.other_id
        ORDER BY s.pinned_at DESC NULLS LAST, l.created_at DESC LIMIT 60`,
      { replacements: { me: req.user.id }, type: sequelize.QueryTypes.SELECT }
    );
    const people = await authorInfo(rows.map((r) => r.other_id));
    res.json({
      success: true,
      data: rows.map((r) => ({
        user: people.get(r.other_id) ? { id: r.other_id, full_name: people.get(r.other_id).full_name, avatar_url: people.get(r.other_id).avatar_url, role: people.get(r.other_id).role } : { id: r.other_id, full_name: 'Tài khoản đã xóa' },
        last_message: r.recalled_at ? RECALLED_TEXT : excerpt(r.content, 90), last_recalled: !!r.recalled_at, last_mine: r.sender_id === req.user.id, last_at: r.created_at, unread: Number(r.unread),
        pinned: !!r.chat_pinned_at,
      })),
      unread_total: rows.reduce((s, r) => s + Number(r.unread), 0),
    });
  } catch (error) { next(error); }
};

// GET /api/forum/messages/with/:userId — mở cuộc trò chuyện (đồng thời đánh dấu tin của họ là đã đọc)
exports.getConversation = async (req, res, next) => {
  try {
    const peer = await loadPeer(req.params.userId, req.user.id);
    const rep = { me: req.user.id, peer: peer.id };
    await sequelize.query('UPDATE forum_messages SET read_at = NOW() WHERE recipient_id = :me AND sender_id = :peer AND read_at IS NULL', { replacements: rep });
    const rows = await sequelize.query(
      `SELECT * FROM (
         SELECT m.id, m.sender_id, m.content, m.created_at, m.read_at, m.recalled_at, m.reply_to_id, m.pinned_at,
                r.sender_id AS reply_sender_id, r.content AS reply_content, r.recalled_at AS reply_recalled_at
           FROM forum_messages m LEFT JOIN forum_messages r ON r.id = m.reply_to_id
          WHERE ((m.sender_id = :me AND m.recipient_id = :peer AND NOT m.hidden_for_sender)
              OR (m.sender_id = :peer AND m.recipient_id = :me AND NOT m.hidden_for_recipient))
          ORDER BY m.created_at DESC LIMIT :n
       ) x ORDER BY created_at ASC`,
      { replacements: { ...rep, n: HISTORY }, type: sequelize.QueryTypes.SELECT }
    );
    // Tin đang ghim lấy riêng (có thể nằm ngoài 100 tin gần nhất), mới ghim lên trước
    const pinned = await sequelize.query(
      `SELECT id, sender_id, content, pinned_at FROM forum_messages
        WHERE pinned_at IS NOT NULL AND recalled_at IS NULL AND ${PAIR} AND ${VISIBLE}
        ORDER BY pinned_at DESC LIMIT ${MAX_PINNED_MESSAGES}`,
      { replacements: rep, type: sequelize.QueryTypes.SELECT }
    );
    const [setting] = await sequelize.query('SELECT pinned_at FROM forum_conversation_settings WHERE user_id = :me AND peer_id = :peer', { replacements: rep, type: sequelize.QueryTypes.SELECT });
    const reactions = await reactionSummary(rows.filter((r) => !r.recalled_at).map((r) => r.id), req.user.id);
    const info = (await authorInfo([peer.id])).get(peer.id);
    const now = Date.now();
    res.json({
      success: true,
      data: {
        user: info ? { id: info.id, full_name: info.full_name, avatar_url: info.avatar_url, role: info.role, company_name: info.company_name } : { id: peer.id, full_name: peer.full_name },
        can_send: !(await blockedBy(peer.id, req.user.id)),
        chat_pinned: !!setting?.pinned_at,
        pinned: pinned.map((p) => ({ id: p.id, mine: p.sender_id === req.user.id, content: excerpt(p.content, 140) })),
        messages: rows.map((r) => {
          const mine = r.sender_id === req.user.id;
          const recalled = !!r.recalled_at;
          return {
            id: r.id, mine, recalled,
            content: recalled ? '' : r.content,
            created_at: r.created_at, read: !!r.read_at,
            pinned: !!r.pinned_at,
            can_recall: mine && !recalled && now - new Date(r.created_at).getTime() <= RECALL_WINDOW_MS,
            reply: r.reply_to_id && !recalled
              ? { id: r.reply_to_id, mine: r.reply_sender_id === req.user.id, recalled: !!r.reply_recalled_at, content: r.reply_recalled_at ? '' : excerpt(r.reply_content, 120) }
              : null,
            reactions: recalled ? emptyReactions() : reactions.get(r.id) || emptyReactions(),
          };
        }),
      },
    });
  } catch (error) { next(error); }
};

// POST /api/forum/messages/with/:userId { content, reply_to_id? }
exports.sendMessage = async (req, res, next) => {
  try {
    const peer = await loadPeer(req.params.userId, req.user.id);
    const content = String(req.body.content ?? '').replace(/\r\n/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
    if (!content) throw new AppError('Vui lòng nhập nội dung tin nhắn', 400);
    if (content.length > MAX_MESSAGE) throw new AppError(`Tin nhắn tối đa ${MAX_MESSAGE.toLocaleString('vi-VN')} ký tự`, 400);
    if (peer.status === 'LOCKED') throw new AppError('Không thể nhắn tin cho tài khoản này', 403);
    if (await blockedBy(peer.id, req.user.id)) throw new AppError('Thành viên này không nhận tin nhắn từ bạn', 403);
    checkRate(req.user.id, 'message');

    // Trả lời một tin: tin gốc phải nằm trong chính cuộc trò chuyện này
    let replyToId = null;
    if (req.body.reply_to_id) {
      if (!isUuid(req.body.reply_to_id)) throw new AppError('Tin nhắn được trả lời không hợp lệ', 400);
      const [orig] = await sequelize.query(
        `SELECT id FROM forum_messages WHERE id = :id AND ${PAIR}`,
        { replacements: { id: req.body.reply_to_id, me: req.user.id, peer: peer.id }, type: sequelize.QueryTypes.SELECT }
      );
      if (!orig) throw new AppError('Không tìm thấy tin nhắn được trả lời', 404);
      replyToId = orig.id;
    }

    // Chỉ báo thông báo ở tin đầu tiên chưa đọc, tránh mỗi tin một thông báo
    const [pending] = await sequelize.query('SELECT COUNT(*) AS n FROM forum_messages WHERE sender_id = :me AND recipient_id = :peer AND read_at IS NULL AND recalled_at IS NULL', { replacements: { me: req.user.id, peer: peer.id }, type: sequelize.QueryTypes.SELECT });
    const msg = await ForumMessage.create({ sender_id: req.user.id, recipient_id: peer.id, content, reply_to_id: replyToId });
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

// Tin nhắn mà người dùng hiện tại là người gửi hoặc người nhận và chưa xóa ở phía mình
async function loadMyMessage(id, meId) {
  if (!isUuid(id)) throw new AppError('Không tìm thấy tin nhắn', 404);
  const msg = await ForumMessage.findByPk(id);
  const hidden = msg && ((msg.sender_id === meId && msg.hidden_for_sender) || (msg.recipient_id === meId && msg.hidden_for_recipient));
  if (!msg || (msg.sender_id !== meId && msg.recipient_id !== meId) || hidden) throw new AppError('Không tìm thấy tin nhắn', 404);
  return msg;
}

// PUT /api/forum/messages/:id/reaction { reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null } — thả / đổi / gỡ cảm xúc
exports.reactMessage = async (req, res, next) => {
  try {
    const msg = await loadMyMessage(req.params.id, req.user.id);
    if (msg.recalled_at) throw new AppError('Tin nhắn đã được thu hồi', 400);
    const reaction = req.body.reaction ?? null;
    if (reaction !== null && !REACTIONS.includes(reaction)) throw new AppError('Cảm xúc không hợp lệ', 400);
    if (reaction === null) {
      await sequelize.query('DELETE FROM forum_message_reactions WHERE message_id = :m AND user_id = :u', { replacements: { m: msg.id, u: req.user.id } });
    } else {
      await sequelize.query(
        `INSERT INTO forum_message_reactions (id, message_id, user_id, reaction, created_at, updated_at)
         VALUES (gen_random_uuid(), :m, :u, :r, NOW(), NOW())
         ON CONFLICT (message_id, user_id) DO UPDATE SET reaction = EXCLUDED.reaction, updated_at = NOW()`,
        { replacements: { m: msg.id, u: req.user.id, r: reaction } }
      );
    }
    res.json({ success: true, data: (await reactionSummary([msg.id], req.user.id)).get(msg.id) || emptyReactions() });
  } catch (error) { next(error); }
};

// POST /api/forum/messages/:id/recall — người gửi thu hồi tin (trong 24 giờ); nội dung bị xóa, hai bên đều không còn xem được
exports.recallMessage = async (req, res, next) => {
  try {
    const msg = await loadMyMessage(req.params.id, req.user.id);
    if (msg.sender_id !== req.user.id) throw new AppError('Bạn chỉ thu hồi được tin nhắn của chính mình', 403);
    if (msg.recalled_at) throw new AppError('Tin nhắn đã được thu hồi', 400);
    if (Date.now() - new Date(msg.createdAt).getTime() > RECALL_WINDOW_MS) throw new AppError('Chỉ thu hồi được tin nhắn đã gửi trong vòng 24 giờ', 400);
    await msg.update({ content: '', recalled_at: new Date(), pinned_at: null, pinned_by: null });
    await sequelize.query('DELETE FROM forum_message_reactions WHERE message_id = :m', { replacements: { m: msg.id } });
    res.json({ success: true, message: RECALLED_TEXT });
  } catch (error) { next(error); }
};

// DELETE /api/forum/messages/:id — xóa tin nhắn CHỈ Ở PHÍA MÌNH (người kia vẫn thấy)
exports.deleteForMe = async (req, res, next) => {
  try {
    const msg = await loadMyMessage(req.params.id, req.user.id);
    const mine = msg.sender_id === req.user.id;
    await msg.update(mine ? { hidden_for_sender: true } : { hidden_for_recipient: true, read_at: msg.read_at || new Date() });
    res.json({ success: true, message: 'Đã xóa tin nhắn ở phía bạn' });
  } catch (error) { next(error); }
};

// PUT /api/forum/messages/:id/pin { pinned: true | false } — ghim / bỏ ghim tin nhắn (cả hai bên cùng thấy, tối đa 3 tin)
exports.pinMessage = async (req, res, next) => {
  try {
    const msg = await loadMyMessage(req.params.id, req.user.id);
    if (msg.recalled_at) throw new AppError('Không ghim được tin nhắn đã thu hồi', 400);
    const pinned = req.body.pinned !== false;
    if (pinned && !msg.pinned_at) {
      const peerId = msg.sender_id === req.user.id ? msg.recipient_id : msg.sender_id;
      const [{ n }] = await sequelize.query(
        `SELECT COUNT(*)::int AS n FROM forum_messages WHERE pinned_at IS NOT NULL AND recalled_at IS NULL AND ${PAIR}`,
        { replacements: { me: req.user.id, peer: peerId }, type: sequelize.QueryTypes.SELECT }
      );
      if (n >= MAX_PINNED_MESSAGES) throw new AppError(`Mỗi cuộc trò chuyện chỉ ghim tối đa ${MAX_PINNED_MESSAGES} tin nhắn. Hãy bỏ ghim một tin trước.`, 400);
    }
    await msg.update(pinned ? { pinned_at: msg.pinned_at || new Date(), pinned_by: msg.pinned_by || req.user.id } : { pinned_at: null, pinned_by: null });
    res.json({ success: true, data: { pinned } });
  } catch (error) { next(error); }
};

// DELETE /api/forum/messages/with/:userId — xóa cả cuộc trò chuyện CHỈ Ở PHÍA MÌNH (người kia vẫn giữ nguyên; có tin mới thì cuộc trò chuyện hiện lại)
exports.deleteConversation = async (req, res, next) => {
  try {
    const peer = await loadPeer(req.params.userId, req.user.id);
    const rep = { me: req.user.id, peer: peer.id };
    await sequelize.query(
      `UPDATE forum_messages SET
         hidden_for_sender = hidden_for_sender OR sender_id = :me,
         hidden_for_recipient = hidden_for_recipient OR recipient_id = :me,
         read_at = CASE WHEN recipient_id = :me AND read_at IS NULL THEN NOW() ELSE read_at END
       WHERE ${PAIR}`,
      { replacements: rep }
    );
    await sequelize.query('DELETE FROM forum_conversation_settings WHERE user_id = :me AND peer_id = :peer', { replacements: rep });
    res.json({ success: true, message: 'Đã xóa cuộc trò chuyện ở phía bạn' });
  } catch (error) { next(error); }
};

// PUT /api/forum/messages/with/:userId/pin { pinned: true | false } — ghim hội thoại lên đầu danh sách (tối đa 5)
exports.pinConversation = async (req, res, next) => {
  try {
    const peer = await loadPeer(req.params.userId, req.user.id);
    const pinned = req.body.pinned !== false;
    if (pinned) {
      const [{ n }] = await sequelize.query(
        'SELECT COUNT(*)::int AS n FROM forum_conversation_settings WHERE user_id = :me AND pinned_at IS NOT NULL AND peer_id <> :peer',
        { replacements: { me: req.user.id, peer: peer.id }, type: sequelize.QueryTypes.SELECT }
      );
      if (n >= MAX_PINNED_CHATS) throw new AppError(`Chỉ ghim được tối đa ${MAX_PINNED_CHATS} hội thoại. Hãy bỏ ghim một hội thoại trước.`, 400);
    }
    await sequelize.query(
      `INSERT INTO forum_conversation_settings (user_id, peer_id, pinned_at, created_at, updated_at)
       VALUES (:me, :peer, ${pinned ? 'NOW()' : 'NULL'}, NOW(), NOW())
       ON CONFLICT (user_id, peer_id) DO UPDATE SET pinned_at = EXCLUDED.pinned_at, updated_at = NOW()`,
      { replacements: { me: req.user.id, peer: peer.id } }
    );
    res.json({ success: true, data: { pinned } });
  } catch (error) { next(error); }
};

// GET /api/forum/messages/unread-count — số tin chưa đọc (chấm đỏ trên thanh trên cùng) + tin mới nhất để hiện thông báo nổi
exports.unreadCount = async (req, res, next) => {
  try {
    const [r] = await sequelize.query(
      'SELECT COUNT(*) AS n FROM forum_messages WHERE recipient_id = :me AND read_at IS NULL AND recalled_at IS NULL AND NOT hidden_for_recipient',
      { replacements: { me: req.user.id }, type: sequelize.QueryTypes.SELECT }
    );
    const unread = Number(r.n);
    let latest = null;
    if (unread > 0) {
      const [m] = await sequelize.query(
        `SELECT id, sender_id, content, created_at FROM forum_messages
          WHERE recipient_id = :me AND read_at IS NULL AND recalled_at IS NULL AND NOT hidden_for_recipient
          ORDER BY created_at DESC LIMIT 1`,
        { replacements: { me: req.user.id }, type: sequelize.QueryTypes.SELECT }
      );
      const who = m ? (await authorInfo([m.sender_id])).get(m.sender_id) : null;
      if (m) latest = { id: m.id, from_id: m.sender_id, from_name: who?.full_name || 'Thành viên', from_avatar: who?.avatar_url || null, preview: excerpt(m.content, 80), at: m.created_at };
    }
    res.json({ success: true, data: { unread, latest } });
  } catch (error) { next(error); }
};
