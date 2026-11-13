const { sequelize, User, ForumReport, ForumWarning } = require('../models');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');
const { MAX_WARNINGS } = require('../utils/forumSocial');
const forum = require('./forumController');

const { isUuid, loadPost, authorInfo, excerpt, removePost } = forum.internals;

// Chế tài với người đăng bài vi phạm: cảnh cáo, xóa bài, khóa tài khoản. Đủ MAX_WARNINGS lần cảnh cáo thì tự động khóa tài khoản.
// Chỉ Admin dùng (route đã chặn). Không xử phạt quản trị viên và không tự xử phạt mình.

const cleanMessage = (v) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/\s+/g, ' ').trim().slice(0, 500);

// POST /api/forum/reports/:id/action { warn, delete_post, lock, message }
exports.sanctionReport = async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) throw new AppError('Không tìm thấy báo cáo', 404);
    const report = await ForumReport.findByPk(req.params.id);
    if (!report) throw new AppError('Không tìm thấy báo cáo', 404);
    const { post, thread } = await loadPost(report.post_id);

    const lock = !!req.body.lock;
    const warn = !!req.body.warn || lock; // khóa ngay cũng ghi nhận là một lần cảnh cáo
    const del = !!req.body.delete_post;
    if (!warn && !del) throw new AppError('Hãy chọn ít nhất một hình thức xử lý', 400);
    const message = cleanMessage(req.body.message);
    if (warn && message.length < 5) throw new AppError('Vui lòng nhập lời nhắn gửi người đăng (tối thiểu 5 ký tự)', 400);

    const author = await User.findByPk(post.author_id);
    if (!author && warn) throw new AppError('Tài khoản người đăng không còn tồn tại', 400);
    if (author) {
      if (author.id === req.user.id) throw new AppError('Bạn không thể xử phạt chính mình', 400);
      if ((await authorInfo([author.id])).get(author.id)?.role === 'ADMIN') throw new AppError('Không thể xử phạt quản trị viên', 400);
    }

    const title = excerpt(thread.title, 80);
    let warningCount = 0; let locked = false; let newlyLocked = false; let deletedThread = false;
    await sequelize.transaction(async (t) => {
      if (warn) {
        await ForumWarning.create({
          user_id: author.id, issued_by: req.user.id, post_id: post.id, reason: report.reason, message,
          post_excerpt: excerpt(post.content, 280), thread_title: excerpt(thread.title, 190), post_deleted: del,
        }, { transaction: t });
        warningCount = await ForumWarning.count({ where: { user_id: author.id }, transaction: t });
        if (lock || warningCount >= MAX_WARNINGS) {
          locked = true;
          if (author.status !== 'LOCKED') { await author.update({ status: 'LOCKED' }, { transaction: t }); newlyLocked = true; }
        }
      }
      const action = [warn && !lock ? 'warn' : null, lock ? 'lock' : null, del ? 'delete' : null].filter(Boolean).join('+');
      await ForumReport.update({ status: 'RESOLVED', handled_by: req.user.id, handled_at: new Date(), action }, { where: { post_id: post.id, status: 'OPEN' }, transaction: t });
      if (del) deletedThread = (await removePost(post, thread, t)).deleted_thread;
    });

    // Báo cho người đăng (sau khi ghi xong). Tài khoản vừa bị khóa vẫn được gửi email để biết lý do.
    if (author && warn) {
      await createNotification({
        user_id: author.id, type: 'FORUM_WARNING', allowLocked: true, link: '/forum',
        title: locked ? 'Tài khoản của bạn đã bị khóa' : `Cảnh cáo vi phạm nội quy diễn đàn (lần ${warningCount}/${MAX_WARNINGS})`,
        message: locked
          ? `Tài khoản của bạn đã bị khóa do vi phạm nội quy diễn đàn (${warningCount} lần cảnh cáo), liên quan đến bài viết trong chủ đề "${title}".\nLời nhắn của quản trị viên: ${message}\nNếu cho rằng có nhầm lẫn, vui lòng liên hệ quản trị viên.`
          : `Quản trị viên đã cảnh cáo bạn vì bài viết trong chủ đề "${title}"${del ? ' (bài viết đã bị gỡ)' : ''}.\nLời nhắn: ${message}\nĐây là lần cảnh cáo thứ ${warningCount}/${MAX_WARNINGS}. Vi phạm đủ ${MAX_WARNINGS} lần, tài khoản sẽ bị khóa.`,
        metadata: { warning_count: warningCount, post_id: del ? null : post.id },
      });
    } else if (author && del) {
      await createNotification({
        user_id: author.id, type: 'FORUM_WARNING', email: false, link: '/forum',
        title: 'Bài viết của bạn đã bị gỡ', message: `Bài viết của bạn trong chủ đề "${title}" đã bị quản trị viên gỡ vì vi phạm nội quy diễn đàn.`,
      });
    }

    const parts = [];
    if (warn) parts.push(`đã cảnh cáo (lần ${warningCount}/${MAX_WARNINGS})`);
    if (newlyLocked) parts.push('tài khoản đã bị khóa');
    else if (locked) parts.push('tài khoản vốn đã bị khóa');
    if (del) parts.push(deletedThread ? 'đã xóa chủ đề' : 'đã xóa bài viết');
    const text = parts.join(', ');
    res.json({ success: true, data: { warning_count: warningCount, locked, deleted: del }, message: text.charAt(0).toUpperCase() + text.slice(1) });
  } catch (error) { next(error); }
};

