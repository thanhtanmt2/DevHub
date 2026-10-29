// Ràng buộc chống trùng ở mức cơ sở dữ liệu (trước đây chỉ kiểm tra trong code nên bấm đúp nhanh vẫn tạo được bản ghi trùng):
//   - 1 ứng viên chỉ ứng tuyển 1 lần vào cùng 1 tin tuyển dụng (applications)
//   - 1 ứng viên chỉ ứng tuyển 1 lần vào cùng 1 vị trí dự án (project_applications)
//   - 1 ứng viên chỉ có 1 bản ghi thành viên trong cùng 1 Workspace (workspace_members; thêm lại thì kích hoạt lại bản ghi cũ)
// Nếu dữ liệu hiện có đã bị trùng thì dừng và in ra các dòng trùng để xử lý tay trước.
// Chạy: node migrate_unique_constraints.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

const CONSTRAINTS = [
  { table: 'applications', name: 'uq_applications_candidate_job', cols: ['candidate_profile_id', 'job_post_id'] },
  { table: 'project_applications', name: 'uq_project_applications_candidate_job', cols: ['candidate_profile_id', 'project_job_id'] },
  { table: 'workspace_members', name: 'uq_workspace_members_workspace_candidate', cols: ['workspace_id', 'candidate_profile_id'] },
];

(async () => {
  try {
    for (const { table, name, cols } of CONSTRAINTS) {
      const list = cols.join(', ');
      const dups = await sequelize.query(
        `SELECT ${list}, COUNT(*)::int AS so_luong FROM ${table} GROUP BY ${list} HAVING COUNT(*) > 1`,
        { type: 'SELECT' }
      );
      if (dups.length) {
        console.error(`❌ ${table} đang có dữ liệu trùng (${list}), hãy xử lý trước rồi chạy lại:`);
        console.error(JSON.stringify(dups, null, 2));
        process.exit(1);
      }
      await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${name} ON ${table} (${list})`);
      console.log(`✅ ${name}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
