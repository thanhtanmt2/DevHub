const { sequelize } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// Danh hiệu của ứng viên: xếp hạng theo ĐIỂM TÍCH LŨY từ các dự án DevHub, xét cả số dự án lẫn điểm đánh giá.
//  - Mỗi dự án đã hoàn thành và được đánh giá từ QUALIFY_SCORE trở lên (thang 10) cộng đúng số điểm được chấm vào điểm tích lũy.
//    Vì vậy làm nhiều dự án thì điểm tăng, làm tốt thì điểm tăng nhanh hơn; dự án chưa đánh giá hoặc dưới ngưỡng chưa được cộng.
//  - "Hoàn thành" = dự án COMPLETED, hoặc phần việc của ứng viên được ghi nhận COMPLETED.
//  - Kèm số dự án tham gia, số dự án hoàn thành, điểm trung bình và xếp loại (Đạt / Khá / Giỏi / Xuất sắc).
// Tính trực tiếp từ dữ liệu workspace / đánh giá có sẵn, không lưu thêm bảng.
// ─────────────────────────────────────────────────────────────────────────────

const QUALIFY_SCORE = 5; // điểm đánh giá tối thiểu (thang 10) để dự án được cộng điểm

// min = điểm tích lũy tối thiểu (xấp xỉ: 1 dự án đạt / 3 / 5 / 10 dự án điểm khoảng 8)
const TIERS = [
  { key: 'newbie', name: 'Tân binh', min: 0, desc: 'Chưa có dự án nào được tính điểm' },
  { key: 'bronze', name: 'Đồng hành', min: 5, desc: 'Hoàn thành dự án đầu tiên' },
  { key: 'silver', name: 'Cộng sự', min: 24, desc: 'Khoảng 3 dự án điểm tốt' },
  { key: 'gold', name: 'Chuyên gia', min: 40, desc: 'Khoảng 5 dự án điểm tốt' },
  { key: 'diamond', name: 'Bậc thầy', min: 80, desc: 'Khoảng 10 dự án điểm tốt' },
];

// Xếp loại theo điểm trung bình các dự án được tính
const gradeOf = (avg) => {
  if (avg === null || avg === undefined) return null;
  if (avg >= 9) return 'Xuất sắc';
  if (avg >= 8) return 'Giỏi';
  if (avg >= 6.5) return 'Khá';
  return 'Đạt';
};

const COMPLETED = `(p.status = 'COMPLETED' OR wm.status = 'COMPLETED')`;

// Tính cho nhiều hồ sơ một lúc (dùng cho danh sách tìm ứng viên): Map(profileId → rank)
async function computeRanks(profileIds) {
  const result = new Map();
  if (!profileIds.length) return result;

  const rows = await sequelize.query(
    `SELECT wm.candidate_profile_id AS pid,
            COUNT(*) AS joined,
            COUNT(*) FILTER (WHERE ${COMPLETED}) AS completed,
            COUNT(*) FILTER (WHERE ${COMPLETED} AND ce.score >= :q) AS counted,
            COALESCE(SUM(ce.score) FILTER (WHERE ${COMPLETED} AND ce.score >= :q), 0) AS points,
            COUNT(*) FILTER (WHERE ${COMPLETED} AND ce.id IS NULL) AS pending,
            COUNT(*) FILTER (WHERE ${COMPLETED} AND ce.score < :q) AS not_passed,
            AVG(ce.score) FILTER (WHERE ${COMPLETED} AND ce.score >= :q) AS avg_score
       FROM workspace_members wm
       JOIN workspaces w ON w.id = wm.workspace_id
       JOIN projects p ON p.id = w.project_id
       LEFT JOIN candidate_evaluations ce ON ce.workspace_member_id = wm.id
      WHERE wm.candidate_profile_id IN (:ids) AND wm.status <> 'REMOVED'
      GROUP BY wm.candidate_profile_id`,
    { replacements: { ids: profileIds, q: QUALIFY_SCORE }, type: sequelize.QueryTypes.SELECT }
  );
  const by = new Map(rows.map((r) => [r.pid, r]));

  for (const pid of profileIds) {
    const r = by.get(pid);
    const counted = Number(r?.counted || 0);
    const points = Math.round(parseFloat(r?.points || 0) * 10) / 10;
    const avg = r?.avg_score !== null && r?.avg_score !== undefined ? Math.round(parseFloat(r.avg_score) * 10) / 10 : null;

    let idx = 0;
    TIERS.forEach((tier, i) => { if (points >= tier.min) idx = i; });
    const tier = TIERS[idx];
    const next = TIERS[idx + 1] || null;

    result.set(pid, {
      tier: { key: tier.key, name: tier.name, level: idx, desc: tier.desc },
      points, // điểm tích lũy
      joined_projects: Number(r?.joined || 0), // số dự án đã tham gia (kể cả đang làm)
      completed_projects: Number(r?.completed || 0), // số dự án đã hoàn thành
      counted_projects: counted, // số dự án được cộng điểm (hoàn thành + đánh giá đạt)
      pending_review: Number(r?.pending || 0), // đã hoàn thành nhưng chưa được đánh giá
      not_passed: Number(r?.not_passed || 0), // đã đánh giá nhưng dưới ngưỡng
      avg_score: avg,
      grade: gradeOf(avg),
      qualify_score: QUALIFY_SCORE,
      next: next ? { key: next.key, name: next.name, need: Math.round((next.min - points) * 10) / 10, target: next.min } : null,
      progress: next ? Math.max(0, Math.min(100, Math.round(((points - tier.min) / (next.min - tier.min)) * 100))) : 100,
    });
  }
  return result;
}

// Hạng + danh sách từng dự án (điểm, có được tính không) cho chính ứng viên xem
async function computeRank(profileId) {
  const rank = (await computeRanks([profileId])).get(profileId);
  const rows = await sequelize.query(
    `SELECT p.name AS project_name, pj.title AS position, p.status AS project_status, wm.status AS member_status,
            ${COMPLETED} AS completed, ce.score AS score, wm.joined_at
       FROM workspace_members wm
       JOIN workspaces w ON w.id = wm.workspace_id
       JOIN projects p ON p.id = w.project_id
       LEFT JOIN project_jobs pj ON pj.id = wm.project_job_id
       LEFT JOIN candidate_evaluations ce ON ce.workspace_member_id = wm.id
      WHERE wm.candidate_profile_id = :pid AND wm.status <> 'REMOVED'
      ORDER BY wm.joined_at DESC`,
    { replacements: { pid: profileId }, type: sequelize.QueryTypes.SELECT }
  );
  rank.projects = rows.map((r) => {
    const score = r.score !== null && r.score !== undefined ? parseFloat(r.score) : null;
    const status = !r.completed ? 'IN_PROGRESS' : score === null ? 'PENDING' : score >= QUALIFY_SCORE ? 'COUNTED' : 'NOT_PASSED';
    return { project_name: r.project_name, position: r.position, score, status };
  });
  return rank;
}

module.exports = { TIERS, QUALIFY_SCORE, computeRank, computeRanks };
