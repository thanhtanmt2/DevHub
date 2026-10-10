// nạp các bảng liên quan đến ứng viên trong model 
const { CandidateProfile, CandidateCv, Experience, Skill, CandidateSkill, PaymentInformation, User, CandidateEvaluation, WorkspaceMember, Workspace, InternalProject, Task, SubTask, ProjectJob } = require('../models');
const { Op } = require('sequelize');
// nạp class AppError để hiển thị lỗi 
const AppError = require('../utils/AppError');

// GET /api/candidates/profile
// Lấy thông tin hồ sơ của ứng viên
exports.getMyProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: Skill, through: { attributes: ['level', 'years_of_experience'] } },
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
    const skills = await CandidateSkill.findAll({
      where: { candidate_profile_id: profile.id },
      include: [{ model: Skill, attributes: ['id', 'name'] }],
    });
    res.json({ success: true, data: skills });
  } catch (error) { next(error); }
};

// POST /api/candidates/skills
// Thêm kỹ năng cho ứng viên
exports.addSkill = async (req, res, next) => {
  try {
    const { skill_id, level, years_of_experience } = req.body;
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });
    const existing = await CandidateSkill.findOne({ where: { candidate_profile_id: profile.id, skill_id } });
    if (existing) throw new AppError('Skill already added', 409);
    const cs = await CandidateSkill.create({ candidate_profile_id: profile.id, skill_id, level, years_of_experience });
    res.status(201).json({ success: true, data: cs });
  } catch (error) { next(error); }
};

// PUT /api/candidates/skills/:skill_id
// Cập nhật kỹ năng của ứng viên
exports.updateSkill = async (req, res, next) => {
  try {
    const { skill_id } = req.params;
    const { level, years_of_experience } = req.body;
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);
    const cs = await CandidateSkill.findOne({ where: { candidate_profile_id: profile.id, skill_id } });
    if (!cs) throw new AppError('Skill not found', 404);
    await cs.update({ level, years_of_experience });
    res.json({ success: true, data: cs });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/skills/:skill_id
// Xóa kỹ năng của ứng viên
exports.removeSkill = async (req, res, next) => {
  try {
    const { skill_id } = req.params;
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);
    const deleted = await CandidateSkill.destroy({ where: { candidate_profile_id: profile.id, skill_id } });
    if (!deleted) throw new AppError('Skill not found', 404);
    res.json({ success: true, message: 'Skill removed' });
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

// POST /api/candidates/experiences
// Thêm kinh nghiệm cho ứng viên
exports.addExperience = async (req, res, next) => {
  try {
    const { job_title, company_name, start_date, end_date, description } = req.body;
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });
    const exp = await Experience.create({ candidate_profile_id: profile.id, job_title, company_name, start_date, end_date, description });
    res.status(201).json({ success: true, data: exp });
  } catch (error) { next(error); }
};

// PUT /api/candidates/experiences/:id
// Cập nhật kinh nghiệm của ứng viên
exports.updateExperience = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);
    const exp = await Experience.findOne({ where: { id: req.params.id, candidate_profile_id: profile.id } });
    if (!exp) throw new AppError('Experience not found', 404);
    await exp.update(req.body);
    res.json({ success: true, data: exp });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/experiences/:id