// GET /api/forum/warnings?page= — lịch sử cảnh cáo (mới nhất trước), kèm số lần của từng người và tình trạng tài khoản
exports.listWarnings = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = 20;
    const [rows, total] = await Promise.all([
      sequelize.query(
        `SELECT w.id, w.reason, w.message, w.post_excerpt, w.thread_title, w.post_deleted, w.created_at, w.post_id,
                p.thread_id, u.id AS user_id, u.full_name, u.avatar_url, u.status,
                iu.full_name AS issuer_name,
                (SELECT COUNT(*) FROM forum_warnings x WHERE x.user_id = w.user_id) AS user_warnings
           FROM forum_warnings w JOIN users u ON u.id = w.user_id
           LEFT JOIN users iu ON iu.id = w.issued_by LEFT JOIN forum_posts p ON p.id = w.post_id
          ORDER BY w.created_at DESC LIMIT :limit OFFSET :offset`,
        { replacements: { limit, offset: (page - 1) * limit }, type: sequelize.QueryTypes.SELECT }
      ),
      ForumWarning.count(),
    ]);
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id, reason: r.reason, message: r.message, post_excerpt: r.post_excerpt, thread_title: r.thread_title, post_deleted: r.post_deleted, created_at: r.created_at,
        post_link: r.post_id && r.thread_id ? `/forum/t/${r.thread_id}?post=${r.post_id}` : null,
        issuer_name: r.issuer_name, user: { id: r.user_id, full_name: r.full_name, avatar_url: r.avatar_url, locked: r.status === 'LOCKED', warnings: Number(r.user_warnings) },
      })),
      max_warnings: MAX_WARNINGS,
      pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) { next(error); }
};

// DELETE /api/forum/warnings/:id — gỡ một lần cảnh cáo (khi xử nhầm). Không tự mở khóa tài khoản: mở khóa ở trang Quản lý người dùng.
exports.revokeWarning = async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) throw new AppError('Không tìm thấy cảnh cáo', 404);
    const warning = await ForumWarning.findByPk(req.params.id);
    if (!warning) throw new AppError('Không tìm thấy cảnh cáo', 404);
    await warning.destroy();
    const remaining = await ForumWarning.count({ where: { user_id: warning.user_id } });
    res.json({ success: true, data: { warnings: remaining }, message: `Đã gỡ cảnh cáo, người này còn ${remaining}/${MAX_WARNINGS} lần` });
  } catch (error) { next(error); }
};
