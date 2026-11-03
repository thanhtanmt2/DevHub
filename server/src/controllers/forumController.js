const { Op } = require('sequelize');
const { sequelize, ForumCategory, ForumThread, ForumPost, ForumPostLike } = require('../models');
const AppError = require('../utils/AppError');
const { getWorkspaceAccess } = require('../utils/workspaceAccess');
const { computeRanks } = require('../utils/candidateRank');
const { createNotification } = require('./notificationController');
const { touchPresence, ignoredIds, followerIds, MAX_WARNINGS } = require('../utils/forumSocial');

// ─────────────────────────────────────────────────────────────────────────────
// Diễn đàn: diễn đàn chung (theo chuyên mục) + diễn đàn riêng của từng workspace (chỉ thành viên và Admin).
//  - Chủ đề = bài gốc + các bài trả lời (có thể trích dẫn); mọi người đã đăng nhập đều đăng / trả lời / thích được; khách chỉ đọc.
//  - Quản trị: Admin ghim / khóa / xóa / chuyển chuyên mục; ở diễn đàn workspace thì Admin và Lead được ghim / khóa / xóa.
// ─────────────────────────────────────────────────────────────────────────────

const POSTS_PER_PAGE = 20;
const THREADS_PER_PAGE = 20;
const MAX_CONTENT = 10000;
const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);

// Chống spam: mỗi người tối đa N lượt mỗi phút cho từng loại thao tác (đủ cho một server; nhiều tiến trình thì chuyển sang Redis)
const RATE_LIMITS = { post: 8, message: 20, report: 10 };
const RATE_MESSAGES = {
  post: 'Bạn đăng bài quá nhanh, vui lòng đợi một chút rồi thử lại',
  message: 'Bạn nhắn tin quá nhanh, vui lòng đợi một chút',
  report: 'Bạn báo cáo quá nhanh, vui lòng đợi một chút',
};
const recent = new Map();
function checkRate(userId, kind = 'post') {
  const now = Date.now();
  const key = `${kind}:${userId}`;
  const list = (recent.get(key) || []).filter((t) => now - t < 60 * 1000);
  if (list.length >= RATE_LIMITS[kind]) throw new AppError(RATE_MESSAGES[kind], 429);
  list.push(now);
  recent.set(key, list);
}

const cleanContent = (v) => String(v ?? '')
  .replace(/\r\n/g, '\n')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  .replace(/\n{4,}/g, '\n\n\n')
  .trim();

function validateContent(v) {
  const content = cleanContent(v);
  if (content.length < 2) throw new AppError('Vui lòng nhập nội dung bài viết', 400);
  if (content.length > MAX_CONTENT) throw new AppError(`Nội dung tối đa ${MAX_CONTENT.toLocaleString('vi-VN')} ký tự`, 400);
  return content;
}
function validateTitle(v) {
  const title = String(v ?? '').replace(/\s+/g, ' ').trim();
  if (title.length < 5) throw new AppError('Tiêu đề quá ngắn (tối thiểu 5 ký tự)', 400);
  if (title.length > 200) throw new AppError('Tiêu đề tối đa 200 ký tự', 400);
  return title;
}
const likePattern = (q) => `%${String(q).replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
const excerpt = (text, n = 140) => { const t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n)}…` : t; };

const isAdmin = (req) => !!req.userRoles?.includes('ADMIN');

// Quyền với diễn đàn workspace: phải là Admin hoặc thành viên đang tham gia
async function workspaceAccess(req, workspaceId) {
  if (!req.user) throw new AppError('Vui lòng đăng nhập để vào diễn đàn dự án', 401);
  const access = await getWorkspaceAccess(req, workspaceId);
  if (!access.canView) throw new AppError('Bạn không phải thành viên của dự án này nên không vào được diễn đàn của dự án', 403);
  return access;
}

// Thông tin gọn của người đăng (hiện cạnh bài): vai trò, công ty, hạng danh hiệu (ứng viên cho phép hiện dự án DevHub)
async function authorInfo(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  const map = new Map();
  if (!ids.length) return map;
  const rows = await sequelize.query(
    `SELECT u.id, u.full_name, u.avatar_url, u.created_at,
            (SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id
              ORDER BY CASE r.name WHEN 'ADMIN' THEN 1 WHEN 'EMPLOYER' THEN 2 ELSE 3 END LIMIT 1) AS role,
            (SELECT c.name FROM companies c WHERE c.user_id = u.id LIMIT 1) AS company_name,
            cp.id AS profile_id, cp.privacy_settings
       FROM users u LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
      WHERE u.id IN (:ids)`,
    { replacements: { ids }, type: sequelize.QueryTypes.SELECT }
  );
  const rankable = rows.filter((r) => r.role === 'CANDIDATE' && r.profile_id && r.privacy_settings?.show_devhub_projects !== false).map((r) => r.profile_id);
  const ranks = await computeRanks(rankable);
  for (const r of rows) {
    const rank = ranks.get(r.profile_id);
    map.set(r.id, {
      id: r.id,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      role: r.role || 'CANDIDATE',
      company_name: r.role === 'EMPLOYER' ? r.company_name : null,
      joined_at: r.created_at,
      rank: rank && rank.tier.level > 0 ? { key: rank.tier.key, name: rank.tier.name } : null,
    });
  }
  return map;
}

