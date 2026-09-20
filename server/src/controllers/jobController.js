const { Op } = require('sequelize');
const { JobPost, JobPostSkill, Skill, Company, User, Application, CandidateProfile } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/jobs — public job listing with filters
exports.getJobs = async (req, res, next) => {
  try {
    const { keyword, skill_id, work_type, post_type, salary_min, salary_max, page = 1, limit = 10 } = req.query;
    const where = { status: 'OPEN' };
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }
    if (work_type) where.work_type = work_type;
    if (post_type) where.post_type = post_type;
    if (salary_min) where.salary_min = { [Op.gte]: parseFloat(salary_min) };
    if (salary_max) where.salary_max = { [Op.lte]: parseFloat(salary_max) };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const include = [
      { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
      { model: Company, attributes: ['id', 'name', 'logo_url'] },
    ];
    // Filter by skill if provided
    if (skill_id) {
      include[0].where = { id: skill_id };
      include[0].required = true;
    }

    const { count, rows } = await JobPost.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['posted_at', 'DESC']],
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
      },
    });
  } catch (error) { next(error); }
};

// GET /api/jobs/:id — job detail
exports.getJobById = async (req, res, next) => {
  try {
    const job = await JobPost.findByPk(req.params.id, {
      include: [
        { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
        { model: Company, attributes: ['id', 'name', 'logo_url', 'address', 'website'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
      ],
    });
    if (!job) throw new AppError('Job post not found', 404);
    // Increment view count
    await job.increment('view_count');
    res.json({ success: true, data: job });
  } catch (error) { next(error); }
};

// POST /api/employer/jobs — employer creates job post
exports.createEmployerJob = async (req, res, next) => {
  try {
    const { title, description, work_type, location, salary_min, salary_max, quantity, deadline, skill_ids } = req.body;
    // Find company of this employer
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Please complete your company profile first', 400);
    if (company.verification_status !== 'VERIFIED') throw new AppError('Company not yet verified by admin', 403);

    const job = await JobPost.create({
      title, description, work_type, location, salary_min, salary_max, quantity, deadline,
      post_type: 'PARTNER',
      created_by_user_id: req.user.id,
      company_id: company.id,
      status: 'OPEN',
      posted_at: new Date(),
    });

    if (skill_ids && skill_ids.length > 0) {
      const jobSkills = skill_ids.map(skill_id => ({ job_post_id: job.id, skill_id }));
      await JobPostSkill.bulkCreate(jobSkills, { ignoreDuplicates: true });
    }
    res.status(201).json({ success: true, data: job });
  } catch (error) { next(error); }
};

// PUT /api/employer/jobs/:id
exports.updateEmployerJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);
    const job = await JobPost.findOne({ where: { id: req.params.id, company_id: company.id } });
    if (!job) throw new AppError('Job not found or not yours', 404);
    const { skill_ids, ...updateData } = req.body;
    await job.update(updateData);
    if (skill_ids) {
      await JobPostSkill.destroy({ where: { job_post_id: job.id } });
      if (skill_ids.length > 0) {
        await JobPostSkill.bulkCreate(skill_ids.map(s => ({ job_post_id: job.id, skill_id: s })), { ignoreDuplicates: true });
      }
    }
    res.json({ success: true, data: job });
  } catch (error) { next(error); }
};

// DELETE /api/employer/jobs/:id (close the job)
exports.closeEmployerJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    const job = await JobPost.findOne({ where: { id: req.params.id, company_id: company?.id } });
    if (!job) throw new AppError('Job not found', 404);
    await job.update({ status: 'CLOSED' });
    res.json({ success: true, message: 'Job closed' });
  } catch (error) { next(error); }
};

// GET /api/employer/jobs — employer's own jobs
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.json({ success: true, data: [] });
    const jobs = await JobPost.findAll({
      where: { company_id: company.id },
      include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: jobs });
  } catch (error) { next(error); }
};

// POST /api/admin/jobs — admin creates internal job post
exports.createAdminJob = async (req, res, next) => {
  try {
    const { title, description, work_type, salary_min, salary_max, quantity, deadline, skill_ids } = req.body;
    const job = await JobPost.create({
      title, description, work_type, salary_min, salary_max, quantity, deadline,
      post_type: 'INTERNAL',
      created_by_user_id: req.user.id,
      status: 'OPEN',
      posted_at: new Date(),
    });
    if (skill_ids && skill_ids.length > 0) {
      await JobPostSkill.bulkCreate(skill_ids.map(s => ({ job_post_id: job.id, skill_id: s })), { ignoreDuplicates: true });
    }
    res.status(201).json({ success: true, data: job });
  } catch (error) { next(error); }
};

// GET /api/admin/jobs — all jobs (admin)
exports.getAdminJobs = async (req, res, next) => {
  try {
    const { post_type, status } = req.query;
    const where = {};
    if (post_type) where.post_type = post_type;
    if (status) where.status = status;
    const jobs = await JobPost.findAll({
      where,
      include: [
        { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
        { model: Company, attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: jobs });
  } catch (error) { next(error); }
};
