// Nạp dữ liệu mẫu cho Diễn đàn: chủ đề công khai ở 7 chuyên mục + chủ đề riêng trong từng workspace, có trả lời, trích dẫn và lượt thích,
// cùng phần mạng xã hội: lần cuối hoạt động / đang xem chủ đề, theo dõi, bài đã lưu và tin nhắn riêng (chỉ giữa các tài khoản mẫu @demo.devhub.vn).
// Người đăng là các tài khoản mẫu (xem scripts/demo-data/forum.js), thời gian rải đều trong vài tuần gần đây.
// Chạy: npm run db:seed-forum   (chạy lại được nhiều lần: xóa các chủ đề mẫu cũ rồi nạp lại, không đụng tới bài do người dùng đăng)
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize } = require('../src/models');
const { PUBLIC_THREADS, WORKSPACE_TEMPLATES, CONVERSATIONS } = require('./demo-data/forum');

sequelize.options.logging = false;
const DAY = 86400000;

// UUID cố định theo khóa → chạy lại không sinh trùng
const uuidOf = (key) => {
  const h = crypto.createHash('sha1').update(`devhub-forum:${key}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
};
// Bộ sinh số ngẫu nhiên có hạt giống: kết quả giống nhau giữa các lần chạy
function rng(seedKey) {
  let a = crypto.createHash('sha1').update(seedKey).digest().readUInt32LE(0);
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Dựng chuỗi bài (bài gốc + trả lời) với mốc thời gian tăng dần, không vượt quá hiện tại
function buildTimeline(key, startMs, count, nowMs) {
  const rand = rng(`time:${key}`);
  const times = [startMs];
  let t = startMs;
  for (let i = 1; i < count; i++) {
    const gap = i === 1 ? 8 * 60000 + rand() * 5 * 3600000 : 15 * 60000 + rand() * rand() * 20 * 3600000;
    t += gap; times.push(t);
  }
  const limit = nowMs - 2 * 60000;
  const last = times[times.length - 1];
  if (last > limit) { const k = Math.max(0, limit - startMs) / (last - startMs); return times.map((x) => startMs + (x - startMs) * k); }
  return times;
}

// Dòng thời gian cho cuộc trò chuyện: phần lớn trả lời trong vài phút, thỉnh thoảng cách nhau vài giờ; không vượt quá hiện tại
function chatTimeline(key, startMs, count, nowMs) {
  const rand = rng(`chat:${key}`);
  const times = [startMs];
  let t = startMs;
  for (let i = 1; i < count; i++) { t += rand() < 0.7 ? (1 + rand() * 19) * 60000 : (1 + rand() * 9) * 3600000; times.push(t); }
  const limit = nowMs - 90000;
  const last = times[times.length - 1];
  if (last > limit) { const k = Math.max(0, limit - startMs) / (last - startMs); return times.map((x) => startMs + (x - startMs) * k); }
  return times;
}

(async () => {
  const now = Date.now();
  const users = new Map((await sequelize.query(
    `SELECT u.id, split_part(u.email, '@', 1) AS handle FROM users u WHERE u.email NOT LIKE '%student.hcmute.edu.vn'`,
    { type: 'SELECT' }
  )).map((u) => [u.handle, u.id]));
  const allUserIds = [...users.values()];
  const cats = new Map((await sequelize.query('SELECT id, slug FROM forum_categories', { type: 'SELECT' })).map((c) => [c.slug, c.id]));
  if (!cats.size) throw new Error('Chưa có bảng / chuyên mục diễn đàn. Hãy chạy: node migrate_forum.cjs');

  const threads = []; const posts = []; const likes = [];
  const missing = new Set();
  const who = (h) => { const id = users.get(h); if (!id) missing.add(h); return id; };

  function addThread({ key, categoryId = null, workspaceId = null, title, pin = false, lock = false, views, ago, posts: spec, likerPool }) {
    const rand = rng(`thread:${key}`);
    const start = now - ago * DAY - rand() * 6 * 3600000;
    const times = buildTimeline(key, Math.min(start, now - 5 * 60000), spec.length, now);
    const ids = spec.map((_, i) => uuidOf(`${key}:post:${i}`));
    spec.forEach((p, i) => {
      posts.push({
        id: ids[i], thread_id: uuidOf(`${key}:thread`), author_id: p.author, content: p.text,
        quote_post_id: p.quote !== undefined && p.quote !== null && ids[p.quote] && p.quote < i ? ids[p.quote] : null,
        edited_at: null, created_at: new Date(times[i]), updated_at: new Date(times[i]),
      });
      // Lượt thích: bài gốc và các trả lời được quan tâm nhiều hơn khi chủ đề nhiều lượt xem
      const lr = rng(`like:${key}:${i}`);
      const cap = Math.min(i === 0 ? 24 : 12, Math.floor(views / (i === 0 ? 28 : 55)));
      const raw = i === 0 ? cap * (0.25 + 0.75 * lr()) : cap * lr() * lr(); // bài gốc thường được thích nhiều hơn các trả lời
      const n = Math.min(Math.floor(raw), (likerPool || allUserIds).length - 1);
      const pool = (likerPool || allUserIds).filter((u) => u !== p.author);
      const chosen = new Set();
      while (chosen.size < n) chosen.add(pool[Math.floor(lr() * pool.length)]);
      for (const u of chosen) likes.push({ post_id: ids[i], user_id: u, value: 1, created_at: new Date(Math.min(now - 60000, times[i] + 20 * 60000 + lr() * 2 * DAY)) });
      // Một số ít bài nhận "Không thích" (chủ yếu là các trả lời gây tranh luận), từ người chưa thích bài đó
      const dr = rng(`dislike:${key}:${i}`);
      if (dr() < (i === 0 ? 0.04 : 0.12)) {
        const dpool = pool.filter((u) => !chosen.has(u));
        const dn = Math.min(dpool.length, 1 + Math.floor(dr() * dr() * 4));
        const dchosen = new Set();
        while (dchosen.size < dn) dchosen.add(dpool[Math.floor(dr() * dpool.length)]);
        for (const u of dchosen) likes.push({ post_id: ids[i], user_id: u, value: -1, created_at: new Date(Math.min(now - 60000, times[i] + 30 * 60000 + dr() * 2 * DAY)) });
      }
    });
    const lastIdx = spec.length - 1;
    threads.push({
      id: uuidOf(`${key}:thread`), category_id: categoryId, workspace_id: workspaceId, author_id: spec[0].author, title,
      is_pinned: pin, is_locked: lock, view_count: views, reply_count: spec.length - 1,
      last_post_at: new Date(times[lastIdx]), last_post_user_id: spec[lastIdx].author,
      created_at: new Date(times[0]), updated_at: new Date(times[lastIdx]),
    });
  }

  // 1) Diễn đàn chung
  for (const t of PUBLIC_THREADS) {
    const catId = cats.get(t.c);
    if (!catId) { missing.add(`chuyên mục:${t.c}`); continue; }
    const spec = [{ author: who(t.by), text: t.body }, ...t.r.map(([by, text, q]) => ({ author: who(by), text, quote: q }))];
    if (spec.some((p) => !p.author)) continue;
    addThread({ key: `public:${t.c}:${t.title}`, categoryId: catId, title: t.title, pin: !!t.pin, lock: !!t.lock, views: t.views || 100, ago: t.ago, posts: spec });
  }

  // 2) Diễn đàn riêng của từng workspace (thành viên + Lead + Admin)
  const workspaces = await sequelize.query(
    `SELECT w.id, w.name, COALESCE(p.name, w.name) AS project_name FROM workspaces w LEFT JOIN projects p ON p.id = w.project_id ORDER BY w.created_at`,
    { type: 'SELECT' }
  );
  const adminId = users.get('admin');
  for (const ws of workspaces) {
    const members = await sequelize.query(
      `SELECT cp.user_id, wm.role FROM workspace_members wm JOIN candidate_profiles cp ON cp.id = wm.candidate_profile_id
        WHERE wm.workspace_id = :w AND wm.status IN ('ACTIVE', 'COMPLETED') ORDER BY (wm.role = 'LEAD') DESC, wm.joined_at`,
      { replacements: { w: ws.id }, type: 'SELECT' }
    );
    if (!members.length || !adminId) continue;
    const lead = members.find((m) => m.role === 'LEAD')?.user_id || members[0].user_id;
    const slot = { m0: members[0].user_id, m1: (members[1] || members[0]).user_id, m2: (members[2] || members[1] || members[0]).user_id, lead, admin: adminId };
    const templates = members.length >= 2 ? WORKSPACE_TEMPLATES : WORKSPACE_TEMPLATES.filter((t) => ['lead', 'admin'].includes(t.by));
    const pool = [...new Set([...members.map((m) => m.user_id), adminId])];
    templates.forEach((t, i) => {
      const rand = rng(`wsviews:${ws.id}:${i}`);
      const fill = (s) => s.replaceAll('{p}', `"${ws.project_name}"`);
      const spec = [{ author: slot[t.by], text: fill(t.body) }, ...t.r.map(([by, text, q]) => ({ author: slot[by], text: fill(text), quote: q }))];
      addThread({ key: `ws:${ws.id}:${i}`, workspaceId: ws.id, title: t.title, pin: !!t.pin, views: 4 + Math.floor(rand() * 26), ago: t.ago, posts: spec, likerPool: pool });
    });
  }

  // 3) Mạng xã hội: chỉ giữa các tài khoản mẫu (@demo.devhub.vn), không đụng tới tài khoản thật của bạn
  const demoHandles = new Set((await sequelize.query(`SELECT split_part(email, '@', 1) AS h FROM users WHERE email LIKE '%@demo.devhub.vn'`, { type: 'SELECT' })).map((r) => r.h));
  const demoId = (h) => (demoHandles.has(h) ? users.get(h) : null);
  const demoUserIds = [...demoHandles].map(demoId).filter(Boolean);
  const publicThreads = threads.filter((t) => t.category_id);
  const threadById = new Map(threads.map((t) => [t.id, t]));
  const opOf = new Map(); const postCount = new Map(); const threadsOf = new Map();
  for (const p of posts) {
    if (!opOf.has(p.thread_id)) opOf.set(p.thread_id, p.id); // bài đầu của mỗi chủ đề được thêm trước
    postCount.set(p.author_id, (postCount.get(p.author_id) || 0) + 1);
    if (threadById.get(p.thread_id)?.category_id) { if (!threadsOf.has(p.author_id)) threadsOf.set(p.author_id, []); threadsOf.get(p.author_id).push(p.thread_id); }
  }

  // Lần cuối hoạt động: một số ít đang trực tuyến (trong 5 phút, kèm chủ đề đang xem), còn lại rải từ vài phút tới vài ngày trước
  const activity = demoUserIds.map((uid) => {
    const rand = rng(`presence:${uid}`);
    const roll = rand();
    const minutes = roll < 0.12 ? 0.5 + rand() * 4 : roll < 0.4 ? 5 + rand() * 175 : roll < 0.75 ? 180 + rand() * 1260 : 1440 + rand() * 7200;
    const own = threadsOf.get(uid) || [];
    const watching = roll < 0.12 ? publicThreads[Math.floor(rand() * publicThreads.length)].id : (own.length ? own[Math.floor(rand() * own.length)] : null);
    return { user_id: uid, last_seen_at: new Date(now - minutes * 60000), thread_id: watching };
  });

  // Theo dõi: mỗi người theo dõi 1–5 thành viên, ưu tiên người đăng nhiều bài
  const follows = [];
  const weights = demoUserIds.map((id) => ({ id, w: 1 + (postCount.get(id) || 0) }));
  for (const uid of demoUserIds) {
    const rand = rng(`follow:${uid}`);
    const want = 1 + Math.floor(rand() * 5);
    const pool = weights.filter((a) => a.id !== uid);
    const chosen = new Set();
    for (let guard = 0; chosen.size < Math.min(want, pool.length) && guard < 60; guard++) {
      let x = rand() * pool.reduce((sum, a) => sum + a.w, 0);
      for (const a of pool) { x -= a.w; if (x <= 0) { chosen.add(a.id); break; } }
    }
    for (const f of chosen) follows.push({ follower_id: uid, followee_id: f, created_at: new Date(now - (1 + rand() * 40) * DAY) });
  }

  // Bài đã lưu: mỗi người lưu 0–3 chủ đề công khai của người khác
  const bookmarks = []; const seenBookmark = new Set();
  for (const uid of demoUserIds) {
    const rand = rng(`bookmark:${uid}`);
    const n = Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      const t = publicThreads[Math.floor(rand() * publicThreads.length)];
      const postId = opOf.get(t.id);
      const key = `${uid}:${postId}`;
      if (t.author_id === uid || !postId || seenBookmark.has(key)) continue;
      seenBookmark.add(key);
      bookmarks.push({ user_id: uid, post_id: postId, created_at: new Date(Math.min(now - 60000, t.created_at.getTime() + 3600000 + rand() * 10 * DAY)) });
    }
  }

  // Tin nhắn riêng: một số tin cuối còn chưa đọc để thấy số tin mới
  const messages = [];
  CONVERSATIONS.forEach((c, ci) => {
    const a = demoId(c.a); const b = demoId(c.b);
    if (!a || !b) { missing.add(`hội thoại:${c.a}-${c.b}`); return; }
    const rand = rng(`conv:${ci}`);
    const times = chatTimeline(`conv:${ci}`, Math.min(now - c.ago * DAY - rand() * 5 * 3600000, now - 10 * 60000), c.msgs.length, now);
    c.msgs.forEach(([who, text], i) => {
      const unread = i >= c.msgs.length - (c.unread || 0);
      messages.push({
        id: uuidOf(`conv:${ci}:msg:${i}`), sender_id: who === 'a' ? a : b, recipient_id: who === 'a' ? b : a, content: text,
        read_at: unread ? null : new Date(Math.min(now - 30000, times[i] + (2 + rand() * 40) * 60000)), created_at: new Date(times[i]),
      });
    });
  });

  if (missing.size) console.warn('⚠ Bỏ qua do thiếu dữ liệu:', [...missing].join(', '));

  // 4) Ghi vào cơ sở dữ liệu (xóa bản mẫu cũ rồi nạp lại)
  const qi = sequelize.getQueryInterface();
  await sequelize.transaction(async (transaction) => {
    const ids = threads.map((t) => t.id);
    // Bài đã lưu / báo cáo của tài khoản thật trên các bài mẫu: giữ lại qua lần nạp lại (xóa chủ đề sẽ xóa theo)
    const demoSet = new Set(demoUserIds);
    const onSeeded = 'post_id IN (SELECT p.id FROM forum_posts p WHERE p.thread_id IN (:ids))';
    const keepBookmarks = (await sequelize.query(`SELECT * FROM forum_bookmarks WHERE ${onSeeded}`, { replacements: { ids }, type: 'SELECT', transaction })).filter((r) => !demoSet.has(r.user_id));
    const keepReports = (await sequelize.query(`SELECT * FROM forum_reports WHERE ${onSeeded}`, { replacements: { ids }, type: 'SELECT', transaction })).filter((r) => !demoSet.has(r.reporter_id));
    await sequelize.query('DELETE FROM forum_threads WHERE id IN (:ids)', { replacements: { ids }, transaction });
    // bulkInsert qua transaction: dùng chung kết nối
    const ins = async (table, rows) => { for (let i = 0; i < rows.length; i += 200) await qi.bulkInsert(table, rows.slice(i, i + 200), { transaction }); };
    await ins('forum_threads', threads);
    await ins('forum_posts', posts);
    await ins('forum_post_likes', likes);
    // Phần mạng xã hội: xóa chủ đề mẫu cũ đã tự xóa luôn bài đã lưu gắn với chúng; tin nhắn mẫu xóa theo mã rồi nạp lại
    const postIdSet = new Set(posts.map((p) => p.id));
    await ins('forum_bookmarks', [...bookmarks, ...keepBookmarks.filter((r) => postIdSet.has(r.post_id))]);
    await ins('forum_reports', keepReports.filter((r) => postIdSet.has(r.post_id)));
    await sequelize.query('DELETE FROM forum_messages WHERE id IN (:ids)', { replacements: { ids: messages.map((m) => m.id).concat(['00000000-0000-0000-0000-000000000000']) }, transaction });
    await ins('forum_messages', messages);
    for (const a of activity) {
      await sequelize.query(
        `INSERT INTO forum_member_activity (user_id, last_seen_at, thread_id) VALUES (:user_id, :last_seen_at, :thread_id)
         ON CONFLICT (user_id) DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at, thread_id = EXCLUDED.thread_id`,
        { replacements: a, transaction }
      );
    }
    for (const f of follows) {
      await sequelize.query('INSERT INTO forum_follows (follower_id, followee_id, created_at) VALUES (:follower_id, :followee_id, :created_at) ON CONFLICT DO NOTHING', { replacements: f, transaction });
    }
  });

  const pub = threads.filter((t) => t.category_id).length;
  console.log(`✅ Đã nạp diễn đàn mẫu: ${pub} chủ đề công khai + ${threads.length - pub} chủ đề trong workspace, ${posts.length} bài viết, ${likes.filter((l) => l.value === 1).length} lượt thích, ${likes.filter((l) => l.value === -1).length} lượt không thích\n   Mạng xã hội: ${activity.length} thành viên có lần cuối hoạt động, ${follows.length} lượt theo dõi, ${bookmarks.length} bài đã lưu, ${messages.length} tin nhắn riêng (${CONVERSATIONS.length} cuộc trò chuyện)`);
  await sequelize.close();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
