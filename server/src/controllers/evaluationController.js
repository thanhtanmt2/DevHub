const { Op } = require('sequelize');
const { sequelize, CandidateEvaluation, CandidateProfile, WorkspaceMember, Workspace, Project, ProjectJob, User } = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');

// Chấm điểm năng lực: chỉ sau khi dự án đã đóng (nghiệm thu hoàn thành), mỗi thành viên một đánh giá cho mỗi dự án.
// Admin chấm cho cả dự án một lần ngay sau khi đóng dự án (xem getProjectEvaluations / saveProjectEvaluations),
// hoặc quay lại chấm / sửa sau từ thẻ dự án.

const EVALUABLE_MEMBER_STATUSES = ['ACTIVE', 'COMPLETED']; // thành viên đã rời dự án (REMOVED) thì không chấm
const NOT_CLOSED_MESSAGE = 'Chỉ chấm điểm được sau khi dự án đã đóng (nghiệm thu hoàn thành). Hãy đóng dự án trước.';

const cleanComment = (c) => {
  if (c === undefined || c === null) return null;
  const t = String(c).trim();
  return t || null;
};

// Ghi nhận (tạo hoặc cập nhật) đánh giá của một thành viên rồi tính lại điểm năng lực trung bình của ứng viên.
// `member` phải nạp sẵn CandidateProfile → User; `projectName` dùng cho nhật ký và thông báo.
async function saveEvaluation(req, member, { score, comment, workspaceId, projectName }) {
  let evaluation = await CandidateEvaluation.findOne({ where: { workspace_member_id: member.id } });
  if (evaluation) {
    await evaluation.update({ score, comment, evaluated_at: new Date() });
  } else {
    evaluation = await CandidateEvaluation.create({ workspace_member_id: member.id, score, comment, evaluated_at: new Date() });
  }

  const u = member.CandidateProfile?.User;
  if (u) {
    await logActivity(req, {
      action: 'MEMBER_EVALUATED',
      entity_type: 'evaluation',
      entity_id: evaluation.id,
      entity_name: `Đánh giá ${u.full_name}`,
      new_value: String(score),
      description: `Đã chấm ${score}/10 điểm năng lực cho ${u.full_name}${projectName ? ` trong dự án "${projectName}"` : ''}`,
      metadata: { workspace_id: workspaceId, user_id: u.id },
      notify_user_ids: [u.id],
      notify_message: `Bạn được chấm ${score}/10 điểm năng lực${projectName ? ` cho dự án "${projectName}"` : ''}.${comment ? ` Nhận xét: ${comment}` : ''}`,
      notify_link: `/candidate/workspaces/${workspaceId}`,
    });
  }

  // score là DECIMAL nên driver trả về chuỗi ("9.00"): phải ép sang số, nếu không phép + nối chuỗi và điểm trung bình thành NaN
  const memberIds = (await WorkspaceMember.findAll({ where: { candidate_profile_id: member.candidate_profile_id }, attributes: ['id'] })).map((m) => m.id);
  const allEvaluations = await CandidateEvaluation.findAll({ where: { workspace_member_id: memberIds } });
  const totalScore = allEvaluations.reduce((sum, ev) => sum + Number(ev.score), 0);
  const avgScore = Math.round((totalScore / allEvaluations.length) * 100) / 100;
  await CandidateProfile.update({ competency_score: avgScore }, { where: { id: member.candidate_profile_id } });

  return { evaluation, avgScore };
}

const isClosed = (project, member) => project?.status === 'COMPLETED' || member?.status === 'COMPLETED';

const memberInclude = [
  { model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] },
];

// POST /api/admin/workspaces/:workspaceId/members/:memberId/evaluate — chấm (hoặc sửa điểm) cho một thành viên
exports.evaluateCandidate = async (req, res, next) => {
  try {
    const { score, comment } = req.body;
    const { workspaceId, memberId } = req.params;

    const member = await WorkspaceMember.findOne({
      where: { id: memberId, workspace_id: workspaceId },
      include: [...memberInclude, { model: Workspace, include: [{ model: Project, attributes: ['id', 'name', 'status'] }] }],
    });
    if (!member) throw new AppError('Không tìm thấy thành viên trong Workspace', 404);
    if (!EVALUABLE_MEMBER_STATUSES.includes(member.status)) throw new AppError('Thành viên này đã rời dự án nên không thể chấm điểm', 400);
    if (!isClosed(member.Workspace?.Project, member)) throw new AppError(NOT_CLOSED_MESSAGE, 400);

    const { evaluation, avgScore } = await saveEvaluation(req, member, {
      score: Number(score),
      comment: cleanComment(comment),
      workspaceId,
      projectName: member.Workspace?.Project?.name,
    });
    res.json({ success: true, data: evaluation, new_avg_score: avgScore });
  } catch (error) { next(error); }
};

// Dự án + workspace; 404 nếu không có
async function loadProject(projectId) {
  const project = await Project.findByPk(projectId, { attributes: ['id', 'name', 'status'] });
  if (!project) throw new AppError('Không tìm thấy dự án', 404);
  const workspace = await Workspace.findOne({ where: { project_id: project.id }, attributes: ['id'] });
  return { project, workspace };
}

