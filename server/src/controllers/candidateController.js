// nạp các bảng liên quan đến ứng viên trong model 
const { sequelize, CandidateProfile, CandidateCv, Experience, Skill, CandidateSkill, PaymentInformation, User, CandidateEvaluation, WorkspaceMember, Workspace, InternalProject, Task, SubTask, ProjectJob, Company, Application, JobPost } = require('../models');
const { Op } = require('sequelize');
// nạp class AppError để hiển thị lỗi 
const AppError = require('../utils/AppError');
const { getEvidenceForProfiles, syncProjectSkills } = require('../utils/skillEvidence');
const { extractSkillsFromCv } = require('../utils/cvSkillExtractor');

// GET /api/candidates/profile
// Lấy thông tin hồ sơ của ứng viên
exports.getMyProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: Skill, through: { attributes: ['source'] } },
        { model: Experience },
        { model: PaymentInformation },
      ],
    });
    if (!profile) {
      // tạo profile rỗng nếu chưa có 
      profile = await CandidateProfile.create({ user_id: req.user.id });
    }
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};

// PUT /api/candidates/profile
// Cập nhật thông tin hồ sơ của ứng viên 
exports.updateProfile = async (req, res, next) => {
  try {
    const { professional_title, introduction, phone, address, github_url, portfolio_url, cv_url, cv_name } = req.body;
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });

    const updateData = {};
    if (professional_title !== undefined) updateData.professional_title = professional_title;
    if (introduction !== undefined) updateData.introduction = introduction;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (github_url !== undefined) updateData.github_url = github_url;
    if (portfolio_url !== undefined) updateData.portfolio_url = portfolio_url;
    if (cv_url !== undefined) updateData.cv_url = cv_url;
    if (cv_name !== undefined) updateData.cv_name = cv_name;

    await profile.update(updateData);
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};

// GET /api/candidates/skills
// Lấy kỹ năng của ứng viên
exports.getMySkills = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    // Kỹ năng từ dự án đã hoàn thành tự được thêm vào hồ sơ
    await syncProjectSkills(profile.id);
    const skills = await CandidateSkill.findAll({
      where: { candidate_profile_id: profile.id },
      include: [{ model: Skill, attributes: ['id', 'name'] }],
    });
    // Kỹ năng có minh chứng = đã dùng trong dự án hoàn thành trên nền tảng (đưa lên đầu danh sách)
    const evidence = (await getEvidenceForProfiles([profile.id])).get(profile.id) || new Map();
    const data = skills
      .map((x) => ({ ...x.toJSON(), evidence: evidence.get(x.skill_id) || [] }))
      .sort((a, b) => (b.evidence.length > 0) - (a.evidence.length > 0));
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// POST /api/candidates/skills
// Thêm kỹ năng cho ứng viên
exports.addSkill = async (req, res, next) => {
  try {
    const { skill_id } = req.body;
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });
    const existing = await CandidateSkill.findOne({ where: { candidate_profile_id: profile.id, skill_id } });
    if (existing) throw new AppError('Kỹ năng này đã có trong hồ sơ của bạn', 409);
    const cs = await CandidateSkill.create({ candidate_profile_id: profile.id, skill_id, source: 'MANUAL' });
    res.status(201).json({ success: true, data: cs });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/skills/:skill_id
// Xóa kỹ năng của ứng viên
exports.removeSkill = async (req, res, next) => {
  try {
    const { skill_id } = req.params;
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Không tìm thấy hồ sơ ứng viên', 404);
    const deleted = await CandidateSkill.destroy({ where: { candidate_profile_id: profile.id, skill_id } });
    if (!deleted) throw new AppError('Không tìm thấy kỹ năng', 404);
    res.json({ success: true, message: 'Đã xóa kỹ năng' });
  } catch (error) { next(error); }
};

// GET /api/candidates/experiences
// Lấy kinh nghiệm của ứng viên
exports.getExperiences = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const experiences = await Experience.findAll({ where: { candidate_profile_id: profile.id }, order: [['start_date', 'DESC']] });
    res.json({ success: true, data: experiences });
  } catch (error) { next(error); }
};

