const { sequelize, User, ForumFollow, ForumIgnore, ForumBookmark, ForumReport } = require('../models');
const AppError = require('../utils/AppError');
const { notifyAdmins } = require('./notificationController');
const forum = require('./forumController');

const { isUuid, loadPost, threadAccess, authorInfo, excerpt, checkRate } = forum.internals;

// Theo dõi / bỏ qua thành viên, lưu bài viết, báo cáo bài viết vi phạm của diễn đàn.

const REASONS = {
  SPAM: 'Spam / quảng cáo',
  OFFENSIVE: 'Ngôn từ xúc phạm',
  ILLEGAL: 'Vi phạm pháp luật / lừa đảo',
  OTHER: 'Lý do khác',
};

async function loadMember(id, selfId) {
  if (!isUuid(id)) throw new AppError('Không tìm thấy thành viên', 404);
  if (id === selfId) throw new AppError('Bạn không thể thực hiện thao tác này với chính mình', 400);
  const user = await User.findByPk(id, { attributes: ['id', 'full_name'] });
  if (!user) throw new AppError('Không tìm thấy thành viên', 404);
  return user;
}

// POST /api/forum/members/:id/follow — bật / tắt theo dõi (được báo khi thành viên đó mở chủ đề mới)
exports.toggleFollow = async (req, res, next) => {
  try {
    const target = await loadMember(req.params.id, req.user.id);
    const existing = await ForumFollow.findOne({ where: { follower_id: req.user.id, followee_id: target.id } });
    if (existing) await existing.destroy();
    else {
      await ForumIgnore.destroy({ where: { user_id: req.user.id, ignored_id: target.id } }); // đã theo dõi thì không còn bỏ qua
      await ForumFollow.create({ follower_id: req.user.id, followee_id: target.id });
    }
    res.json({ success: true, data: { following: !existing, ignored: false }, message: existing ? `Đã bỏ theo dõi ${target.full_name}` : `Đã theo dõi ${target.full_name}. Bạn sẽ được báo khi họ mở chủ đề mới` });
  } catch (error) { next(error); }
};

// POST /api/forum/members/:id/ignore — bật / tắt bỏ qua: ẩn bài của người đó và chặn họ nhắn tin cho bạn
exports.toggleIgnore = async (req, res, next) => {
  try {
    const target = await loadMember(req.params.id, req.user.id);
    const info = (await authorInfo([target.id])).get(target.id);
    if (info?.role === 'ADMIN') throw new AppError('Không thể bỏ qua quản trị viên', 400);
    const existing = await ForumIgnore.findOne({ where: { user_id: req.user.id, ignored_id: target.id } });
    if (existing) await existing.destroy();
    else {
      await ForumFollow.destroy({ where: { follower_id: req.user.id, followee_id: target.id } }); // bỏ qua thì không còn theo dõi
      await ForumIgnore.create({ user_id: req.user.id, ignored_id: target.id });
    }
    res.json({ success: true, data: { ignored: !existing, following: false }, message: existing ? `Đã bỏ chặn ${target.full_name}` : `Đã bỏ qua ${target.full_name}. Bài viết của họ sẽ được ẩn với bạn` });
  } catch (error) { next(error); }
};

