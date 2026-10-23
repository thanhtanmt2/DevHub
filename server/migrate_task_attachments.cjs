// Tệp / liên kết đính kèm cho task (mục "Tệp đính kèm" trong cửa sổ chi tiết task).
// Chạy: node migrate_task_attachments.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS task_attachments (
        id UUID PRIMARY KEY,
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        kind VARCHAR(10) NOT NULL DEFAULT 'FILE',
        name VARCHAR(255) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        size INTEGER,
        uploaded_by_user_id UUID,
        uploaded_by_name VARCHAR(150),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON task_attachments(task_id)`);
    console.log('✅ Bảng task_attachments sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