// Chuẩn hóa danh sách chuỗi (việc đã làm, công nghệ): bỏ rỗng, cắt độ dài, giới hạn số lượng
const EXP_TYPES = ['COMPANY', 'FREELANCE', 'PERSONAL', 'PROJECT'];
function cleanList(v, maxItems, maxLen) {
  const arr = Array.isArray(v) ? v : [];
  return arr.map((x) => String(x ?? '').trim().slice(0, maxLen)).filter(Boolean).slice(0, maxItems);
}

// Kiểm tra + chuẩn hóa dữ liệu một mục kinh nghiệm (dùng chung cho thêm và sửa)
async function buildExperienceData(input, profile, selfId) {
  const type = input.type || 'COMPANY';
  if (!EXP_TYPES.includes(type)) throw new AppError('Loại kinh nghiệm không hợp lệ', 400);
  const job_title = String(input.job_title || '').trim();
  const company_name = String(input.company_name || '').trim();
  if (!job_title || !company_name) throw new AppError('Vui lòng nhập đủ tên và vai trò', 400);
  if (!input.start_date) throw new AppError('Vui lòng chọn ngày bắt đầu', 400);
  const start_date = input.start_date;
  const end_date = input.end_date || null;
  if (end_date && new Date(end_date) < new Date(start_date)) throw new AppError('Ngày kết thúc phải sau ngày bắt đầu', 400);

  let parent_id = null;
  if (type === 'PROJECT') {
    if (!input.parent_id) throw new AppError('Dự án phải thuộc một công ty', 400);
    if (input.parent_id === selfId) throw new AppError('Dự án không thể thuộc chính nó', 400);
    const parent = await Experience.findOne({ where: { id: input.parent_id, candidate_profile_id: profile.id, type: 'COMPANY' } });
    if (!parent) throw new AppError('Công ty không tồn tại', 400);
    parent_id = parent.id;
  }
  return {
    type, parent_id, job_title, company_name, start_date, end_date,
    description: input.description ? String(input.description).trim() : null,
    tasks: cleanList(input.tasks, 20, 300),
    technologies: cleanList(input.technologies, 20, 50),
    link_url: input.link_url ? String(input.link_url).trim().slice(0, 500) : null,
  };
}

// Cho cvImportController dùng lại để kiểm tra dữ liệu kinh nghiệm
exports.buildExperienceData = buildExperienceData;

// POST /api/candidates/experiences
// Thêm một mục kinh nghiệm (công ty / freelance / dự án cá nhân / dự án con trong công ty)
exports.addExperience = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });
    const data = await buildExperienceData(req.body, profile);
    const exp = await Experience.create({ candidate_profile_id: profile.id, ...data });
    res.status(201).json({ success: true, data: exp });
  } catch (error) { next(error); }
};

// PUT /api/candidates/experiences/:id
// Cập nhật kinh nghiệm (trường không gửi lên thì giữ nguyên)
exports.updateExperience = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Không tìm thấy hồ sơ ứng viên', 404);
    const exp = await Experience.findOne({ where: { id: req.params.id, candidate_profile_id: profile.id } });
    if (!exp) throw new AppError('Không tìm thấy mục kinh nghiệm', 404);
    const merged = { ...exp.toJSON(), ...req.body };
    const data = await buildExperienceData(merged, profile, exp.id);
    if (exp.type === 'COMPANY' && data.type !== 'COMPANY') {
      const children = await Experience.count({ where: { parent_id: exp.id } });
      if (children > 0) throw new AppError('Hãy xóa hoặc chuyển các dự án con trước khi đổi loại công ty', 400);
    }
    await exp.update(data);
    res.json({ success: true, data: exp });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/experiences/:id
// Xóa kinh nghiệm (xóa công ty thì xóa luôn các dự án con)
exports.deleteExperience = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Không tìm thấy hồ sơ ứng viên', 404);
    const exp = await Experience.findOne({ where: { id: req.params.id, candidate_profile_id: profile.id } });
    if (!exp) throw new AppError('Không tìm thấy mục kinh nghiệm', 404);
    await Experience.destroy({ where: { parent_id: exp.id, candidate_profile_id: profile.id } });
    await exp.destroy();
    res.json({ success: true, message: 'Đã xóa mục kinh nghiệm' });
  } catch (error) { next(error); }
};

