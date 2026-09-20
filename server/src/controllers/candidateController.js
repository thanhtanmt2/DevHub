const { CandidateProfile, Experience, Skill, CandidateSkill, PaymentInformation, User, CandidateEvaluation, WorkspaceMember, Workspace, InternalProject } = require('../models');
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
    const { professional_title, introduction, phone, address, github_url, portfolio_url } = req.body;
    let profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) profile = await CandidateProfile.create({ user_id: req.user.id });
    await profile.update({ professional_title, introduction, phone, address, github_url, portfolio_url });
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
