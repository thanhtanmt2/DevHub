const { Op } = require('sequelize');
const { sequelize, JobPost, JobPostSkill, Skill, Company, User, Application, CandidateProfile } = require('../models');
const AppError = require('../utils/AppError');
const { createNotification, notifyAdmins } = require('./notificationController');

// Các trường tin tuyển dụng mà Nhà tuyển dụng / Admin được phép nhập (không cho sửa status, post_type...)
const JOB_FIELDS = [
  'title', 'description', 'requirements', 'benefits', 'work_type', 'location', 'work_address', 'working_time',
  'experience', 'position_level', 'salary_min', 'salary_max', 'quantity', 'deadline',
];
const pickJobFields = (body) => {
  const out = {};
  for (const f of JOB_FIELDS) {
    if (body[f] === undefined) continue;
    const blank = typeof body[f] === 'string' && body[f].trim() === '';
    out[f] = blank && f !== 'title' && f !== 'description' ? null : body[f];
  }
  return out;
};
const assertValidDeadline = (deadline) => {
  if (deadline && new Date(deadline) < new Date()) throw new AppError('Hạn nộp hồ sơ phải sau thời điểm hiện tại', 400);
};
const assertValidSalary = ({ salary_min, salary_max }) => {
  if (salary_min && salary_max && parseFloat(salary_min) > parseFloat(salary_max)) {
    throw new AppError('Lương tối thiểu không được lớn hơn lương tối đa', 400);
  }
};

// Một số tỉnh/thành hay được nhập theo nhiều cách khác nhau → lọc theo mọi cách viết
const LOCATION_ALIASES = {
  'TP. Hồ Chí Minh': ['Hồ Chí Minh', 'HCM', 'Sài Gòn', 'Ho Chi Minh'],
  'Hà Nội': ['Hà Nội', 'Hanoi', 'Ha Noi'],
  'Đà Nẵng': ['Đà Nẵng', 'Da Nang'],
};
const ANYWHERE = 'REMOTE_ANY'; // lựa chọn "Toàn quốc / Remote"

