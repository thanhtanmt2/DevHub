const { Company, User } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/employer/company
exports.getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

// POST /api/employer/company
exports.createCompany = async (req, res, next) => {
  try {
    const existing = await Company.findOne({ where: { user_id: req.user.id } });
    if (existing) throw new AppError('Company profile already exists', 409);
    const { name, tax_code, address, email, website, description } = req.body;
    const company = await Company.create({ user_id: req.user.id, name, tax_code, address, email, website, description });
    res.status(201).json({ success: true, data: company });
  } catch (error) { next(error); }
};

// PUT /api/employer/company
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);
    await company.update(req.body);
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

// GET /api/admin/companies — admin list all companies pending verification
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { verification_status } = req.query;
    const where = verification_status ? { verification_status } : {};
    const companies = await Company.findAll({
      where,
      include: [{ model: User, attributes: ['full_name', 'email'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: companies });
  } catch (error) { next(error); }
};

// PUT /api/admin/companies/:id/verify — admin verifies company
exports.verifyCompany = async (req, res, next) => {
  try {
    const { verification_status } = req.body; // VERIFIED or REJECTED
    if (!['VERIFIED', 'REJECTED'].includes(verification_status)) throw new AppError('Invalid status', 400);
    const company = await Company.findByPk(req.params.id);
    if (!company) throw new AppError('Company not found', 404);
    await company.update({ verification_status });
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};
