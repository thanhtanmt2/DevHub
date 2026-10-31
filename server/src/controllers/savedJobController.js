const { Op } = require('sequelize');
const { SavedJob, JobPost, ProjectJob, Project, Company, Skill, CandidateProfile, Application, ProjectApplication } = require('../models');
const AppError = require('../utils/AppError');

const MAX_SAVED = 200; // mỗi ứng viên lưu tối đa 200 tin
const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
const TYPES = { job: 'job_post_id', project: 'project_job_id' };

async function myProfile(req) {
  const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id }, attributes: ['id'] });
  if (!profile) throw new AppError('Chưa có hồ sơ ứng viên', 404);
  return profile;
}

// Tin còn nhận hồ sơ: đang mở và chưa quá hạn
const isOpen = (job) => job.status === 'OPEN' && (!job.deadline || new Date(job.deadline) >= new Date());

// GET /api/candidates/saved-jobs/ids — chỉ trả id đã lưu để các thẻ việc làm tô sáng nút trái tim
exports.getSavedIds = async (req, res, next) => {
  try {
    const profile = await myProfile(req);
    const rows = await SavedJob.findAll({ where: { candidate_profile_id: profile.id }, attributes: ['job_post_id', 'project_job_id'], raw: true });
    res.json({
      success: true,
      data: {
        jobs: rows.map((r) => r.job_post_id).filter(Boolean),
        projects: rows.map((r) => r.project_job_id).filter(Boolean),
      },
    });
  } catch (error) { next(error); }
};

// GET /api/candidates/saved-jobs — danh sách đầy đủ (mới lưu trước), kèm trạng thái "còn hạn" và "đã ứng tuyển"
exports.getSavedJobs = async (req, res, next) => {
  try {
    const profile = await myProfile(req);
    const rows = await SavedJob.findAll({
      where: { candidate_profile_id: profile.id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: JobPost,
          attributes: ['id', 'title', 'work_type', 'salary_min', 'salary_max', 'location', 'experience', 'deadline', 'status', 'posted_at', 'quantity'],
          include: [
            { model: Company, attributes: ['id', 'name', 'logo_url'] },
            { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
          ],
        },
        {
          model: ProjectJob,
          attributes: ['id', 'title', 'budget', 'experience', 'deadline', 'status', 'quantity'],
          include: [
            { model: Project, attributes: ['id', 'name', 'status'] },
            { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
          ],
        },
      ],
    });

    const jobIds = rows.map((r) => r.job_post_id).filter(Boolean);
    const projectIds = rows.map((r) => r.project_job_id).filter(Boolean);
    const [apps, projectApps] = await Promise.all([
      jobIds.length ? Application.findAll({ where: { candidate_profile_id: profile.id, job_post_id: jobIds }, attributes: ['job_post_id', 'status'], raw: true }) : [],
      projectIds.length ? ProjectApplication.findAll({ where: { candidate_profile_id: profile.id, project_job_id: projectIds }, attributes: ['project_job_id', 'status'], raw: true }) : [],
    ]);
    const appliedJob = new Map(apps.map((a) => [a.job_post_id, a.status]));
    const appliedProject = new Map(projectApps.map((a) => [a.project_job_id, a.status]));

    const data = rows.map((r) => {
      const isJob = !!r.job_post_id;
      const job = isJob ? r.JobPost : r.ProjectJob;
      return {
        id: r.id,
        type: isJob ? 'JOB' : 'PROJECT',
        saved_at: r.createdAt,
        open: isOpen(job),
        applied_status: (isJob ? appliedJob.get(job.id) : appliedProject.get(job.id)) || null,
        job,
      };
    });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// POST /api/candidates/saved-jobs { type: 'job' | 'project', job_id } — lưu một tin (lưu lại tin đã lưu thì không lỗi)
exports.saveJob = async (req, res, next) => {
  try {
    const { type, job_id } = req.body;
    const column = TYPES[type];
    if (!column) throw new AppError('Loại tin không hợp lệ', 400);
    if (!isUuid(job_id)) throw new AppError('Mã tin không hợp lệ', 400);

    const job = await (type === 'job' ? JobPost : ProjectJob).findByPk(job_id, { attributes: ['id', 'status', 'deadline'] });
    if (!job) throw new AppError('Không tìm thấy tin này', 404);
    if (!isOpen(job)) throw new AppError('Tin này đã đóng hoặc hết hạn nộp hồ sơ nên không thể lưu', 400);

    const profile = await myProfile(req);
    const existing = await SavedJob.findOne({ where: { candidate_profile_id: profile.id, [column]: job_id } });
    if (!existing) {
      const count = await SavedJob.count({ where: { candidate_profile_id: profile.id } });
      if (count >= MAX_SAVED) throw new AppError(`Bạn chỉ lưu được tối đa ${MAX_SAVED} tin, hãy bỏ lưu bớt tin cũ`, 400);
      await SavedJob.create({ candidate_profile_id: profile.id, [column]: job_id });
    }
    res.status(existing ? 200 : 201).json({ success: true, message: 'Đã lưu tin', data: { saved: true } });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/saved-jobs/:type/:id — bỏ lưu (bỏ lưu tin chưa lưu thì không lỗi)
exports.unsaveJob = async (req, res, next) => {
  try {
    const column = TYPES[req.params.type];
    if (!column || !isUuid(req.params.id)) throw new AppError('Tin không hợp lệ', 400);
    const profile = await myProfile(req);
    await SavedJob.destroy({ where: { candidate_profile_id: profile.id, [column]: req.params.id } });
    res.json({ success: true, message: 'Đã bỏ lưu tin', data: { saved: false } });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/saved-jobs/expired — dọn các tin đã lưu nhưng đã đóng / hết hạn
exports.removeExpired = async (req, res, next) => {
  try {
    const profile = await myProfile(req);
    const now = new Date();
    const closed = { [Op.or]: [{ status: { [Op.ne]: 'OPEN' } }, { deadline: { [Op.lt]: now } }] };
    const [jobs, projects] = await Promise.all([
      JobPost.findAll({ where: closed, attributes: ['id'], include: [{ model: SavedJob, where: { candidate_profile_id: profile.id }, attributes: ['id'], required: true }] }),
      ProjectJob.findAll({ where: closed, attributes: ['id'], include: [{ model: SavedJob, where: { candidate_profile_id: profile.id }, attributes: ['id'], required: true }] }),
    ]);
    const ids = [...jobs, ...projects].flatMap((j) => j.SavedJobs.map((s) => s.id));
    if (ids.length) await SavedJob.destroy({ where: { id: ids } });
    res.json({ success: true, message: ids.length ? `Đã xóa ${ids.length} tin đã đóng / hết hạn` : 'Không có tin nào đã đóng hoặc hết hạn', data: { removed: ids.length } });
  } catch (error) { next(error); }
};