// GET /api/jobs — public job listing with filters
exports.getJobs = async (req, res, next) => {
  try {
    const {
      keyword, skill_id, work_type, post_type, salary_min, salary_max,
      location, experience, position_level, salary_from, salary_to, sort = 'newest',
      page = 1, limit = 10,
    } = req.query;
    const where = { status: 'OPEN' };
    const and = [];
    // Tin đã hết hạn nộp hồ sơ thì không hiển thị nữa (vẫn mở được bằng đường link trực tiếp)
    and.push({ [Op.or]: [{ deadline: null }, { deadline: { [Op.gte]: new Date() } }] });
    if (keyword) {
      and.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } },
          { requirements: { [Op.iLike]: `%${keyword}%` } },
          { company_id: { [Op.in]: sequelize.literal(`(SELECT id FROM companies WHERE name ILIKE ${sequelize.escape(`%${keyword}%`)})`) } },
        ],
      });
    }
    if (work_type) where.work_type = work_type;
    if (post_type) where.post_type = post_type;
    if (experience) where.experience = experience;
    if (position_level) where.position_level = position_level;
    if (salary_min) where.salary_min = { [Op.gte]: parseFloat(salary_min) };
    if (salary_max) where.salary_max = { [Op.lte]: parseFloat(salary_max) };
    if (location === ANYWHERE) {
      and.push({ [Op.or]: [{ location: { [Op.iLike]: '%Toàn quốc%' } }, { location: null }, { work_type: 'REMOTE' }] });
    } else if (location) {
      const names = LOCATION_ALIASES[location] || [location.replace(/^(TP\.?|Thành phố)\s*/i, '')];
      and.push({
        [Op.or]: names.flatMap((n) => [
          { location: { [Op.iLike]: `%${n}%` } },
          { work_address: { [Op.iLike]: `%${n}%` } },
        ]),
      });
    }
    // Khoảng lương mong muốn: tin có khoảng lương giao với khoảng này (tin "thỏa thuận" vẫn được hiển thị)
    if (salary_from) and.push({ [Op.or]: [{ salary_max: null }, { salary_max: { [Op.gte]: parseFloat(salary_from) } }] });
    if (salary_to) and.push({ [Op.or]: [{ salary_min: null }, { salary_min: { [Op.lte]: parseFloat(salary_to) } }] });
    if (and.length) where[Op.and] = and;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const include = [
      { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
      { model: Company, attributes: ['id', 'name', 'logo_url', 'address'] },
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
      order: [
        ...(sort === 'deadline' ? [[sequelize.literal('"JobPost"."deadline" ASC NULLS LAST')]]
          : sort === 'salary' ? [[sequelize.literal('"JobPost"."salary_max" DESC NULLS LAST')]] : []),
        ['posted_at', 'DESC'],
      ],
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
        { model: Company, attributes: ['id', 'name', 'logo_url', 'address', 'website', 'description'] },
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
    const { skill_ids } = req.body;
    const fields = pickJobFields(req.body);
    assertValidDeadline(fields.deadline);
    assertValidSalary(fields);
    // Find company of this employer
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Please complete your company profile first', 400);
    if (company.verification_status !== 'VERIFIED') throw new AppError('Company not yet verified by admin', 403);

    const job = await JobPost.create({
      ...fields,
      post_type: 'PARTNER',
      created_by_user_id: req.user.id,
      company_id: company.id,
      status: 'PENDING_APPROVAL',
      posted_at: new Date(),
    });

    if (skill_ids && skill_ids.length > 0) {
      const jobSkills = skill_ids.map(skill_id => ({ job_post_id: job.id, skill_id }));
      await JobPostSkill.bulkCreate(jobSkills, { ignoreDuplicates: true });
    }

    // Admin cần duyệt tin; nhà tuyển dụng nhận xác nhận đã gửi duyệt
    await notifyAdmins({
      type: 'JOB_PENDING',
      title: 'Tin tuyển dụng mới chờ duyệt',
      message: `${company.name} vừa đăng tin "${job.title}" và đang chờ bạn duyệt.`,
      link: '/admin/jobs',
      metadata: { job_post_id: job.id },
    });
    await createNotification({
      user_id: req.user.id,
      type: 'JOB_PENDING',
      title: 'Tin đã được gửi duyệt',
      message: `Tin "${job.title}" đang chờ Admin duyệt. Bạn sẽ nhận thông báo ngay khi có kết quả.`,
      link: '/employer/jobs',
      email: false,
      metadata: { job_post_id: job.id },
    });
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
    const { skill_ids } = req.body;
    const updateData = pickJobFields(req.body);
    const oldDeadline = job.deadline ? job.deadline.toISOString() : '';
    if (updateData.deadline !== undefined && String(updateData.deadline ? new Date(updateData.deadline).toISOString() : '') !== oldDeadline) {
      assertValidDeadline(updateData.deadline);
    }
    assertValidSalary({ salary_min: updateData.salary_min ?? job.salary_min, salary_max: updateData.salary_max ?? job.salary_max });
    await job.update(updateData);
    if (skill_ids) {
      await JobPostSkill.destroy({ where: { job_post_id: job.id } });
      if (skill_ids.length > 0) {
        await JobPostSkill.bulkCreate(skill_ids.map(s => ({ job_post_id: job.id, skill_id: s })), { ignoreDuplicates: true });
      }
    }

    // Tin đã bị Admin từ chối (HIDDEN) mà được chỉnh sửa → tự gửi duyệt lại
    let resubmitted = false;
    if (job.status === 'HIDDEN') {
      await job.update({ status: 'PENDING_APPROVAL' });
      resubmitted = true;
      await notifyAdmins({
        type: 'JOB_PENDING',
        title: 'Tin tuyển dụng được gửi duyệt lại',
        message: `${company.name} đã chỉnh sửa tin "${job.title}" và gửi lại để bạn duyệt.`,
        link: '/admin/jobs',
        metadata: { job_post_id: job.id },
      });
    }
    res.json({ success: true, data: job, ...(resubmitted && { message: 'Đã gửi lại tin để Admin duyệt' }) });
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

// Số hồ sơ đã nhận / số hồ sơ chưa xem của một tin (tính ngay trong truy vấn)
const applicationCount = (extraCondition = '') => sequelize.literal(
  `(SELECT COUNT(*) FROM applications AS a WHERE a.job_post_id = "JobPost"."id"${extraCondition})`
);
const COUNT_ATTRIBUTES = [
  [applicationCount(), 'application_count'],
  [applicationCount(` AND a.status = 'PENDING'`), 'pending_count'],
];

// GET /api/employer/jobs — employer's own jobs
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.json({ success: true, data: [] });
    const jobs = await JobPost.findAll({
      where: { company_id: company.id },
      attributes: { include: COUNT_ATTRIBUTES },
      include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: jobs });
  } catch (error) { next(error); }
};

