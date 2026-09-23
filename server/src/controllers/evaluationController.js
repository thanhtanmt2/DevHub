const { CandidateEvaluation, CandidateProfile, WorkspaceMember, Workspace, User } = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');

// POST /api/admin/workspaces/:workspaceId/members/:memberId/evaluate
exports.evaluateCandidate = async (req, res, next) => {
  try {
    const { score, comments } = req.body;
    const { workspaceId, memberId } = req.params;

    // Check if member exists in workspace
    const member = await WorkspaceMember.findOne({
      where: { id: memberId, workspace_id: workspaceId },
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });

    if (!member) throw new AppError('Workspace member not found', 404);

    // Check if evaluation already exists for this member in this workspace
    let evaluation = await CandidateEvaluation.findOne({
      where: { workspace_member_id: member.id }
    });

    if (evaluation) {
      // Update existing
      await evaluation.update({ score, comments, evaluation_date: new Date() });
    } else {
      // Create new
      evaluation = await CandidateEvaluation.create({
        candidate_profile_id: member.candidate_profile_id,
        workspace_member_id: member.id,
        score,
        comments,
        evaluation_date: new Date()
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
    const allEvaluations = await CandidateEvaluation.findAll({
      include: [{
        model: WorkspaceMember,
        where: { candidate_profile_id: member.candidate_profile_id }
      }]
    });

    const totalScore = allEvaluations.reduce((sum, ev) => sum + ev.score, 0);
    const avgScore = totalScore / allEvaluations.length;

    await member.CandidateProfile.update({ competency_score: avgScore });

    res.json({ success: true, data: evaluation, new_avg_score: avgScore });
  } catch (error) { next(error); }
};