// Các dự án thật ứng viên đã tham gia trên DevHub (đưa vào sơ đồ kinh nghiệm, tự động, có xác thực)
async function loadDevhubProjects(profileId) {
  const members = await WorkspaceMember.findAll({
    where: { candidate_profile_id: profileId, status: { [Op.ne]: 'REMOVED' } },
    include: [
      {
        model: Workspace,
        attributes: ['id', 'name'],
        include: [{ model: InternalProject, attributes: ['id', 'name', 'description', 'status', 'start_date', 'expected_end_date', 'actual_end_date'] }],
      },
      { model: ProjectJob, attributes: ['id', 'title'], include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }] },
      { model: CandidateEvaluation, attributes: ['score', 'comment', 'evaluated_at'] },
    ],
    order: [['joined_at', 'DESC']],
  });
  return members.map((m) => {
    const j = m.toJSON();
    return {
      member_id: j.id,
      member_status: j.status,
      joined_at: j.joined_at,
      position: j.ProjectJob?.title || null,
      skills: j.ProjectJob?.Skills || [],
      project: j.Workspace?.Project || j.Workspace?.InternalProject || null,
      evaluation: j.CandidateEvaluation || null,
    };
  });
}

// GET /api/candidates/devhub-projects
exports.getMyDevhubProjects = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    res.json({ success: true, data: await loadDevhubProjects(profile.id) });
  } catch (error) { next(error); }
};

// GET /api/candidates/payment-info
// Lấy thông tin thanh toán của ứng viên
exports.getPaymentInfo = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: null });
    const info = await PaymentInformation.findOne({ where: { candidate_profile_id: profile.id } });
    res.json({ success: true, data: info });
  } catch (error) { next(error); }
};

// POST/PUT /api/candidates/payment-info
// Tạo hoặc cập nhật thông tin thanh toán của ứng viên
exports.upsertPaymentInfo = async (req, res, next) => {
  try {
    const { account_holder_name, bank_name, account_number } = req.body;
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });
    const [info, created] = await PaymentInformation.findOrCreate({
      where: { candidate_profile_id: profile.id },
      defaults: { account_holder_name, bank_name, account_number },
    });
    if (!created) await info.update({ account_holder_name, bank_name, account_number });
    res.json({ success: true, data: info });
  } catch (error) { next(error); }
};

// Quá hạn = đã qua hết ngày deadline mà task vẫn chưa gửi duyệt (giống bảng Kanban)
const isTaskOverdue = (t) => {
  if (!t.deadline || !['TODO', 'IN_PROGRESS'].includes(t.status)) return false;
  const end = new Date(t.deadline);
  end.setHours(23, 59, 59, 999);
  return end < new Date();
};

// Đếm task theo trạng thái
const summarizeTasks = (tasks) => ({
  total: tasks.length,
  TODO: tasks.filter(t => t.status === 'TODO').length,
  IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
  DONE: tasks.filter(t => t.status === 'DONE').length,
  overdue: tasks.filter(isTaskOverdue).length,
  needs_revision: tasks.filter(t => t.status === 'IN_PROGRESS' && t.review_status === 'REVISION_REQUIRED').length,
});