// GET /api/employer/jobs/:id — xem một tin của chính mình (mọi trạng thái, không tăng lượt xem)
exports.getEmployerJobById = async (req, res, next) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw new AppError('Không tìm thấy tin tuyển dụng', 404);
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);
    const job = await JobPost.findOne({
      where: { id: req.params.id, company_id: company.id },
      attributes: { include: COUNT_ATTRIBUTES },
      include: [
        { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
        { model: Company, attributes: ['id', 'name', 'logo_url', 'address', 'website', 'description'] },
      ],
    });
    if (!job) throw new AppError('Không tìm thấy tin tuyển dụng', 404);
    res.json({ success: true, data: job });
  } catch (error) { next(error); }
};

// POST /api/admin/jobs — admin creates internal job post
exports.createAdminJob = async (req, res, next) => {
  try {
    const { skill_ids } = req.body;
    const fields = pickJobFields(req.body);
    assertValidDeadline(fields.deadline);
    assertValidSalary(fields);
    const job = await JobPost.create({
      ...fields,
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
        { model: Company, attributes: ['id', 'name', 'logo_url', 'address'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: jobs });
  } catch (error) { next(error); }
};

// PUT /api/admin/jobs/:id/approve — admin approves a PARTNER job
exports.approveJob = async (req, res, next) => {
  try {
    const job = await JobPost.findByPk(req.params.id);
    if (!job) throw new AppError('Job not found', 404);
    if (job.post_type !== 'PARTNER') throw new AppError('Only PARTNER jobs need approval', 400);
    await job.update({ status: 'OPEN' });
    await createNotification({
      user_id: job.created_by_user_id,
      type: 'JOB_APPROVED',
      title: 'Tin tuyển dụng đã được duyệt',
      message: `Tin "${job.title}" đã được duyệt và đang hiển thị cho ứng viên.`,
      link: '/employer/jobs',
      metadata: { job_post_id: job.id },
    });
    res.json({ success: true, message: 'Tin tuyển dụng đã được duyệt', data: job });
  } catch (error) { next(error); }
};

// PUT /api/admin/jobs/:id/reject — admin rejects a PARTNER job
exports.rejectJob = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const job = await JobPost.findByPk(req.params.id);
    if (!job) throw new AppError('Job not found', 404);
    if (job.post_type !== 'PARTNER') throw new AppError('Only PARTNER jobs can be rejected', 400);
    await job.update({ status: 'HIDDEN' });
    await createNotification({
      user_id: job.created_by_user_id,
      type: 'JOB_REJECTED',
      title: 'Tin tuyển dụng bị từ chối',
      message: `Tin "${job.title}" chưa được duyệt${reason ? `. Lý do: ${reason}` : ''}. Bạn có thể chỉnh sửa nội dung rồi gửi lại.`,
      link: '/employer/jobs',
      metadata: { job_post_id: job.id },
    });
    res.json({ success: true, message: 'Tin tuyển dụng đã bị từ chối', data: job });
  } catch (error) { next(error); }
};