// GET /api/admin/projects/:projectId/evaluations — danh sách thành viên của dự án kèm điểm đã chấm (nếu có) và số việc đã làm
exports.getProjectEvaluations = async (req, res, next) => {
  try {
    const { project, workspace } = await loadProject(req.params.projectId);

    const members = workspace
      ? await WorkspaceMember.findAll({
        where: { workspace_id: workspace.id, status: { [Op.in]: EVALUABLE_MEMBER_STATUSES } },
        include: [
          { model: CandidateProfile, attributes: ['id', 'avatar_url', 'professional_title'], include: [{ model: User, attributes: ['id', 'full_name', 'email'] }] },
          { model: ProjectJob, attributes: ['id', 'title'] },
          { model: CandidateEvaluation, attributes: ['score', 'comment', 'evaluated_at'] },
        ],
        order: [['joined_at', 'ASC'], ['id', 'ASC']], // thứ tự cố định, không xáo trộn giữa các lần tải
      })
      : [];

    // Số việc được giao / đã xong của từng thành viên, để Admin có cơ sở khi chấm
    const stats = new Map();
    if (members.length) {
      const rows = await sequelize.query(
        `SELECT ta.workspace_member_id AS mid,
                COUNT(*) FILTER (WHERE t.status <> 'CANCELLED') AS total,
                COUNT(*) FILTER (WHERE t.status = 'DONE') AS done
           FROM task_assignees ta JOIN tasks t ON t.id = ta.task_id
          WHERE ta.workspace_member_id IN (:ids)
          GROUP BY ta.workspace_member_id`,
        { replacements: { ids: members.map((m) => m.id) }, type: sequelize.QueryTypes.SELECT }
      );
      rows.forEach((r) => stats.set(r.mid, { total: Number(r.total), done: Number(r.done) }));
    }

    const list = members.map((m) => {
      const ev = m.CandidateEvaluation;
      return {
        member_id: m.id,
        role: m.role,
        position: m.ProjectJob?.title || null,
        user: { id: m.CandidateProfile?.User?.id, full_name: m.CandidateProfile?.User?.full_name, email: m.CandidateProfile?.User?.email },
        avatar_url: m.CandidateProfile?.avatar_url || null,
        professional_title: m.CandidateProfile?.professional_title || null,
        tasks: stats.get(m.id) || { total: 0, done: 0 },
        evaluation: ev ? { score: Number(ev.score), comment: ev.comment, evaluated_at: ev.evaluated_at } : null,
      };
    });

    res.json({
      success: true,
      data: {
        project: { id: project.id, name: project.name, status: project.status, is_closed: project.status === 'COMPLETED', workspace_id: workspace?.id || null },
        members: list,
        summary: { total: list.length, evaluated: list.filter((m) => m.evaluation).length },
      },
    });
  } catch (error) { next(error); }
};

// POST /api/admin/projects/:projectId/evaluations { evaluations: [{ member_id, score, comment? }] }
// Chấm điểm cho nhiều thành viên của dự án trong một lần. Chỉ lưu những dòng có thay đổi (tránh gửi lại thông báo vô ích).
exports.saveProjectEvaluations = async (req, res, next) => {
  try {
    const { project, workspace } = await loadProject(req.params.projectId);
    if (project.status !== 'COMPLETED') throw new AppError(NOT_CLOSED_MESSAGE, 400);
    if (!workspace) throw new AppError('Dự án chưa có Workspace nên chưa có thành viên để chấm điểm', 400);

    const members = await WorkspaceMember.findAll({
      where: { workspace_id: workspace.id, status: { [Op.in]: EVALUABLE_MEMBER_STATUSES } },
      include: [...memberInclude, { model: CandidateEvaluation, attributes: ['score', 'comment'] }],
    });
    const byId = new Map(members.map((m) => [m.id, m]));

    // Gộp theo thành viên (dòng sau ghi đè dòng trước) và kiểm tra hết trước khi lưu bất kỳ dòng nào
    const wanted = new Map();
    for (const item of req.body.evaluations) {
      if (!byId.has(item.member_id)) throw new AppError('Có thành viên không thuộc dự án này hoặc đã rời dự án', 400);
      wanted.set(item.member_id, { score: Number(item.score), comment: cleanComment(item.comment) });
    }

    let saved = 0;
    let unchanged = 0;
    for (const [memberId, { score, comment }] of wanted) {
      const member = byId.get(memberId);
      const old = member.CandidateEvaluation;
      if (old && Number(old.score) === score && (old.comment || null) === comment) { unchanged += 1; continue; }
      await saveEvaluation(req, member, { score, comment, workspaceId: workspace.id, projectName: project.name });
      saved += 1;
    }

    const [{ evaluated }] = await sequelize.query(
      `SELECT COUNT(*)::int AS evaluated FROM candidate_evaluations ce
         JOIN workspace_members wm ON wm.id = ce.workspace_member_id
        WHERE wm.workspace_id = :w AND wm.status IN ('ACTIVE', 'COMPLETED')`,
      { replacements: { w: workspace.id }, type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, data: { saved, unchanged, summary: { total: members.length, evaluated } } });
  } catch (error) { next(error); }
};
