const { Skill, CandidateSkill, JobPostSkill, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

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
    let { name, description } = req.body;
    name = name.trim(); // Loại bỏ khoảng trắng thừa ở 2 đầu
    
    // Kiểm tra trùng lặp không phân biệt hoa thường bằng Op.iLike của PostgreSQL
    const existing = await Skill.findOne({ 
      where: { 
        name: { [Op.iLike]: name } 
      }
    });
    if (existing) throw new AppError(`Kỹ năng '${name}' đã tồn tại trong hệ thống`, 409);
    
    const skill = await Skill.create({ name, description: description?.trim() });
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
    if (!skill) throw new AppError('Không tìm thấy kỹ năng', 404);
    
    // Đổi trạng thái thành INACTIVE thay vì xóa vật lý
    await skill.update({ status: 'INACTIVE' });
    res.json({ success: true, message: 'Đã vô hiệu hóa kỹ năng' });
  } catch (error) { next(error); }
};

// GET /api/skills — public list of active skills
exports.getPublicSkills = async (req, res, next) => {
  try {
    const skills = await Skill.findAll({ where: { status: 'ACTIVE' }, order: [['name', 'ASC']], attributes: ['id', 'name'] });
    res.json({ success: true, data: skills });
  } catch (error) { next(error); }
};
