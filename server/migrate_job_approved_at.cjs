// Mở lại tin tuyển dụng không được bỏ qua bước Admin duyệt: thêm job_posts.approved_at (lần đầu tin được duyệt).
// Tin đang OPEN / CLOSED sẵn có được coi là đã duyệt (approved_at = ngày đăng); tin chờ duyệt, bản nháp, bị từ chối để NULL.
// Chạy: node migrate_job_approved_at.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query(`DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_posts' AND column_name = 'approved_at') THEN
    ALTER TABLE job_posts ADD COLUMN approved_at TIMESTAMPTZ;
    UPDATE job_posts SET approved_at = COALESCE(posted_at, created_at) WHERE status IN ('OPEN', 'CLOSED');
  END IF;
END $$`);
    console.log('✅ job_posts.approved_at sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
