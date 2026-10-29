// Sơ đồ kinh nghiệm: mở rộng bảng experiences (loại mục, dự án con trong công ty, việc đã làm, công nghệ, link).
// Chạy: node migrate_experience_timeline.cjs   (an toàn khi chạy lại nhiều lần, dữ liệu cũ tự thành loại COMPANY)
require('dotenv').config();
const { sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.query(`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'COMPANY'`);
    await sequelize.query(`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES experiences(id) ON DELETE CASCADE`);
    await sequelize.query(`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS tasks JSONB NOT NULL DEFAULT '[]'::jsonb`);
    await sequelize.query(`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS technologies JSONB NOT NULL DEFAULT '[]'::jsonb`);
    await sequelize.query(`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS link_url VARCHAR(500)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_experiences_parent ON experiences(parent_id)`);
    console.log('✅ experiences: đã thêm type, parent_id, tasks, technologies, link_url');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
