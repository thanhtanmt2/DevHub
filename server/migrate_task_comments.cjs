// Cho phép Admin bình luận trong task:
// - workspace_member_id được để trống (Admin không phải thành viên Workspace)
// - thêm user_id để biết tài khoản nào viết bình luận (và điền cho các bình luận cũ)
// Chạy: node migrate_task_comments.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.query(`ALTER TABLE task_comments ALTER COLUMN workspace_member_id DROP NOT NULL;`);
    await sequelize.query(`ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;`);
    await sequelize.query(`
      UPDATE task_comments c
      SET user_id = cp.user_id
      FROM workspace_members wm
      JOIN candidate_profiles cp ON cp.id = wm.candidate_profile_id
      WHERE c.workspace_member_id = wm.id AND c.user_id IS NULL;
    `);
    console.log('✅ task_comments sẵn sàng: Admin có thể bình luận');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
