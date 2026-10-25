// Bỏ mức độ kỹ năng của ứng viên: xóa cột level (và kiểu enum) khỏi candidate_skills.
// Chạy: node migrate_remove_skill_level.cjs   (an toàn khi chạy lại nhiều lần)
require('dotenv').config();
const { sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.query(`ALTER TABLE candidate_skills DROP COLUMN IF EXISTS level`);
    await sequelize.query(`DROP TYPE IF EXISTS enum_candidate_skills_level`);
    console.log('✅ candidate_skills: đã xóa cột level');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