const shortAuthor = (a) => (a ? { id: a.id, full_name: a.full_name, avatar_url: a.avatar_url, role: a.role, rank: a.rank } : null);

// ── Chuyên mục ────────────────────────────────────────────────────────────────

// GET /api/forum/overview — chuyên mục (kèm số liệu + chủ đề mới nhất), chủ đề mới hoạt động, số liệu chung
exports.getOverview = async (req, res, next) => {
  try {
    const meId = req.user?.id || null;
    if (meId) touchPresence(meId);
    const excludeAuthorIds = await ignoredIds(meId);
    const [categories, stats, latest, mine] = await Promise.all([
      sequelize.query(
        `SELECT c.id, c.name, c.slug, c.description, c.icon, c.sort_order, c.admin_only,
                (SELECT COUNT(*) FROM forum_threads t WHERE t.category_id = c.id) AS thread_count,
                (SELECT COALESCE(SUM(t.reply_count + 1), 0) FROM forum_threads t WHERE t.category_id = c.id) AS post_count,
                lt.id AS last_thread_id, lt.title AS last_thread_title, lt.last_post_at, lu.full_name AS last_user_name, lu.avatar_url AS last_user_avatar
           FROM forum_categories c
           LEFT JOIN LATERAL (SELECT t.id, t.title, t.last_post_at, t.last_post_user_id FROM forum_threads t
                               WHERE t.category_id = c.id ORDER BY t.last_post_at DESC LIMIT 1) lt ON TRUE
           LEFT JOIN users lu ON lu.id = lt.last_post_user_id
          ORDER BY c.sort_order, c.name`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT (SELECT COUNT(*) FROM forum_threads WHERE category_id IS NOT NULL) AS threads,
                (SELECT COUNT(*) FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id WHERE t.category_id IS NOT NULL) AS posts,
                (SELECT COUNT(DISTINCT p.author_id) FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id WHERE t.category_id IS NOT NULL) AS members`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      listThreads({ publicOnly: true, sort: 'latest', limit: 10, offset: 0, excludeAuthorIds }),
      meId
        ? sequelize.query(
          `SELECT (SELECT COUNT(*) FROM forum_messages WHERE recipient_id = :me AND read_at IS NULL) AS unread_messages,
                  (SELECT COUNT(*) FROM forum_reports WHERE status = 'OPEN' AND :admin) AS open_reports`,
          { replacements: { me: meId, admin: isAdmin(req) }, type: sequelize.QueryTypes.SELECT }
        )
        : [null],
    ]);
    res.json({
      success: true,
      data: {
        categories: categories.map((c) => ({ ...c, thread_count: Number(c.thread_count), post_count: Number(c.post_count) })),
        stats: { threads: Number(stats[0].threads), posts: Number(stats[0].posts), members: Number(stats[0].members) },
        latest: latest.rows,
        me: mine[0] ? { unread_messages: Number(mine[0].unread_messages), open_reports: Number(mine[0].open_reports) } : null,
      },
    });
  } catch (error) { next(error); }
};

function categoryPayload(body) {
  const name = String(body.name || '').trim();
  if (name.length < 2 || name.length > 100) throw new AppError('Tên chuyên mục từ 2 đến 100 ký tự', 400);
  const slug = String(body.slug || name)
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
  if (!slug) throw new AppError('Đường dẫn chuyên mục không hợp lệ', 400);
  return {
    name, slug,
    description: body.description ? String(body.description).trim().slice(0, 255) : null,
    icon: /^[a-zA-Z]{2,30}$/.test(body.icon || '') ? body.icon : 'chat',
    sort_order: Number.isFinite(Number(body.sort_order)) ? Math.trunc(Number(body.sort_order)) : 0,
    admin_only: !!body.admin_only,
  };
}

// POST /api/forum/categories — Admin tạo chuyên mục
exports.createCategory = async (req, res, next) => {
  try {
    const data = categoryPayload(req.body);
    if (await ForumCategory.findOne({ where: { slug: data.slug } })) throw new AppError('Đã có chuyên mục trùng tên / đường dẫn', 400);
    res.status(201).json({ success: true, data: await ForumCategory.create(data), message: 'Đã tạo chuyên mục' });
  } catch (error) { next(error); }
};

// PUT /api/forum/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const cat = isUuid(req.params.id) ? await ForumCategory.findByPk(req.params.id) : null;
    if (!cat) throw new AppError('Không tìm thấy chuyên mục', 404);
    const data = categoryPayload({ ...cat.toJSON(), ...req.body, slug: req.body.slug || cat.slug });
    if (data.slug !== cat.slug && await ForumCategory.findOne({ where: { slug: data.slug } })) throw new AppError('Đã có chuyên mục trùng đường dẫn', 400);
    res.json({ success: true, data: await cat.update(data), message: 'Đã cập nhật chuyên mục' });
  } catch (error) { next(error); }
};

// DELETE /api/forum/categories/:id — chỉ xóa được chuyên mục trống
exports.deleteCategory = async (req, res, next) => {
  try {
    const cat = isUuid(req.params.id) ? await ForumCategory.findByPk(req.params.id) : null;
    if (!cat) throw new AppError('Không tìm thấy chuyên mục', 404);
    const n = await ForumThread.count({ where: { category_id: cat.id } });
    if (n > 0) throw new AppError(`Chuyên mục còn ${n} chủ đề. Hãy chuyển hoặc xóa các chủ đề trước khi xóa chuyên mục`, 400);
    await cat.destroy();
    res.json({ success: true, message: 'Đã xóa chuyên mục' });
  } catch (error) { next(error); }
};

// GET /api/forum/members/:id — thông tin đầy đủ của một thành viên diễn đàn (hiện khi bấm vào ảnh đại diện).
// Chỉ gồm hoạt động ở diễn đàn chung (không tính chủ đề riêng của workspace) và hạng danh hiệu nếu ứng viên cho phép hiện dự án DevHub.
exports.getMember = async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) throw new AppError('Không tìm thấy thành viên', 404);
    const info = (await authorInfo([req.params.id])).get(req.params.id);
    if (!info) throw new AppError('Không tìm thấy thành viên', 404);

    const [stats] = await sequelize.query(
      `SELECT (SELECT COUNT(*) FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id WHERE p.author_id = :id AND t.category_id IS NOT NULL) AS post_count,
              (SELECT COUNT(*) FROM forum_threads t WHERE t.author_id = :id AND t.category_id IS NOT NULL) AS thread_count,
              (SELECT COUNT(*) FROM forum_post_likes l JOIN forum_posts p ON p.id = l.post_id JOIN forum_threads t ON t.id = p.thread_id
                WHERE p.author_id = :id AND t.category_id IS NOT NULL AND l.value = 1) AS likes_received,
              (SELECT COUNT(*) FROM forum_post_likes l JOIN forum_posts p ON p.id = l.post_id JOIN forum_threads t ON t.id = p.thread_id
                WHERE p.author_id = :id AND t.category_id IS NOT NULL AND l.value = -1) AS dislikes_received,
              (SELECT MAX(p.created_at) FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id WHERE p.author_id = :id AND t.category_id IS NOT NULL) AS last_post_at`,
      { replacements: { id: info.id }, type: sequelize.QueryTypes.SELECT }
    );

    // Trực tuyến: lần cuối hoạt động ở diễn đàn hoặc trên hệ thống (nhật ký hoạt động); "đang xem" chỉ hiện khi vừa hoạt động trong 5 phút và là chủ đề công khai
    const [presence] = await sequelize.query(
      `SELECT GREATEST((SELECT a.last_seen_at FROM forum_member_activity a WHERE a.user_id = :id),
                       (SELECT MAX(al.created_at) FROM activity_logs al WHERE al.user_id = :id)) AS last_seen_at,
              (SELECT json_build_object('id', t.id, 'title', t.title) FROM forum_member_activity a JOIN forum_threads t ON t.id = a.thread_id
                WHERE a.user_id = :id AND a.last_seen_at > NOW() - INTERVAL '5 minutes' AND t.category_id IS NOT NULL) AS watching`,
      { replacements: { id: info.id }, type: sequelize.QueryTypes.SELECT }
    );

    // Quan hệ giữa người đang xem và thành viên này (để hiện nút Theo dõi / Bỏ qua / Gửi tin nhắn đúng trạng thái)
    let viewer = null;
    if (req.user) {
      const [v] = await sequelize.query(
        `SELECT EXISTS (SELECT 1 FROM forum_follows WHERE follower_id = :me AND followee_id = :id) AS following,
                EXISTS (SELECT 1 FROM forum_ignores WHERE user_id = :me AND ignored_id = :id) AS ignored,
                EXISTS (SELECT 1 FROM forum_ignores WHERE user_id = :id AND ignored_id = :me) AS blocked_by`,
        { replacements: { me: req.user.id, id: info.id }, type: sequelize.QueryTypes.SELECT }
      );
      const self = req.user.id === info.id;
      viewer = { is_self: self, following: !!v.following, ignored: !!v.ignored, can_message: !self && !v.blocked_by, can_ignore: !self && info.role !== 'ADMIN' };
    }

    // Chỉ quản trị viên thấy: số lần đã bị cảnh cáo và tài khoản có đang bị khóa không
    let moderation = null;
    if (isAdmin(req)) {
      const [m] = await sequelize.query(
        `SELECT (SELECT COUNT(*) FROM forum_warnings WHERE user_id = :id) AS warnings, (SELECT status FROM users WHERE id = :id) AS status`,
        { replacements: { id: info.id }, type: sequelize.QueryTypes.SELECT }
      );
      moderation = { warnings: Number(m.warnings), max_warnings: MAX_WARNINGS, locked: m.status === 'LOCKED' };
    }

    let rank = null;
    if (info.role === 'CANDIDATE') {
      const [cp] = await sequelize.query('SELECT id, privacy_settings FROM candidate_profiles WHERE user_id = :id', { replacements: { id: info.id }, type: sequelize.QueryTypes.SELECT });
      if (cp && cp.privacy_settings?.show_devhub_projects !== false) {
        const r = (await computeRanks([cp.id])).get(cp.id);
        if (r) rank = { tier: { key: r.tier.key, name: r.tier.name }, points: r.points, completed_projects: r.completed_projects, joined_projects: r.joined_projects, avg_score: r.avg_score, grade: r.grade };
      }
    }
    res.json({
      success: true,
      data: {
        id: info.id, full_name: info.full_name, avatar_url: info.avatar_url, role: info.role, company_name: info.company_name,
        joined_at: info.joined_at, rank,
        post_count: Number(stats.post_count), thread_count: Number(stats.thread_count), last_post_at: stats.last_post_at,
        // Điểm cảm xúc = lượt thích nhận được trừ lượt không thích (như XenForo / voz), chỉ tính ở diễn đàn chung
        likes_received: Number(stats.likes_received), dislikes_received: Number(stats.dislikes_received), reaction_score: Number(stats.likes_received) - Number(stats.dislikes_received),
        last_seen_at: presence.last_seen_at, watching: presence.watching || null,
        viewer, moderation,
      },
    });
  } catch (error) { next(error); }
};

// ── Danh sách chủ đề ──────────────────────────────────────────────────────────

async function listThreads({ categoryId, workspaceId, publicOnly, q, authorId, excludeAuthorIds, sort = 'latest', limit, offset }) {
  const where = [];
  const rep = { limit, offset };
  if (excludeAuthorIds?.length) { where.push('t.author_id NOT IN (:excludeAuthorIds)'); rep.excludeAuthorIds = excludeAuthorIds; }
  if (categoryId) { where.push('t.category_id = :categoryId'); rep.categoryId = categoryId; }
  if (workspaceId) { where.push('t.workspace_id = :workspaceId'); rep.workspaceId = workspaceId; }
  if (publicOnly) where.push('t.category_id IS NOT NULL');
  if (authorId) { where.push('t.author_id = :authorId'); rep.authorId = authorId; }
  if (q) {
    where.push(`(t.title ILIKE :q OR EXISTS (SELECT 1 FROM forum_posts p WHERE p.thread_id = t.id AND p.content ILIKE :q))`);
    rep.q = likePattern(q);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  // Ghim lên đầu khi xem trong một chuyên mục / workspace
  const pin = (categoryId || workspaceId) ? 't.is_pinned DESC, ' : '';
  const order = sort === 'new' ? `${pin}t.created_at DESC` : sort === 'hot' ? `${pin}t.reply_count DESC, t.view_count DESC, t.last_post_at DESC` : `${pin}t.last_post_at DESC`;

  const [rows, count] = await Promise.all([
    sequelize.query(
      `SELECT t.id, t.title, t.is_pinned, t.is_locked, t.view_count, t.reply_count, t.last_post_at, t.created_at, t.workspace_id,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
              t.author_id, lu.id AS last_user_id, lu.full_name AS last_user_name, lu.avatar_url AS last_user_avatar,
              (SELECT COUNT(*) FROM forum_post_likes l JOIN forum_posts lp ON lp.id = l.post_id WHERE lp.thread_id = t.id AND l.value = 1) AS like_count,
              (SELECT left(p.content, 220) FROM forum_posts p WHERE p.thread_id = t.id ORDER BY p.created_at ASC LIMIT 1) AS preview
         FROM forum_threads t
         LEFT JOIN forum_categories c ON c.id = t.category_id
         LEFT JOIN users lu ON lu.id = t.last_post_user_id
         ${clause}
        ORDER BY ${order}
        LIMIT :limit OFFSET :offset`,
      { replacements: rep, type: sequelize.QueryTypes.SELECT }
    ),
    sequelize.query(`SELECT COUNT(*) AS n FROM forum_threads t ${clause}`, { replacements: rep, type: sequelize.QueryTypes.SELECT }),
  ]);
  const authors = await authorInfo(rows.map((r) => r.author_id));
  return {
    total: Number(count[0].n),
    rows: rows.map((r) => ({
      id: r.id, title: r.title, is_pinned: r.is_pinned, is_locked: r.is_locked,
      view_count: r.view_count, reply_count: r.reply_count, like_count: Number(r.like_count), last_post_at: r.last_post_at, created_at: r.created_at,
      workspace_id: r.workspace_id,
      category: r.category_id ? { id: r.category_id, name: r.category_name, slug: r.category_slug } : null,
      author: shortAuthor(authors.get(r.author_id)),
      last_user_name: r.last_user_name,
      last_user_avatar: r.last_user_avatar,
      preview: excerpt(r.preview, 160),
    })),
  };
}

// GET /api/forum/threads?category=slug&workspace_id=&q=&sort=latest|new|hot&author=me&page=
exports.getThreads = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = THREADS_PER_PAGE;
    const sort = ['latest', 'new', 'hot'].includes(req.query.sort) ? req.query.sort : 'latest';
    const q = String(req.query.q || '').trim().slice(0, 100) || null;

    const opts = { sort, q, limit, offset: (page - 1) * limit };
    let category = null; let workspace = null; let permissions = { can_post: !!req.user, can_moderate: false };

    if (req.query.workspace_id) {
      if (!isUuid(req.query.workspace_id)) throw new AppError('Workspace không hợp lệ', 400);
      const access = await workspaceAccess(req, req.query.workspace_id);
      opts.workspaceId = access.workspace.id;
      workspace = { id: access.workspace.id, name: access.workspace.name };
      permissions = { can_post: true, can_moderate: access.isAdmin || access.member?.role === 'LEAD' };
    } else {
      opts.publicOnly = true;
      if (req.query.category) {
        category = await ForumCategory.findOne({ where: { slug: String(req.query.category) } });
        if (!category) throw new AppError('Không tìm thấy chuyên mục', 404);
        opts.categoryId = category.id;
        permissions = { can_post: !!req.user && (!category.admin_only || isAdmin(req)), can_moderate: isAdmin(req) };
      }
    }
    if (req.query.author === 'me') {
      if (!req.user) throw new AppError('Vui lòng đăng nhập', 401);
      opts.authorId = req.user.id;
    } else if (isUuid(req.query.author)) {
      opts.authorId = req.query.author; // xem các chủ đề công khai của một thành viên
    }
    // Ẩn chủ đề của những người đã "bỏ qua" (trừ khi chủ động xem chủ đề của chính người đó)
    if (req.user) {
      touchPresence(req.user.id);
      if (!opts.authorId) opts.excludeAuthorIds = await ignoredIds(req.user.id);
    }

    const { rows, total } = await listThreads(opts);
    res.json({
      success: true,
      data: rows,
      category: category && category.toJSON(),
      workspace,
      permissions,
      pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) { next(error); }
};

// ── Chi tiết chủ đề ───────────────────────────────────────────────────────────

// Quyền của người đang xem một chủ đề: xem, đăng, quản trị
async function threadAccess(req, thread) {
  if (thread.workspace_id) {
    const access = await workspaceAccess(req, thread.workspace_id);
    return { canModerate: access.isAdmin || access.member?.role === 'LEAD', isAdmin: access.isAdmin, workspace: access.workspace };
  }
  return { canModerate: isAdmin(req), isAdmin: isAdmin(req), workspace: null };
}

async function loadThread(id) {
  if (!isUuid(id)) throw new AppError('Không tìm thấy chủ đề', 404);
  const thread = await ForumThread.findByPk(id);
  if (!thread) throw new AppError('Không tìm thấy chủ đề', 404);
  return thread;
}

// GET /api/forum/threads/:id?page=&post=
exports.getThread = async (req, res, next) => {
  try {
    const thread = await loadThread(req.params.id);
    const access = await threadAccess(req, thread);

    // ?post=<id> → nhảy tới trang chứa bài đó
    let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    if (req.query.post && isUuid(req.query.post)) {
      const target = await ForumPost.findOne({ where: { id: req.query.post, thread_id: thread.id }, attributes: ['createdAt'] });
      if (target) {
        const before = await ForumPost.count({ where: { thread_id: thread.id, createdAt: { [Op.lt]: target.createdAt } } });
        page = Math.floor(before / POSTS_PER_PAGE) + 1;
      }
    }
    const totalPosts = thread.reply_count + 1;
    const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
    if (page > totalPages) page = totalPages;
    const offset = (page - 1) * POSTS_PER_PAGE;

    if (page === 1) await ForumThread.increment('view_count', { where: { id: thread.id } });

    const rows = await sequelize.query(
      `SELECT p.id, p.author_id, p.content, p.created_at, p.edited_at, p.quote_post_id,
              (SELECT COUNT(*) FROM forum_post_likes l WHERE l.post_id = p.id AND l.value = 1) AS like_count,
              (SELECT COUNT(*) FROM forum_post_likes l WHERE l.post_id = p.id AND l.value = -1) AS dislike_count,
              ${req.user ? '(SELECT l.value FROM forum_post_likes l WHERE l.post_id = p.id AND l.user_id = :me)' : 'NULL'} AS my_value,
              qp.author_id AS quote_author_id, left(qp.content, 220) AS quote_content
         FROM forum_posts p LEFT JOIN forum_posts qp ON qp.id = p.quote_post_id
        WHERE p.thread_id = :tid
        ORDER BY p.created_at ASC, p.id ASC
        LIMIT :limit OFFSET :offset`,
      { replacements: { tid: thread.id, me: req.user?.id || null, limit: POSTS_PER_PAGE, offset }, type: sequelize.QueryTypes.SELECT }
    );
    const authors = await authorInfo([...rows.map((r) => r.author_id), ...rows.map((r) => r.quote_author_id), thread.author_id]);

    // Người đã thích từng bài (tối đa 8 người mới nhất), bài đã lưu / đã báo cáo của người xem, và những người xem đã bỏ qua
    const postIds = rows.map((r) => r.id);
    const likedBy = new Map(); const bookmarked = new Set(); const reported = new Set();
    if (postIds.length) {
      const likers = await sequelize.query(
        `SELECT l.post_id, u.id, u.full_name FROM forum_post_likes l JOIN users u ON u.id = l.user_id
          WHERE l.post_id IN (:ids) AND l.value = 1 ORDER BY l.created_at DESC`,
        { replacements: { ids: postIds }, type: sequelize.QueryTypes.SELECT }
      );
      for (const l of likers) {
        const list = likedBy.get(l.post_id) || [];
        if (list.length < 8) list.push({ id: l.id, full_name: l.full_name });
        likedBy.set(l.post_id, list);
      }
      if (req.user) {
        const flags = await sequelize.query(
          `SELECT 'b' AS k, post_id FROM forum_bookmarks WHERE user_id = :me AND post_id IN (:ids)
            UNION ALL SELECT 'r' AS k, post_id FROM forum_reports WHERE reporter_id = :me AND post_id IN (:ids)`,
          { replacements: { me: req.user.id, ids: postIds }, type: sequelize.QueryTypes.SELECT }
        );
        for (const f of flags) (f.k === 'b' ? bookmarked : reported).add(f.post_id);
      }
    }
    const ignoredSet = new Set(await ignoredIds(req.user?.id));
    if (req.user) touchPresence(req.user.id, thread.workspace_id ? null : thread.id);

    const firstPostId = (await ForumPost.findOne({ where: { thread_id: thread.id }, order: [['createdAt', 'ASC'], ['id', 'ASC']], attributes: ['id'] }))?.id;

    const category = thread.category_id ? await ForumCategory.findByPk(thread.category_id, { attributes: ['id', 'name', 'slug'] }) : null;
    const me = req.user?.id;
    res.json({
      success: true,
      data: {
        thread: {
          id: thread.id, title: thread.title, is_pinned: thread.is_pinned, is_locked: thread.is_locked,
          view_count: thread.view_count + (page === 1 ? 1 : 0), reply_count: thread.reply_count, created_at: thread.createdAt,
          category: category && category.toJSON(),
          workspace: access.workspace ? { id: access.workspace.id, name: access.workspace.name } : null,
          author: shortAuthor(authors.get(thread.author_id)),
          can_reply: !!me && (!thread.is_locked || access.canModerate),
          can_moderate: access.canModerate,
          can_edit_title: !!me && (thread.author_id === me || access.canModerate),
        },
        posts: rows.map((r, i) => ({
          id: r.id,
          number: offset + i + 1,
          is_op: r.id === firstPostId,
          content: r.content,
          created_at: r.created_at,
          edited_at: r.edited_at,
          author: authors.get(r.author_id) || null,
          like_count: Number(r.like_count),
          dislike_count: Number(r.dislike_count),
          liked: r.my_value === 1,
          disliked: r.my_value === -1,
          liked_by: likedBy.get(r.id) || [],
          bookmarked: bookmarked.has(r.id),
          reported: reported.has(r.id),
          ignored: ignoredSet.has(r.author_id),
          can_report: !!me && r.author_id !== me,
          quote: r.quote_post_id ? { id: r.quote_post_id, author_name: authors.get(r.quote_author_id)?.full_name || 'Thành viên', excerpt: excerpt(r.quote_content, 200) } : null,
          can_edit: !!me && r.author_id === me,
          can_delete: !!me && (r.author_id === me || access.canModerate),
          can_like: !!me && r.author_id !== me,
        })),
        pagination: { total: totalPosts, page, limit: POSTS_PER_PAGE, totalPages },
      },
    });
  } catch (error) { next(error); }
};

// ── Đăng bài ──────────────────────────────────────────────────────────────────

// POST /api/forum/threads { category_id | workspace_id, title, content }
exports.createThread = async (req, res, next) => {
  try {
    const title = validateTitle(req.body.title);
    const content = validateContent(req.body.content);
    const { category_id, workspace_id } = req.body;
    if (!!category_id === !!workspace_id) throw new AppError('Hãy chọn chuyên mục hoặc dự án để đăng bài', 400);

    let category = null; let workspace = null;
    if (category_id) {
      category = isUuid(category_id) ? await ForumCategory.findByPk(category_id) : null;
      if (!category) throw new AppError('Không tìm thấy chuyên mục', 404);
      if (category.admin_only && !isAdmin(req)) throw new AppError('Chỉ quản trị viên được đăng bài ở chuyên mục này', 403);
    } else {
      if (!isUuid(workspace_id)) throw new AppError('Workspace không hợp lệ', 400);
      workspace = (await workspaceAccess(req, workspace_id)).workspace;
    }
    checkRate(req.user.id);

    const thread = await sequelize.transaction(async (t) => {
      const th = await ForumThread.create({
        category_id: category?.id || null, workspace_id: workspace?.id || null, author_id: req.user.id, title,
        last_post_at: new Date(), last_post_user_id: req.user.id,
      }, { transaction: t });
      await ForumPost.create({ thread_id: th.id, author_id: req.user.id, content }, { transaction: t });
      return th;
    });

    // Chủ đề mới trong diễn đàn dự án: báo cho các thành viên khác
    if (workspace) {
      const members = await sequelize.query(
        `SELECT cp.user_id FROM workspace_members wm JOIN candidate_profiles cp ON cp.id = wm.candidate_profile_id
          WHERE wm.workspace_id = :w AND wm.status = 'ACTIVE' AND cp.user_id <> :me`,
        { replacements: { w: workspace.id, me: req.user.id }, type: sequelize.QueryTypes.SELECT }
      );
      await Promise.all(members.map((m) => createNotification({
        user_id: m.user_id, type: 'FORUM_REPLY', email: false,
        title: 'Chủ đề mới trong diễn đàn dự án',
        message: `${req.user.full_name} đã mở chủ đề "${title}" trong diễn đàn của "${workspace.name}".`,
        link: `/forum/t/${thread.id}`, metadata: { thread_id: thread.id, workspace_id: workspace.id },
      })));
    }

    // Chủ đề mới ở diễn đàn chung: báo cho những người đang theo dõi tác giả (tối đa 200 người / chủ đề)
    if (category) {
      const followers = (await followerIds(req.user.id)).slice(0, 200);
      await Promise.all(followers.map((user_id) => createNotification({
        user_id, type: 'FORUM_FOLLOW', email: false,
        title: 'Thành viên bạn theo dõi vừa mở chủ đề mới',
        message: `${req.user.full_name} đã mở chủ đề "${excerpt(title, 80)}" ở chuyên mục ${category.name}.`,
        link: `/forum/t/${thread.id}`, metadata: { thread_id: thread.id, author_id: req.user.id },
      })));
    }
    touchPresence(req.user.id, workspace ? null : thread.id);

    res.status(201).json({ success: true, data: { id: thread.id }, message: 'Đã đăng chủ đề' });
  } catch (error) { next(error); }
};

// POST /api/forum/threads/:id/posts { content, quote_post_id }
exports.createPost = async (req, res, next) => {
  try {
    const thread = await loadThread(req.params.id);
    const access = await threadAccess(req, thread);
    if (thread.is_locked && !access.canModerate) throw new AppError('Chủ đề đã bị khóa, không thể trả lời', 403);
    const content = validateContent(req.body.content);

    let quoted = null;
    if (req.body.quote_post_id) {
      quoted = isUuid(req.body.quote_post_id) ? await ForumPost.findOne({ where: { id: req.body.quote_post_id, thread_id: thread.id } }) : null;
      if (!quoted) throw new AppError('Bài được trích dẫn không còn tồn tại', 400);
    }
    checkRate(req.user.id);

    const post = await sequelize.transaction(async (t) => {
      const p = await ForumPost.create({ thread_id: thread.id, author_id: req.user.id, content, quote_post_id: quoted?.id || null }, { transaction: t });
      await thread.update({ reply_count: thread.reply_count + 1, last_post_at: p.createdAt, last_post_user_id: req.user.id }, { transaction: t });
      return p;
    });

    // Báo cho chủ đề / người được trích dẫn
    const targets = new Map();
    if (thread.author_id !== req.user.id) targets.set(thread.author_id, `đã trả lời chủ đề "${excerpt(thread.title, 80)}" của bạn`);
    if (quoted && quoted.author_id !== req.user.id) targets.set(quoted.author_id, `đã trích dẫn bài viết của bạn trong chủ đề "${excerpt(thread.title, 80)}"`);
    if (targets.size) { // người đã bỏ qua bạn thì không nhận thông báo từ bạn
      const blocked = await sequelize.query('SELECT user_id FROM forum_ignores WHERE ignored_id = :me AND user_id IN (:ids)',
        { replacements: { me: req.user.id, ids: [...targets.keys()] }, type: sequelize.QueryTypes.SELECT });
      blocked.forEach((b) => targets.delete(b.user_id));
    }
    touchPresence(req.user.id, thread.workspace_id ? null : thread.id);
    await Promise.all([...targets].map(([user_id, text]) => createNotification({
      user_id, type: 'FORUM_REPLY', email: false,
      title: 'Có phản hồi mới trong diễn đàn',
      message: `${req.user.full_name} ${text}.`,
      link: `/forum/t/${thread.id}?post=${post.id}`, metadata: { thread_id: thread.id, post_id: post.id },
    })));

    res.status(201).json({ success: true, data: { id: post.id, thread_id: thread.id }, message: 'Đã đăng bài trả lời' });
  } catch (error) { next(error); }
};

// ── Sửa / xóa / thích ─────────────────────────────────────────────────────────

async function loadPost(id) {
  if (!isUuid(id)) throw new AppError('Không tìm thấy bài viết', 404);
  const post = await ForumPost.findByPk(id);
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);
  const thread = await ForumThread.findByPk(post.thread_id);
  return { post, thread };
}

// PUT /api/forum/posts/:id { content } — chỉ tác giả
exports.updatePost = async (req, res, next) => {
  try {
    const { post, thread } = await loadPost(req.params.id);
    await threadAccess(req, thread);
    if (post.author_id !== req.user.id) throw new AppError('Bạn chỉ sửa được bài viết của chính mình', 403);
    const content = validateContent(req.body.content);
    await post.update({ content, edited_at: new Date() });
    res.json({ success: true, message: 'Đã cập nhật bài viết' });
  } catch (error) { next(error); }
};

const isFirstPost = async (post, thread, transaction) => (await ForumPost.findOne({ where: { thread_id: thread.id }, order: [['createdAt', 'ASC'], ['id', 'ASC']], attributes: ['id'], transaction }))?.id === post.id;

// Xóa một bài (không kiểm tra quyền). Xóa bài gốc = xóa cả chủ đề; xóa bài trả lời thì cập nhật số trả lời và bài mới nhất của chủ đề.
async function removePost(post, thread, transaction) {
  if (await isFirstPost(post, thread, transaction)) {
    await thread.destroy({ transaction });
    return { deleted_thread: true };
  }
  const run = async (t) => {
    await post.destroy({ transaction: t });
    const last = await ForumPost.findOne({ where: { thread_id: thread.id }, order: [['createdAt', 'DESC']], transaction: t });
    await thread.update({ reply_count: Math.max(0, thread.reply_count - 1), last_post_at: last?.createdAt || thread.createdAt, last_post_user_id: last?.author_id || thread.author_id }, { transaction: t });
  };
  if (transaction) await run(transaction); else await sequelize.transaction(run);
  return { deleted_thread: false };
}

// DELETE /api/forum/posts/:id — tác giả hoặc người quản trị. Xóa bài gốc = xóa cả chủ đề
exports.deletePost = async (req, res, next) => {
  try {
    const { post, thread } = await loadPost(req.params.id);
    const access = await threadAccess(req, thread);
    const own = post.author_id === req.user.id;
    if (!own && !access.canModerate) throw new AppError('Bạn không có quyền xóa bài viết này', 403);

    if (!access.canModerate && thread.reply_count > 0 && await isFirstPost(post, thread)) throw new AppError('Chủ đề đã có người trả lời nên chỉ quản trị viên mới xóa được', 403);
    const { deleted_thread } = await removePost(post, thread);
    res.json({ success: true, deleted_thread, message: deleted_thread ? 'Đã xóa chủ đề' : 'Đã xóa bài viết' });
  } catch (error) { next(error); }
};

// POST /api/forum/posts/:id/like | /dislike — bật / tắt "Thích" hoặc "Không thích" (không đánh giá bài của chính mình).
// Mỗi người chỉ có một cảm xúc cho mỗi bài: bấm lại đúng cảm xúc đang chọn thì bỏ; bấm cảm xúc còn lại thì đổi sang cảm xúc đó.
const react = (value) => async (req, res, next) => {
  try {
    const { post, thread } = await loadPost(req.params.id);
    await threadAccess(req, thread);
    if (post.author_id === req.user.id) throw new AppError(value === 1 ? 'Bạn không thể thích bài viết của chính mình' : 'Bạn không thể đánh giá bài viết của chính mình', 400);
    const existing = await ForumPostLike.findOne({ where: { post_id: post.id, user_id: req.user.id } });
    let mine = value;
    if (existing && existing.value === value) { await existing.destroy(); mine = 0; }
    else if (existing) await sequelize.query('UPDATE forum_post_likes SET value = :value, created_at = NOW() WHERE post_id = :post AND user_id = :user', { replacements: { value, post: post.id, user: req.user.id } });
    else await ForumPostLike.create({ post_id: post.id, user_id: req.user.id, value });
    const [counts] = await sequelize.query(
      `SELECT COUNT(*) FILTER (WHERE value = 1) AS likes, COUNT(*) FILTER (WHERE value = -1) AS dislikes FROM forum_post_likes WHERE post_id = :id`,
      { replacements: { id: post.id }, type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, data: { liked: mine === 1, disliked: mine === -1, like_count: Number(counts.likes), dislike_count: Number(counts.dislikes) } });
  } catch (error) { next(error); }
};
exports.toggleLike = react(1);
exports.toggleDislike = react(-1);

// PUT /api/forum/threads/:id { title } — tác giả hoặc người quản trị
exports.updateThread = async (req, res, next) => {
  try {
    const thread = await loadThread(req.params.id);
    const access = await threadAccess(req, thread);
    if (thread.author_id !== req.user.id && !access.canModerate) throw new AppError('Bạn không có quyền sửa tiêu đề', 403);
    await thread.update({ title: validateTitle(req.body.title) });
    res.json({ success: true, message: 'Đã cập nhật tiêu đề' });
  } catch (error) { next(error); }
};

// PUT /api/forum/threads/:id/pin | /lock { value } — người quản trị
const flag = (field, onMsg, offMsg) => async (req, res, next) => {
  try {
    const thread = await loadThread(req.params.id);
    const access = await threadAccess(req, thread);
    if (!access.canModerate) throw new AppError('Chỉ người quản trị mới thực hiện được thao tác này', 403);
    const value = req.body.value === undefined ? !thread[field] : !!req.body.value;
    await thread.update({ [field]: value });
    res.json({ success: true, data: { [field]: value }, message: value ? onMsg : offMsg });
  } catch (error) { next(error); }
};
exports.pinThread = flag('is_pinned', 'Đã ghim chủ đề', 'Đã bỏ ghim chủ đề');
exports.lockThread = flag('is_locked', 'Đã khóa chủ đề', 'Đã mở khóa chủ đề');

// PUT /api/forum/threads/:id/move { category_id } — Admin, chỉ với chủ đề của diễn đàn chung
exports.moveThread = async (req, res, next) => {
  try {
    const thread = await loadThread(req.params.id);
    if (!thread.category_id) throw new AppError('Chủ đề của diễn đàn dự án không chuyển chuyên mục được', 400);
    const cat = isUuid(req.body.category_id) ? await ForumCategory.findByPk(req.body.category_id) : null;
    if (!cat) throw new AppError('Không tìm thấy chuyên mục', 404);
    await thread.update({ category_id: cat.id });
    res.json({ success: true, message: `Đã chuyển chủ đề sang "${cat.name}"` });
  } catch (error) { next(error); }
};

// Dùng chung với các controller xã hội / tin nhắn của diễn đàn
exports.internals = { isUuid, loadPost, loadThread, threadAccess, authorInfo, excerpt, checkRate, shortAuthor, removePost };
