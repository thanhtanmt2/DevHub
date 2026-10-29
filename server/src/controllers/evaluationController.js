const { CandidateEvaluation, CandidateProfile, WorkspaceMember, Workspace, User } = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');

// POST /api/admin/workspaces/:workspaceId/members/:memberId/evaluate
exports.evaluateCandidate = async (req, res, next) => {
  try {
    const { score, comment } = req.body;
    const { workspaceId, memberId } = req.params;

    // Check if member exists in workspace
    const member = await WorkspaceMember.findOne({
      where: { id: memberId, workspace_id: workspaceId },
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });

    if (!member) throw new AppError('Không tìm thấy thành viên trong Workspace', 404);

    // Check if evaluation already exists for this member in this workspace
    let evaluation = await CandidateEvaluation.findOne({
      where: { workspace_member_id: member.id }
    });

    if (evaluation) {
      // Update existing
      await evaluation.update({ score, comment, evaluated_at: new Date() });
    } else {
      // Create new
      evaluation = await CandidateEvaluation.create({
        workspace_member_id: member.id,
        score,
        comment,
        evaluated_at: new Date()
      });
    }

    const u = member.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'MEMBER_EVALUATED',
        entity_type: 'evaluation',
        entity_id: evaluation.id,
        entity_name: `Đánh giá ${u.full_name}`,
        description: `Đã đánh giá thành viên ${u.full_name} với ${score} điểm`,
        metadata: { workspace_id: workspaceId, user_id: u.id },
        notify_user_ids: [u.id],
        notify_link: `/candidate/workspaces/${workspaceId}`,
      });
    }

    // Recalculate candidate's average competency_score
    const allMemberIds = await WorkspaceMember.findAll({
      where: { candidate_profile_id: member.candidate_profile_id },
      attributes: ['id'],
    });
    const memberIds = allMemberIds.map(m => m.id);
    const allEvaluations = await CandidateEvaluation.findAll({
      where: { workspace_member_id: memberIds },
    });

    // score là DECIMAL nên driver trả về chuỗi ("9.00"): phải ép sang số, nếu không phép + nối chuỗi và điểm trung bình thành NaN
    const totalScore = allEvaluations.reduce((sum, ev) => sum + Number(ev.score), 0);
    const avgScore = Math.round((totalScore / allEvaluations.length) * 100) / 100;

    await member.CandidateProfile.update({ competency_score: avgScore });

    res.json({ success: true, data: evaluation, new_avg_score: avgScore });
  } catch (error) { next(error); }
};