// Xóa kinh nghiệm của ứng viên
exports.deleteExperience = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);
    const deleted = await Experience.destroy({ where: { id: req.params.id, candidate_profile_id: profile.id } });
    if (!deleted) throw new AppError('Experience not found', 404);
    res.json({ success: true, message: 'Experience deleted' });
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
          include: [{ model: InternalProject, attributes: ['id', 'name', 'status', 'expected_end_date', 'manager_id'] }],
        },
        { model: ProjectJob, attributes: ['id', 'title'] },
      ],
      order: [['joined_at', 'DESC']],
    });
    if (!members.length) return res.json({ success: true, data: [] });

    const tasks = await Task.findAll({
      where: { workspace_id: { [Op.in]: members.map(m => m.workspace_id) }, status: { [Op.ne]: 'CANCELLED' } },
      attributes: ['id', 'workspace_id', 'status', 'deadline', 'review_status', 'completion_rate'],
      include: [{ model: WorkspaceMember, as: 'Assignees', attributes: ['id'], through: { attributes: [] } }],
    });

    const data = members.map(m => {
      const wsTasks = tasks.filter(t => t.workspace_id === m.workspace_id);
      const mine = wsTasks.filter(t => t.Assignees.some(a => a.id === m.id));
      return {
        ...m.toJSON(),
        is_project_manager: m.Workspace?.Project?.manager_id === profile.id,
        // Tiến độ chung = trung bình % hoàn thành các task của workspace (giống tab Thống kê)
        progress: wsTasks.length
          ? Math.round(wsTasks.reduce((sum, t) => sum + (t.completion_rate || 0), 0) / wsTasks.length)
          : 0,
        total_tasks: wsTasks.length,
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
      attributes: ['id', 'title', 'status', 'priority', 'deadline', 'review_status', 'completion_rate', 'workspace_id', 'updated_at'],
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
        include: [{ model: Workspace, attributes: ['id', 'name'] }],
      }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};

// GET /api/candidates/:id/public — public profile for employers
// Lấy hồ sơ công khai của ứng viên
exports.getPublicProfile = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findByPk(req.params.id, {
      attributes: { exclude: ['user_id'] },
      include: [
        { model: Skill, through: { attributes: ['level', 'years_of_experience'] } },
        { model: Experience },
        { model: User, attributes: ['full_name'] },
      ],
    });
    if (!profile) throw new AppError('Profile not found', 404);
    res.json({ success: true, data: profile });
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

    res.status(201).json({ success: true, data: newCv });
  } catch (error) { next(error); }
};

// PUT /api/candidates/cvs/:id/default
exports.setDefaultCv = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);

    const cv = await CandidateCv.findOne({
      where: { id: req.params.id, candidate_profile_id: profile.id },
    });
    if (!cv) throw new AppError('CV không tồn tại', 404);

    await CandidateCv.update({ is_default: false }, { where: { candidate_profile_id: profile.id } });
    await cv.update({ is_default: true });
    await profile.update({ cv_url: cv.file_url, cv_name: cv.name || cv.file_name });

    res.json({ success: true, data: cv });
  } catch (error) { next(error); }
};

// DELETE /api/candidates/cvs/:id
exports.deleteCv = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);

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

// GET /api/admin/candidates/search
exports.adminSearchCandidates = async (req, res, next) => {
  try {
    const { email, name, skill_ids, min_score, manager_status } = req.query;
    const { Op } = require('sequelize');
    const { Skill, Project } = require('../models');

    let userWhere = {};
    // If user provides a single string for both email or name, the frontend will probably send it as "query"
    // Let's support a general "q" param or email/name
    const q = req.query.q;
    if (q) {
      userWhere = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${q}%` } },
          { full_name: { [Op.iLike]: `%${q}%` } }
        ]
      };
    } else {
      if (email) userWhere.email = { [Op.iLike]: `%${email}%` };
      if (name) userWhere.full_name = { [Op.iLike]: `%${name}%` };
    }

    let profileWhere = {};
    if (min_score) {
      profileWhere.competency_score = { [Op.gte]: parseFloat(min_score) };
    }

    let includeSkills = [];
    if (skill_ids) {
      const ids = Array.isArray(skill_ids) ? skill_ids : [skill_ids];
      includeSkills = [
        {
          model: Skill,
          where: { id: { [Op.in]: ids } },
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ];
    } else {
      includeSkills = [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }];
    }

    // Determine manager status by left joining Projects where they are manager
    const candidates = await CandidateProfile.findAll({
      where: profileWhere,
      include: [
        { model: User, attributes: ['full_name', 'email'], where: userWhere },
        ...includeSkills,
        { model: Project, as: 'ManagedProjects', attributes: ['id', 'name', 'status'] }
      ],
      attributes: ['id', 'professional_title', 'competency_score'],
      limit: 20,
      order: [['competency_score', 'DESC']]
    });

    // Map manager status manually
    let result = candidates.map(c => {
      const cJson = c.toJSON();
      const activeProjects = cJson.ManagedProjects?.filter(p => p.status !== 'COMPLETED') || [];
      cJson.is_managing = activeProjects.length > 0;
      cJson.managed_project_names = activeProjects.map(p => p.name).join(', ');
      return cJson;
    });

    if (manager_status === 'AVAILABLE') {
      result = result.filter(c => !c.is_managing);
    } else if (manager_status === 'MANAGING_OTHER') {
      result = result.filter(c => c.is_managing);
    }

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
