const { Payment, WorkspaceMember, CandidateProfile, Workspace, InternalProject, User } = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');

// POST /api/admin/payments
exports.createPayment = async (req, res, next) => {
  try {
    const { workspace_member_id, amount, note } = req.body;
    
    const member = await WorkspaceMember.findByPk(workspace_member_id, {
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });
    if (!member) throw new AppError('Workspace member not found', 404);

    const payment = await Payment.create({
      workspace_member_id,
      amount,
      note,
      status: 'PENDING'
    });

    const u = member.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_CREATED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Thanh toán ${amount} cho ${u.full_name}`,
        description: `Tạo yêu cầu thanh toán ${amount.toLocaleString('vi-VN')} VND cho ${u.full_name}`,
        metadata: { workspace_member_id },
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
};

// PUT /api/admin/payments/:id/process
exports.processPayment = async (req, res, next) => {
  try {
    const { status, transaction_id } = req.body; // PENDING -> PROCESSING -> PAID
    if (!['PROCESSING', 'PAID', 'FAILED'].includes(status)) throw new AppError('Invalid status', 400);

    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: WorkspaceMember, include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }] }]
    });
    if (!payment) throw new AppError('Payment not found', 404);

    const updateData = { status, transaction_id };
    if (status === 'PAID') {
      updateData.payment_date = new Date();
    }

    await payment.update(updateData);

    const u = payment.WorkspaceMember?.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_PROCESSED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Thanh toán ${payment.amount} cho ${u.full_name}`,
        new_value: status,
        description: `Cập nhật trạng thái thanh toán của ${u.full_name} thành ${status}`,
        metadata: { workspace_member_id: payment.workspace_member_id },
      });
    }

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
