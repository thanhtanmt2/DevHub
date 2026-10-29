const { sequelize, CandidateSkill } = require('../models');

// Minh chứng kỹ năng: các project job ứng viên đã hoàn thành (phần việc COMPLETED hoặc dự án COMPLETED)
// mà project job đó yêu cầu kỹ năng này (kèm trạng thái + đánh giá). Trả về Map<profileId, Map<skillId, [{project_id, project_name, position}]>>
async function getEvidenceForProfiles(profileIds) {
  const result = new Map();
  if (!profileIds?.length) return result;
  const rows = await sequelize.query(
    `SELECT DISTINCT wm.candidate_profile_id AS profile_id, pjs.skill_id,
            p.id AS project_id, p.name AS project_name, pj.title AS position,
            p.status AS project_status, wm.status AS member_status,
            ce.score AS score, ce.comment AS comment
       FROM workspace_members wm
       JOIN workspaces w ON w.id = wm.workspace_id
       JOIN projects p ON p.id = w.project_id
       JOIN project_jobs pj ON pj.id = wm.project_job_id
       JOIN project_job_skills pjs ON pjs.project_job_id = pj.id
  LEFT JOIN candidate_evaluations ce ON ce.workspace_member_id = wm.id
      WHERE wm.candidate_profile_id IN (:ids)
        AND wm.status <> 'REMOVED'
        AND (wm.status = 'COMPLETED' OR p.status = 'COMPLETED')`,
    { replacements: { ids: profileIds }, type: sequelize.QueryTypes.SELECT }
  );
  for (const r of rows) {
    if (!result.has(r.profile_id)) result.set(r.profile_id, new Map());
    const bySkill = result.get(r.profile_id);
    if (!bySkill.has(r.skill_id)) bySkill.set(r.skill_id, []);
    bySkill.get(r.skill_id).push({
      project_id: r.project_id, project_name: r.project_name, position: r.position,
      project_status: r.project_status, member_status: r.member_status,
      score: r.score !== null ? Number(r.score) : null, comment: r.comment || null,
    });
  }
  return result;
}

// Tự thêm kỹ năng từ dự án đã hoàn thành vào hồ sơ (source = PROJECT).
async function syncProjectSkills(profileId) {
  const evidence = (await getEvidenceForProfiles([profileId])).get(profileId);
  if (!evidence || evidence.size === 0) return;
  const existing = await CandidateSkill.findAll({ where: { candidate_profile_id: profileId } });
  const byId = new Map(existing.map((cs) => [cs.skill_id, cs]));

  for (const skillId of evidence.keys()) {
    if (!byId.has(skillId)) {
      await CandidateSkill.create({ candidate_profile_id: profileId, skill_id: skillId, source: 'PROJECT' });
    }
  }
}

module.exports = { getEvidenceForProfiles, syncProjectSkills };
