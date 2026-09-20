const { Skill, CandidateSkill, JobPostSkill } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/admin/skills — all skills with usage count
exports.getAllSkills = async (req, res, next) => {
  try {
    const skills = await Skill.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: skills });
  } catch (error) { next(error); }
};

// POST /api/admin/skills
exports.createSkill = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const existing = await Skill.findOne({ where: { name } });
    if (existing) throw new AppError('Skill name already exists', 409);
    const skill = await Skill.create({ name, description });
    res.status(201).json({ success: true, data: skill });
  } catch (error) { next(error); }
};

// PUT /api/admin/skills/:id
exports.updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) throw new AppError('Skill not found', 404);
    await skill.update(req.body);
    res.json({ success: true, data: skill });
  } catch (error) { next(error); }
};

// DELETE /api/admin/skills/:id (soft delete → INACTIVE)
exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) throw new AppError('Skill not found', 404);
    await skill.update({ status: 'INACTIVE' });
    res.json({ success: true, message: 'Skill deactivated' });
  } catch (error) { next(error); }
};

// GET /api/skills — public list of active skills
exports.getPublicSkills = async (req, res, next) => {
  try {
    const skills = await Skill.findAll({ where: { status: 'ACTIVE' }, order: [['name', 'ASC']], attributes: ['id', 'name'] });
    res.json({ success: true, data: skills });
  } catch (error) { next(error); }
};