// POST /api/forum/posts/:id/bookmark — lưu / bỏ lưu một bài viết
exports.toggleBookmark = async (req, res, next) => {
  try {
    const { post, thread } = await loadPost(req.params.id);
    await threadAccess(req, thread);
    const existing = await ForumBookmark.findOne({ where: { user_id: req.user.id, post_id: post.id } });
    if (existing) await existing.destroy(); else await ForumBookmark.create({ user_id: req.user.id, post_id: post.id });
    res.json({ success: true, data: { bookmarked: !existing }, message: existing ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết' });
  } catch (error) { next(error); }
};

// GET /api/forum/bookmarks?page= — bài viết đã lưu (mới lưu trước); bài ở diễn đàn dự án chỉ hiện khi bạn còn là thành viên
exports.listBookmarks = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = 20;
    const admin = !!req.userRoles?.includes('ADMIN');
    const where = `b.user_id = :me AND (t.workspace_id IS NULL OR :admin OR EXISTS (
        SELECT 1 FROM workspace_members wm JOIN candidate_profiles cp ON cp.id = wm.candidate_profile_id
         WHERE wm.workspace_id = t.workspace_id AND cp.user_id = :me AND wm.status = 'ACTIVE'))`;
    const [rows, count] = await Promise.all([
      sequelize.query(
        `SELECT b.created_at AS saved_at, p.id AS post_id, p.author_id, left(p.content, 240) AS excerpt, p.created_at AS post_at,
                t.id AS thread_id, t.title, t.workspace_id, c.name AS category_name
           FROM forum_bookmarks b JOIN forum_posts p ON p.id = b.post_id JOIN forum_threads t ON t.id = p.thread_id
           LEFT JOIN forum_categories c ON c.id = t.category_id
          WHERE ${where} ORDER BY b.created_at DESC LIMIT :limit OFFSET :offset`,
        { replacements: { me: req.user.id, admin, limit, offset: (page - 1) * limit }, type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT COUNT(*) AS n FROM forum_bookmarks b JOIN forum_posts p ON p.id = b.post_id JOIN forum_threads t ON t.id = p.thread_id WHERE ${where}`,
        { replacements: { me: req.user.id, admin }, type: sequelize.QueryTypes.SELECT }
      ),
    ]);
    const authors = await authorInfo(rows.map((r) => r.author_id));
    res.json({
      success: true,
      data: rows.map((r) => ({
        post_id: r.post_id, thread_id: r.thread_id, title: r.title, category_name: r.category_name, is_workspace: !!r.workspace_id,
        excerpt: excerpt(r.excerpt, 200), saved_at: r.saved_at, post_at: r.post_at,
        author: authors.get(r.author_id) ? { id: r.author_id, full_name: authors.get(r.author_id).full_name, avatar_url: authors.get(r.author_id).avatar_url } : null,
      })),
      pagination: { total: Number(count[0].n), page, limit, totalPages: Math.max(1, Math.ceil(Number(count[0].n) / limit)) },
    });
  } catch (error) { next(error); }
};

// POST /api/forum/posts/:id/report { reason, note } — báo cáo bài viết vi phạm cho quản trị viên
exports.createReport = async (req, res, next) => {
  try {
    const { post, thread } = await loadPost(req.params.id);
    await threadAccess(req, thread);
    if (post.author_id === req.user.id) throw new AppError('Bạn không thể báo cáo bài viết của chính mình', 400);
    const reason = String(req.body.reason || '');
    if (!REASONS[reason]) throw new AppError('Vui lòng chọn lý do báo cáo', 400);
    const note = String(req.body.note || '').trim().slice(0, 500) || null;
    if (reason === 'OTHER' && !note) throw new AppError('Vui lòng mô tả lý do khác', 400);
    if (await ForumReport.findOne({ where: { post_id: post.id, reporter_id: req.user.id } })) throw new AppError('Bạn đã báo cáo bài viết này rồi, quản trị viên sẽ xem xét', 409);
    checkRate(req.user.id, 'report');
    await ForumReport.create({ post_id: post.id, reporter_id: req.user.id, reason, note });
    await notifyAdmins({
      type: 'FORUM_REPORT', title: 'Báo cáo bài viết diễn đàn',
      message: `${req.user.full_name} báo cáo một bài viết (${REASONS[reason]}) trong chủ đề "${excerpt(thread.title, 80)}".`,
      link: '/forum/reports', metadata: { post_id: post.id, thread_id: thread.id },
    });
    res.status(201).json({ success: true, message: 'Đã gửi báo cáo tới quản trị viên. Cảm ơn bạn!' });
  } catch (error) { next(error); }
};

// GET /api/forum/reports?status=OPEN|RESOLVED|DISMISSED&page= — hàng đợi báo cáo (Admin)
exports.listReports = async (req, res, next) => {
  try {
    const status = ['OPEN', 'RESOLVED', 'DISMISSED'].includes(req.query.status) ? req.query.status : 'OPEN';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = 20;
    const [rows, counts] = await Promise.all([
      sequelize.query(
        `SELECT r.id, r.reason, r.note, r.status, r.created_at, r.handled_at,
                p.id AS post_id, p.author_id, left(p.content, 300) AS excerpt,
                t.id AS thread_id, t.title, t.workspace_id,
                ru.id AS reporter_id, ru.full_name AS reporter_name
           FROM forum_reports r JOIN forum_posts p ON p.id = r.post_id JOIN forum_threads t ON t.id = p.thread_id JOIN users ru ON ru.id = r.reporter_id
          WHERE r.status = :status ORDER BY r.created_at DESC LIMIT :limit OFFSET :offset`,
        { replacements: { status, limit, offset: (page - 1) * limit }, type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query('SELECT status, COUNT(*) AS n FROM forum_reports GROUP BY status', { type: sequelize.QueryTypes.SELECT }),
    ]);
    const authors = await authorInfo(rows.map((r) => r.author_id));
    const by = Object.fromEntries(counts.map((c) => [c.status, Number(c.n)]));
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id, reason: r.reason, reason_label: REASONS[r.reason] || r.reason, note: r.note, status: r.status, created_at: r.created_at, handled_at: r.handled_at,
        post: { id: r.post_id, excerpt: excerpt(r.excerpt, 260), author: authors.get(r.author_id) ? { id: r.author_id, full_name: authors.get(r.author_id).full_name, avatar_url: authors.get(r.author_id).avatar_url, role: authors.get(r.author_id).role } : null },
        thread: { id: r.thread_id, title: r.title, is_workspace: !!r.workspace_id },
        reporter: { id: r.reporter_id, full_name: r.reporter_name },
      })),
      counts: { OPEN: by.OPEN || 0, RESOLVED: by.RESOLVED || 0, DISMISSED: by.DISMISSED || 0 },
      pagination: { total: by[status] || 0, page, limit, totalPages: Math.max(1, Math.ceil((by[status] || 0) / limit)) },
    });
  } catch (error) { next(error); }
};

// PUT /api/forum/reports/:id { status: 'RESOLVED' | 'DISMISSED' } — đánh dấu đã xử lý / bỏ qua báo cáo (Admin)
exports.handleReport = async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) throw new AppError('Không tìm thấy báo cáo', 404);
    const report = await ForumReport.findByPk(req.params.id);
    if (!report) throw new AppError('Không tìm thấy báo cáo', 404);
    const status = req.body.status;
    if (!['RESOLVED', 'DISMISSED'].includes(status)) throw new AppError('Trạng thái không hợp lệ', 400);
    await ForumReport.update({ status, handled_by: req.user.id, handled_at: new Date() }, { where: { post_id: report.post_id, status: 'OPEN' } }); // xử lý một lần cho mọi báo cáo cùng bài
    res.json({ success: true, message: status === 'RESOLVED' ? 'Đã đánh dấu đã xử lý' : 'Đã bỏ qua báo cáo' });
  } catch (error) { next(error); }
};
