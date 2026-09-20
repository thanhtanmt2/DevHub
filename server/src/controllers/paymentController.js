const { Payment, WorkspaceMember, CandidateProfile, Workspace, InternalProject, User } = require('../models');
const AppError = require('../utils/AppError');

// POST /api/admin/payments
exports.createPayment = async (req, res, next) => {
  try {
    const { workspace_member_id, amount, note } = req.body;
    
    const member = await WorkspaceMember.findByPk(workspace_member_id);
    if (!member) throw new AppError('Workspace member not found', 404);

    const payment = await Payment.create({
      workspace_member_id,
      amount,
      note,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
};

// PUT /api/admin/payments/:id/process
exports.processPayment = async (req, res, next) => {
  try {
    const { status, transaction_id } = req.body; // PENDING -> PROCESSING -> PAID
    if (!['PROCESSING', 'PAID', 'FAILED'].includes(status)) throw new AppError('Invalid status', 400);

    const payment = await Payment.findByPk(req.params.id);
    if (!payment) throw new AppError('Payment not found', 404);

    const updateData = { status, transaction_id };
    if (status === 'PAID') {
      updateData.payment_date = new Date();
    }

    await payment.update(updateData);
    res.json({ success: true, data: payment });
  } catch (error) { next(error); }
};

// GET /api/admin/payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: WorkspaceMember,
        include: [
          { model: CandidateProfile, include: [{ model: User, attributes: ['full_name', 'email'] }] },
          { model: Workspace, attributes: ['name'] }
        ]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};
