const { Application, ApplicationStatusHistory, CandidateProfile, JobPost, Company, User, Skill } = require('../models');
const AppError = require('../utils/AppError');

// POST /api/applications — candidate submits application
exports.apply = async (req, res, next) => {
  try {
    const { job_post_id, cover_letter, cv_url } = req.body;
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Please complete your candidate profile first', 400);

    const job = await JobPost.findByPk(job_post_id);
    if (!job) throw new AppError('Job post not found', 404);
    if (job.status !== 'OPEN') throw new AppError('This job post is no longer accepting applications', 400);

    // Check duplicate
    const existing = await Application.findOne({ where: { candidate_profile_id: profile.id, job_post_id } });
    if (existing) throw new AppError('You have already applied for this position', 409);

    const application = await Application.create({
      candidate_profile_id: profile.id,
      job_post_id,
      cover_letter,
      cv_url,
      status: 'PENDING',
    });

    await ApplicationStatusHistory.create({
      application_id: application.id,
      status: 'PENDING',
      note: 'Hồ sơ vừa được nộp',
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) { next(error); }
};

// GET /api/candidates/applications — candidate's application list
exports.getMyApplications = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const applications = await Application.findAll({
      where: { candidate_profile_id: profile.id },
      include: [{
        model: JobPost,
        attributes: ['id', 'title', 'post_type', 'work_type', 'salary_min', 'salary_max', 'status'],
        include: [{ model: Company, attributes: ['id', 'name', 'logo_url'] }],
      }],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// GET /api/applications/:id — application detail with history
exports.getApplicationDetail = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    const application = await Application.findOne({
      where: { id: req.params.id, candidate_profile_id: profile?.id },
      include: [
        { model: JobPost, include: [{ model: Company }] },
        { model: ApplicationStatusHistory, order: [['changed_at', 'ASC']] },
      ],
    });
    if (!application) throw new AppError('Application not found', 404);
    res.json({ success: true, data: application });
  } catch (error) { next(error); }
};

// GET /api/employer/applications — employer views all applicants across all jobs
exports.getAllEmployerApplications = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);

    const { job_id, status } = req.query;
    const jobWhere = { company_id: company.id };
    if (job_id) jobWhere.id = job_id;

    const appWhere = {};
    if (status) appWhere.status = status;

    const applications = await Application.findAll({
      where: appWhere,
      include: [
        {
          model: JobPost,
          where: jobWhere,
          attributes: ['id', 'title', 'post_type', 'work_type', 'status'],
        },
        {
          model: CandidateProfile,
          attributes: ['id', 'professional_title', 'competency_score', 'github_url', 'portfolio_url', 'cv_url', 'cv_name'],
          include: [
            { model: User, attributes: ['full_name', 'email'] },
            { model: Skill, through: { attributes: ['level'] }, attributes: ['name'] },
          ],
        },
      ],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// GET /api/employer/jobs/:jobId/applications — employer views applicants
exports.getJobApplications = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);
    const job = await JobPost.findOne({ where: { id: req.params.jobId, company_id: company.id } });
    if (!job) throw new AppError('Job not found or not yours', 404);

    const applications = await Application.findAll({
      where: { job_post_id: req.params.jobId },
      include: [{
        model: CandidateProfile,
        attributes: ['id', 'professional_title', 'competency_score', 'github_url', 'portfolio_url', 'cv_url', 'cv_name'],
        include: [
          { model: User, attributes: ['full_name', 'email'] },
          { model: Skill, through: { attributes: ['level'] }, attributes: ['name'] },
        ],
      }],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// PUT /api/employer/applications/:id/status — employer updates application status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['VIEWED', 'INTERVIEW', 'HIRED', 'REJECTED'];
    if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400);

    const company = await Company.findOne({ where: { user_id: req.user.id } });
    // Verify this application belongs to this employer's job
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: JobPost, where: { company_id: company?.id } }],
    });
    if (!application) throw new AppError('Application not found or access denied', 404);

    await application.update({ status });
    await ApplicationStatusHistory.create({ application_id: application.id, status, note });

    res.json({ success: true, data: application });
  } catch (error) { next(error); }
};

// GET /api/admin/jobs/:jobId/applications — admin views applications for internal job
exports.getAdminJobApplications = async (req, res, next) => {
  try {
    const job = await JobPost.findByPk(req.params.jobId);
    if (!job) throw new AppError('Job not found', 404);
    const applications = await Application.findAll({
      where: { job_post_id: req.params.jobId },
      include: [{
        model: CandidateProfile,
        include: [
          { model: User, attributes: ['full_name', 'email'] },
          { model: Skill, through: { attributes: ['level'] }, attributes: ['name'] },
        ],
      }],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// PUT /api/admin/applications/:id/status — admin updates status (for internal jobs)
exports.adminUpdateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findByPk(req.params.id);
    if (!application) throw new AppError('Application not found', 404);
    await application.update({ status });
    await ApplicationStatusHistory.create({ application_id: application.id, status, note });
    res.json({ success: true, data: application });
  } catch (error) { next(error); }
};
