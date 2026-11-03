// Schema + dữ liệu mặc định của Diễn đàn (chủ đề, bài viết, thích, theo dõi, bỏ qua, lưu bài, báo cáo, tin nhắn). Dùng chung cho migrate_forum.cjs (cập nhật DB đang chạy) và scripts/import-db.js
// (bù schema khi nhập file dump cũ). Mọi câu lệnh đều chạy lại được nhiều lần (IF NOT EXISTS / ON CONFLICT).
//  - forum_categories: chuyên mục (box) của diễn đàn chung. admin_only = chỉ Admin được mở chủ đề (vd. Thông báo).
//  - forum_threads: chủ đề. Thuộc một chuyên mục (diễn đàn chung) HOẶC một workspace (diễn đàn riêng của dự án), không cả hai.
//  - forum_posts: các bài trong chủ đề; bài đầu tiên là bài gốc. quote_post_id = trả lời có trích dẫn.
//  - forum_post_likes: cảm xúc của từng người cho từng bài (mỗi người một cảm xúc): value = 1 là Thích, value = -1 là Không thích.
module.exports = [
  `CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon VARCHAR(30) NOT NULL DEFAULT 'chat',
    sort_order INTEGER NOT NULL DEFAULT 0,
    admin_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY,
    category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    last_post_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_post_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_forum_threads_one_scope CHECK ((category_id IS NOT NULL)::int + (workspace_id IS NOT NULL)::int = 1)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads (category_id, is_pinned DESC, last_post_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_forum_threads_workspace ON forum_threads (workspace_id, is_pinned DESC, last_post_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads (author_id)`,
  `CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    quote_post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts (thread_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts (author_id)`,
  `CREATE TABLE IF NOT EXISTS forum_post_likes (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value SMALLINT NOT NULL DEFAULT 1 CHECK (value IN (1, -1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  )`,
  // Bảng tạo từ bản cũ (chỉ có "Thích") được bổ sung cột value; các dòng cũ mặc định là Thích
  `ALTER TABLE forum_post_likes ADD COLUMN IF NOT EXISTS value SMALLINT NOT NULL DEFAULT 1 CHECK (value IN (1, -1))`,
  // Mạng xã hội trong diễn đàn
  //  - forum_member_activity: lần cuối thành viên hoạt động ở diễn đàn + chủ đề đang xem (hiện trong khung thông tin thành viên)
  //  - forum_follows: theo dõi thành viên (báo khi họ mở chủ đề mới); forum_ignores: bỏ qua thành viên (ẩn bài, chặn nhắn tin)
  //  - forum_bookmarks: lưu bài viết; forum_reports: báo cáo bài viết vi phạm gửi quản trị viên
  //  - forum_messages: tin nhắn riêng giữa hai thành viên
  `CREATE TABLE IF NOT EXISTS forum_member_activity (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    thread_id UUID REFERENCES forum_threads(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS forum_follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id),
    CONSTRAINT chk_forum_follows_self CHECK (follower_id <> followee_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_forum_follows_followee ON forum_follows (followee_id)`,
  `CREATE TABLE IF NOT EXISTS forum_ignores (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ignored_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, ignored_id),
    CONSTRAINT chk_forum_ignores_self CHECK (user_id <> ignored_id)
  )`,
  `CREATE TABLE IF NOT EXISTS forum_bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
  )`,
  `CREATE TABLE IF NOT EXISTS forum_reports (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(20) NOT NULL,
    note VARCHAR(500),
    status VARCHAR(10) NOT NULL DEFAULT 'OPEN',
    handled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    handled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_forum_reports_post_reporter UNIQUE (post_id, reporter_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports (status, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS forum_messages (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_forum_messages_self CHECK (sender_id <> recipient_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_forum_messages_sender ON forum_messages (sender_id, recipient_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_forum_messages_recipient ON forum_messages (recipient_id, sender_id, created_at DESC)`,
  // Chuyên mục mặc định
  `INSERT INTO forum_categories (id, name, slug, description, icon, sort_order, admin_only) VALUES
    ('0c1d0a10-0000-4000-8000-000000000001', 'Thông báo & Nội quy', 'thong-bao', 'Tin tức, cập nhật tính năng và nội quy của DevHub', 'bell', 1, TRUE),
    ('0c1d0a10-0000-4000-8000-000000000002', 'Tìm việc & Tuyển dụng', 'tim-viec', 'Chia sẻ cơ hội việc làm, kinh nghiệm phỏng vấn, review công ty', 'briefcase', 2, FALSE),
    ('0c1d0a10-0000-4000-8000-000000000003', 'Hỏi đáp kỹ thuật', 'hoi-dap', 'Đặt câu hỏi, nhờ debug và trao đổi về lập trình, kiểm thử, DevOps...', 'code', 3, FALSE),
    ('0c1d0a10-0000-4000-8000-000000000004', 'Dự án & Cộng tác', 'du-an', 'Tìm đồng đội, chia sẻ kinh nghiệm làm dự án thời vụ trên DevHub', 'workspace', 4, FALSE),
    ('0c1d0a10-0000-4000-8000-000000000005', 'Góc nghề nghiệp & CV', 'nghe-nghiep', 'Định hướng nghề IT, viết CV, lộ trình học và phát triển bản thân', 'document', 5, FALSE),
    ('0c1d0a10-0000-4000-8000-000000000006', 'Chia sẻ & Học tập', 'chia-se', 'Tài liệu, khóa học, bài viết hay và công cụ hữu ích', 'lightbulb', 6, FALSE),
    ('0c1d0a10-0000-4000-8000-000000000007', 'Trò chuyện & Giải trí', 'tro-chuyen', 'Nơi thư giãn, làm quen và tán gẫu ngoài lề công việc', 'chat', 7, FALSE)
   ON CONFLICT (slug) DO NOTHING`,
];
