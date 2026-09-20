const { CandidateEvaluation, CandidateProfile, WorkspaceMember, Workspace, User } = require('../models');
const AppError = require('../utils/AppError');

// POST /api/admin/workspaces/:workspaceId/members/:memberId/evaluate
exports.evaluateCandidate = async (req, res, next) => {
  try {
    const { score, comments } = req.body;
    const { workspaceId, memberId } = req.params;

    // Check if member exists in workspace
    const member = await WorkspaceMember.findOne({
      where: { id: memberId, workspace_id: workspaceId },
      include: [{ model: CandidateProfile }]
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
        workspace_member_id: member.id,
        score,
        comments,
        evaluation_date: new Date()
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
