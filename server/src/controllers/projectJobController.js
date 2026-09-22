const { Op } = require('sequelize');
const { 
  Project, ProjectJob, ProjectJobSkill, Skill, 
  ProjectApplication, CandidateProfile, User, 
  Workspace, WorkspaceMember 
} = require('../models');
const AppError = require('../utils/AppError');

// GET /api/project-jobs — Public listing of project jobs
exports.getProjectJobs = async (req, res, next) => {
  try {
    const { keyword, skill_id, page = 1, limit = 10 } = req.query;
    const where = { status: 'OPEN' };

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const include = [
      {
        model: Project,
        attributes: ['id', 'name', 'description', 'budget', 'status', 'start_date', 'expected_end_date']
      },
      {
        model: Skill,
        through: { attributes: [] },
        attributes: ['id', 'name']
      }
    ];

    if (skill_id) {
      include[1].where = { id: skill_id };
      include[1].required = true;
    }

    const { count, rows } = await ProjectJob.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      }
    });
  } catch (error) { next(error); }
};

// GET /api/project-jobs/:id — Public detail
exports.getProjectJobById = async (req, res, next) => {
  try {
    const job = await ProjectJob.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          attributes: ['id', 'name', 'description', 'budget', 'status', 'start_date', 'expected_end_date']
        },
        {
          model: Skill,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]
    });
    if (!job) throw new AppError('Project job not found', 404);
    res.json({ success: true, data: job });
  } catch (error) { next(error); }
};

// POST /api/project-jobs/:id/apply — Candidate applies to a project job
exports.applyProjectJob = async (req, res, next) => {
  try {
    const { cover_letter, cv_url } = req.body;
    const projectJob = await ProjectJob.findByPk(req.params.id);
    if (!projectJob || projectJob.status !== 'OPEN') {
      throw new AppError('Vị trí dự án này không khả dụng hoặc đã đóng', 400);
    }

    const candidateProfile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!candidateProfile) throw new AppError('Candidate profile not found', 404);

    const existing = await ProjectApplication.findOne({
      where: {
        project_job_id: projectJob.id,
        candidate_profile_id: candidateProfile.id
      }
    });
    if (existing) throw new AppError('Bạn đã nộp đơn cho vị trí này rồi', 409);

    const application = await ProjectApplication.create({
      project_job_id: projectJob.id,
      candidate_profile_id: candidateProfile.id,
      cover_letter,
      cv_url,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: application, message: 'Ứng tuyển thành công' });
  } catch (error) { next(error); }
};

// GET /api/candidates/project-applications — Candidate view their project applications
exports.getMyProjectApplications = async (req, res, next) => {
  try {
    const candidateProfile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!candidateProfile) return res.json({ success: true, data: [] });

    const applications = await ProjectApplication.findAll({
      where: { candidate_profile_id: candidateProfile.id },
      include: [
        {
          model: ProjectJob,
          include: [{ model: Project, attributes: ['id', 'name'] }]
        }
      ],
      order: [['applied_at', 'DESC']]
    });

    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// POST /api/admin/projects/:projectId/jobs — Admin adds a job position to project
exports.adminCreateProjectJob = async (req, res, next) => {
  try {
    const { title, description, budget, quantity, deadline, skill_ids } = req.body;
    const project = await Project.findByPk(req.params.projectId);
    if (!project) throw new AppError('Project not found', 404);

    const projectJob = await ProjectJob.create({
      project_id: project.id,
      title,
      description,
      budget,
      quantity: quantity || 1,
      deadline,
      status: 'OPEN'
    });

    if (skill_ids && skill_ids.length > 0) {
      const skillsData = skill_ids.map(skill_id => ({ project_job_id: projectJob.id, skill_id }));
      await ProjectJobSkill.bulkCreate(skillsData, { ignoreDuplicates: true });
    }

    res.status(201).json({ success: true, data: projectJob });
  } catch (error) { next(error); }
};

// GET /api/admin/projects/:projectId/jobs — Admin get all jobs of a project
exports.adminGetProjectJobs = async (req, res, next) => {
  try {
    const jobs = await ProjectJob.findAll({
      where: { project_id: req.params.projectId },
      include: [
        { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
        { 
          model: ProjectApplication, 
          include: [{ 
            model: CandidateProfile, 
            include: [{ model: User, attributes: ['full_name', 'email'] }] 
          }] 
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: jobs });
  } catch (error) { next(error); }
};

// PUT /api/admin/project-applications/:id/status — Admin review application (auto-assign to Workspace on ACCEPTED)
exports.adminUpdateProjectApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // ACCEPTED, REJECTED, REVIEWING
    if (!['REVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const application = await ProjectApplication.findByPk(req.params.id, {
      include: [{ model: ProjectJob }]
    });
    if (!application) throw new AppError('Application not found', 404);

    await application.update({ status });

    // If ACCEPTED -> Automatically add candidate into project's Workspace!
    if (status === 'ACCEPTED') {
      const workspace = await Workspace.findOne({
        where: { project_id: application.ProjectJob.project_id }
      });

      if (workspace) {
        const existingMember = await WorkspaceMember.findOne({
          where: {
            workspace_id: workspace.id,
            candidate_profile_id: application.candidate_profile_id
          }
        });

        if (!existingMember) {
          await WorkspaceMember.create({
            workspace_id: workspace.id,
            candidate_profile_id: application.candidate_profile_id,
            project_job_id: application.project_job_id,
            status: 'ACTIVE',
            joined_at: new Date()
          });
        }
      }
    }

    res.json({ 
      success: true, 
      data: application, 
      message: status === 'ACCEPTED' 
        ? 'Đã duyệt ứng viên và tự động thêm vào Không gian làm việc (Workspace)' 
        : 'Đã cập nhật trạng thái hồ sơ' 
    });
  } catch (error) { next(error); }
};
