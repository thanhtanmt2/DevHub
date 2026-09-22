const { CandidateProfile, CandidateCv, Experience, Skill, CandidateSkill, PaymentInformation, User, CandidateEvaluation, WorkspaceMember, Workspace, InternalProject } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/candidates/profile
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
      // Auto-create empty profile
      profile = await CandidateProfile.create({ user_id: req.user.id });
    }
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};

// PUT /api/candidates/profile
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
exports.getExperiences = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const experiences = await Experience.findAll({ where: { candidate_profile_id: profile.id }, order: [['start_date', 'DESC']] });
    res.json({ success: true, data: experiences });
  } catch (error) { next(error); }
};

// POST /api/candidates/experiences
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
exports.getPaymentInfo = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: null });
    const info = await PaymentInformation.findOne({ where: { candidate_profile_id: profile.id } });
    res.json({ success: true, data: info });
  } catch (error) { next(error); }
};

// POST/PUT /api/candidates/payment-info
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

// GET /api/candidates/workspaces — list workspaces the candidate is in
exports.getMyWorkspaces = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const members = await WorkspaceMember.findAll({
      where: { candidate_profile_id: profile.id },
      include: [{
        model: Workspace,
        include: [{ model: InternalProject, attributes: ['id', 'name', 'status', 'completion_rate'] }],
      }],
    });
    res.json({ success: true, data: members });
  } catch (error) { next(error); }
};

// GET /api/candidates/payments — payment history
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