// GET /api/candidates/workspaces — list workspaces the candidate is in
// Lấy danh sách workspace ứng viên đang (hoặc đã) tham gia, kèm số task của mình và tiến độ chung
exports.getMyWorkspaces = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const members = await WorkspaceMember.findAll({
      // REMOVED = đã bị xóa khỏi workspace → không hiển thị
      where: { candidate_profile_id: profile.id, status: { [Op.in]: ['ACTIVE', 'COMPLETED'] } },
      include: [
        {
          model: Workspace,
          attributes: ['id', 'name', 'status'],
          include: [{ model: InternalProject, attributes: ['id', 'name', 'status', 'expected_end_date'] }],
        },
        { model: ProjectJob, attributes: ['id', 'title'] },
      ],
      order: [['joined_at', 'DESC']],
    });
    if (!members.length) return res.json({ success: true, data: [] });

    const tasks = await Task.findAll({
      where: { workspace_id: { [Op.in]: members.map(m => m.workspace_id) }, status: { [Op.ne]: 'CANCELLED' } },
      attributes: ['id', 'workspace_id', 'status', 'deadline', 'review_status'],
      include: [{ model: WorkspaceMember, as: 'Assignees', attributes: ['id'], through: { attributes: [] } }],
    });

    const data = members.map(m => {
      const wsTasks = tasks.filter(t => t.workspace_id === m.workspace_id);
      const mine = wsTasks.filter(t => t.Assignees.some(a => a.id === m.id));
      return {
        ...m.toJSON(),
        total_tasks: wsTasks.length,
        done_tasks: wsTasks.filter(t => t.status === 'DONE').length,
        my_tasks: summarizeTasks(mine),
      };
    });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// GET /api/candidates/my-tasks — tất cả task được giao cho mình ở các workspace đang tham gia
exports.getMyTasks = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const members = await WorkspaceMember.findAll({
      where: { candidate_profile_id: profile.id, status: 'ACTIVE' },
      attributes: ['id'],
    });
    if (!members.length) return res.json({ success: true, data: [] });

    const tasks = await Task.findAll({
      where: { status: { [Op.ne]: 'CANCELLED' } },
      attributes: ['id', 'title', 'status', 'priority', 'deadline', 'review_status', 'workspace_id', 'updated_at'],
      include: [
        // Chỉ lấy task có mình trong danh sách người thực hiện
        { model: WorkspaceMember, as: 'Assignees', attributes: ['id'], through: { attributes: [] }, where: { id: { [Op.in]: members.map(m => m.id) } } },
        { model: SubTask, as: 'SubTasks', attributes: ['id', 'is_done'] },
        { model: Workspace, attributes: ['id', 'name'], include: [{ model: InternalProject, attributes: ['id', 'name'] }] },
      ],
    });

    // Thứ tự ưu tiên: quá hạn → đang làm/cần làm → chờ duyệt → đã hoàn thành; cùng nhóm thì deadline gần trước
    const rank = (t) => (t.status === 'DONE' ? 3 : isTaskOverdue(t) ? 0 : t.status === 'REVIEW' ? 2 : 1);
    const deadlineOf = (t) => (t.deadline ? new Date(t.deadline).getTime() : Number.MAX_SAFE_INTEGER);
    tasks.sort((a, b) => rank(a) - rank(b) || deadlineOf(a) - deadlineOf(b));

    res.json({ success: true, data: tasks.map(t => ({ ...t.toJSON(), is_overdue: isTaskOverdue(t) })) });
  } catch (error) { next(error); }
};

// GET /api/candidates/payments — payment history
// Lấy lịch sử thanh toán của ứng viên
exports.getMyPayments = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const { Payment, WorkspaceMember: WM } = require('../models');
    const payments = await Payment.findAll({
      include: [{
        model: WM,
        where: { candidate_profile_id: profile.id },
        include: [
          {
            model: Workspace,
            attributes: ['id', 'name'],
            include: [{ model: InternalProject, attributes: ['id', 'name', 'status'] }],
          },
          {
            model: ProjectJob,
            attributes: ['id', 'title', 'budget'],
          },
        ],
      }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};

// ── CV Management (Multiple CVs) ──────────────────────
// GET /api/candidates/cvs
exports.getMyCvs = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });

    // Auto-migrate legacy profile.cv_url if CandidateCv is empty
    const count = await CandidateCv.count({ where: { candidate_profile_id: profile.id } });
    if (count === 0 && profile.cv_url) {
      await CandidateCv.create({
        candidate_profile_id: profile.id,
        name: profile.cv_name || 'CV Mặc định',
        file_url: profile.cv_url,
        file_name: profile.cv_name || 'CV_Profile.pdf',
        is_default: true,
      });
    }

    const cvs = await CandidateCv.findAll({
      where: { candidate_profile_id: profile.id },
      order: [
        ['is_default', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });

    res.json({ success: true, data: cvs });
  } catch (error) { next(error); }
};

