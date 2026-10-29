// Kỹ năng ứng viên: thêm cột source (MANUAL | CV | PROJECT) và xóa cột years_of_experience.
// Chạy: node migrate_skill_source.cjs   (an toàn khi chạy lại nhiều lần)
require('dotenv').config();
const { sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.query(`ALTER TABLE candidate_skills ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'MANUAL'`);
    await sequelize.query(`ALTER TABLE candidate_skills DROP COLUMN IF EXISTS years_of_experience`);
    console.log('✅ candidate_skills: đã thêm source, đã xóa years_of_experience');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
