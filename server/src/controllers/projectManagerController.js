const { Project, Workspace, WorkspaceMember, CandidateProfile, User, Skill, ProjectJob, CandidateSkill, CandidateEvaluation, ProjectApplication } = require('../models');
const AppError = require('../utils/AppError');

exports.getManagedProjects = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });

    const projects = await Project.findAll({
      where: { manager_id: profile.id },
      include: [
        { model: Workspace, attributes: ['id', 'status'] },
        { 
          model: ProjectJob, 
          include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }] 
        },
        { 
          model: CandidateProfile, 
          as: 'Manager', 
          attributes: ['id', 'professional_title'], 
          include: [{ model: User, attributes: ['full_name', 'email'] }] 
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};