// POST /api/candidates/cvs
exports.addCv = async (req, res, next) => {
  try {
    const { name, file_url, file_name, file_size, is_default } = req.body;
    if (!file_url || !file_name) throw new AppError('File CV không hợp lệ', 400);

    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });

    const totalCount = await CandidateCv.count({ where: { candidate_profile_id: profile.id } });
    const shouldBeDefault = is_default || totalCount === 0;

    if (shouldBeDefault) {
      await CandidateCv.update({ is_default: false }, { where: { candidate_profile_id: profile.id } });
      await profile.update({ cv_url: file_url, cv_name: name || file_name });
    }

    const newCv = await CandidateCv.create({
      candidate_profile_id: profile.id,
      name: name || file_name,
      file_url,
      file_name,
      file_size,
      is_default: shouldBeDefault,
    });

    // CV mặc định mới: lọc kỹ năng từ CV và tự thêm vào hồ sơ
    const addedSkills = (shouldBeDefault && !req.body.skip_auto_extract) ? await extractSkillsFromCv(profile.id, file_url) : [];

    res.status(201).json({ success: true, data: newCv, added_skills: addedSkills });
  } catch (error) { next(error); }
};

// PUT /api/candidates/cvs/:id/default
exports.setDefaultCv = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Không tìm thấy hồ sơ ứng viên', 404);

    const cv = await CandidateCv.findOne({
      where: { id: req.params.id, candidate_profile_id: profile.id },
    });
    if (!cv) throw new AppError('CV không tồn tại', 404);

    await CandidateCv.update({ is_default: false }, { where: { candidate_profile_id: profile.id } });
    await cv.update({ is_default: true });
    await profile.update({ cv_url: cv.file_url, cv_name: cv.name || cv.file_name });

    const addedSkills = await extractSkillsFromCv(profile.id, cv.file_url);

    res.json({ success: true, data: cv, added_skills: addedSkills });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/cvs/:id
exports.deleteCv = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Không tìm thấy hồ sơ ứng viên', 404);

    const cv = await CandidateCv.findOne({
      where: { id: req.params.id, candidate_profile_id: profile.id },
    });
    if (!cv) throw new AppError('CV không tồn tại', 404);

    const wasDefault = cv.is_default;
    await cv.destroy();

    // If deleted CV was default, pick another one if available
    if (wasDefault) {
      const nextDefault = await CandidateCv.findOne({
        where: { candidate_profile_id: profile.id },
        order: [['created_at', 'DESC']],
      });
      if (nextDefault) {
        await nextDefault.update({ is_default: true });
        await profile.update({ cv_url: nextDefault.file_url, cv_name: nextDefault.name || nextDefault.file_name });
      } else {
        await profile.update({ cv_url: null, cv_name: null });
      }
    }

    res.json({ success: true, message: 'Đã xóa CV thành công' });
  } catch (error) { next(error); }
};

// GET /api/employer/candidates — Employer searches for candidates
exports.searchCandidates = async (req, res, next) => {
  try {
    const { keyword, skill_id, score_min, score_max, address, page = 1, limit = 12 } = req.query;
    const where = {};
    if (address) where.address = { [Op.iLike]: `%${address}%` };
    if (score_min || score_max) {
      where.competency_score = {};
      if (score_min) where.competency_score[Op.gte] = parseFloat(score_min);
      if (score_max) where.competency_score[Op.lte] = parseFloat(score_max);
    }

    const include = [
      { model: User, attributes: ['full_name'] },
      {
        model: Skill,
        through: { attributes: ['source'] },
        attributes: ['id', 'name'],
        ...(skill_id ? { where: { id: skill_id }, required: true } : {}),
      },
    ];

    if (keyword) {
      where[Op.or] = [
        { professional_title: { [Op.iLike]: `%${keyword}%` } },
        { introduction: { [Op.iLike]: `%${keyword}%` } },
        { '$User.full_name$': { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await CandidateProfile.findAndCountAll({
      where,
      // Kèm số dự án đã tham gia + số task đã được nghiệm thu để nhà tuyển dụng nhìn thẻ là biết kinh nghiệm thực chiến
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM workspace_members AS wm WHERE wm.candidate_profile_id = "CandidateProfile"."id")'), 'project_count'],
          [sequelize.literal(`(SELECT COUNT(*) FROM task_assignees AS ta
              JOIN tasks AS t ON t.id = ta.task_id
              JOIN workspace_members AS wm ON wm.id = ta.workspace_member_id
             WHERE wm.candidate_profile_id = "CandidateProfile"."id" AND t.status = 'DONE')`), 'done_task_count'],
        ],
      },
      include,
      limit: parseInt(limit),
      offset,
      order: [['competency_score', 'DESC']],
      distinct: true,
      subQuery: false,
    });

    // Gắn minh chứng dự án cho từng kỹ năng để thẻ ứng viên highlight được
    const evidenceByProfile = await getEvidenceForProfiles(rows.map((r) => r.id));
    const data = rows.map((r) => {
      const j = r.toJSON();
      const ev = evidenceByProfile.get(r.id) || new Map();
      j.Skills = (j.Skills || [])
        .map((sk) => ({ ...sk, evidence: ev.get(sk.id) || [] }))
        .sort((a, b) => (b.evidence.length > 0) - (a.evidence.length > 0));
      return j;
    });
    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) { next(error); }
};


// Tổng số tháng kinh nghiệm từ các mốc làm việc (gộp phần thời gian chồng nhau để không tính trùng)
function totalExperienceMonths(experiences) {
  const now = Date.now();
  const spans = experiences
    .filter((e) => e.start_date)
    .map((e) => [new Date(e.start_date).getTime(), e.end_date ? new Date(e.end_date).getTime() : now])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let cur = null;
  for (const [s, e] of spans) {
    if (!cur) cur = [s, e];
    else if (s <= cur[1]) cur[1] = Math.max(cur[1], e);
    else { total += cur[1] - cur[0]; cur = [s, e]; }
  }
  if (cur) total += cur[1] - cur[0];
  return Math.round(total / (1000 * 60 * 60 * 24 * 30.4375));
}

// GET /api/employer/candidates/:id — hồ sơ đầy đủ của một ứng viên (dành cho Nhà tuyển dụng)
// Gồm: thông tin, kỹ năng, kinh nghiệm, CV, và đặc biệt là các dự án thật đã làm trên DevHub kèm đóng góp + đánh giá.
// Email / số điện thoại chỉ hiện với doanh nghiệp đã được Admin xác thực.
exports.getCandidateForEmployer = async (req, res, next) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw new AppError('Không tìm thấy ứng viên', 404);
    const company = await Company.findOne({ where: { user_id: req.user.id }, attributes: ['id', 'verification_status'] });
    const contactAllowed = company?.verification_status === 'VERIFIED';

    const profile = await CandidateProfile.findByPk(req.params.id, {
      attributes: ['id', 'professional_title', 'introduction', 'phone', 'address', 'github_url', 'portfolio_url', 'avatar_url', 'cv_url', 'cv_name', 'competency_score'],
      include: [
        { model: User, attributes: ['full_name', 'email'] },
        { model: Skill, through: { attributes: ['source'] }, attributes: ['id', 'name'] },
        { model: Experience, separate: true, order: [['start_date', 'DESC']] },
        { model: CandidateCv, as: 'cvs', separate: true, order: [['is_default', 'DESC'], ['created_at', 'DESC']], attributes: ['id', 'name', 'file_url', 'file_name', 'file_size', 'is_default'] },
      ],
    });
    if (!profile) throw new AppError('Không tìm thấy ứng viên', 404);

    // Các dự án đã tham gia trong Workspace của DevHub
    const members = await WorkspaceMember.findAll({
      where: { candidate_profile_id: profile.id },
      include: [
        {
          model: Workspace,
          attributes: ['id', 'name'],
          include: [{ model: InternalProject, attributes: ['id', 'name', 'description', 'status', 'start_date', 'expected_end_date', 'actual_end_date'] }],
        },
        { model: ProjectJob, attributes: ['id', 'title'], include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }] },
        { model: CandidateEvaluation, attributes: ['score', 'comment', 'evaluated_at'] },
      ],
      order: [['joined_at', 'DESC']],
    });

    // Đóng góp của ứng viên trong từng dự án: số task được giao / đã nghiệm thu / nộp đúng hạn
    const memberIds = members.map((m) => m.id);
    const statRows = memberIds.length ? (await sequelize.query(
      `SELECT ta.workspace_member_id AS member_id,
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE t.status = 'DONE') AS done,
              COUNT(*) FILTER (WHERE t.status = 'DONE' AND (
                t.deadline IS NULL
                OR COALESCE((SELECT MAX(s.submitted_at) FROM task_submissions s WHERE s.task_id = t.id), t.reviewed_at, t.updated_at) < (t.deadline::date + 1)
              )) AS on_time
         FROM task_assignees ta JOIN tasks t ON t.id = ta.task_id
        WHERE ta.workspace_member_id IN (:ids) AND t.status <> 'CANCELLED'
        GROUP BY ta.workspace_member_id`,
      { replacements: { ids: memberIds }, type: sequelize.QueryTypes.SELECT }
    )) : [];
    const statsByMember = new Map(statRows.map((r) => [r.member_id, { total: Number(r.total), done: Number(r.done), on_time: Number(r.on_time) }]));

    const projects = members.map((m) => {
      const j = m.toJSON();
      const stats = statsByMember.get(m.id) || { total: 0, done: 0, on_time: 0 };
      return {
        member_id: j.id,
        role: j.role,
        member_status: j.status,
        joined_at: j.joined_at,
        position: j.ProjectJob?.title || null,
        skills: j.ProjectJob?.Skills || [],
        workspace_id: j.Workspace?.id || null,
        project: j.Workspace?.Project || j.Workspace?.InternalProject || null,
        tasks: stats,
        evaluation: j.CandidateEvaluation || null,
      };
    });

    const totals = projects.reduce((acc, p) => ({
      total: acc.total + p.tasks.total, done: acc.done + p.tasks.done, on_time: acc.on_time + p.tasks.on_time,
    }), { total: 0, done: 0, on_time: 0 });

    // Hồ sơ của ứng viên này đã nộp vào các tin của chính doanh nghiệp (để nhà tuyển dụng quay lại xử lý)
    const applications = company ? (await Application.findAll({
      where: { candidate_profile_id: profile.id },
      attributes: ['id', 'status', 'applied_at'],
      include: [{ model: JobPost, where: { company_id: company.id }, attributes: ['id', 'title'] }],
      order: [['applied_at', 'DESC']],
    })).map((a) => ({ id: a.id, status: a.status, applied_at: a.applied_at, job_id: a.JobPost.id, job_title: a.JobPost.title })) : [];

    const p = profile.toJSON();
    const evidenceMap = (await getEvidenceForProfiles([profile.id])).get(profile.id) || new Map();
    res.json({
      success: true,
      data: {
        id: p.id,
        full_name: p.User?.full_name,
        avatar_url: p.avatar_url,
        professional_title: p.professional_title,
        introduction: p.introduction,
        address: p.address,
        github_url: p.github_url,
        portfolio_url: p.portfolio_url,
        cv_url: p.cv_url,
        cv_name: p.cv_name,
        competency_score: p.competency_score,
        contact_locked: !contactAllowed,
        email: contactAllowed ? p.User?.email : null,
        phone: contactAllowed ? p.phone : null,
        skills: (p.Skills || []).map((s) => ({ id: s.id, name: s.name, source: s.CandidateSkill?.source, evidence: evidenceMap.get(s.id) || [] })),
        experiences: p.Experiences || [],
        cvs: p.cvs || [],
        projects,
        applications,
        summary: {
          project_count: projects.length,
          completed_projects: projects.filter((x) => x.project?.status === 'COMPLETED' || x.member_status === 'COMPLETED').length,
          evaluation_count: projects.filter((x) => x.evaluation).length,
          tasks_total: totals.total,
          tasks_done: totals.done,
          tasks_on_time: totals.on_time,
          experience_months: totalExperienceMonths((p.Experiences || []).filter((e) => e.type === 'COMPANY' || e.type === 'FREELANCE')),
        },
      },
    });
  } catch (error) { next(error); }
};
