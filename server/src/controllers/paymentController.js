const { Payment, WorkspaceMember, CandidateProfile, Workspace, InternalProject, User, PaymentInformation } = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('./notificationController');

// POST /api/admin/payments
exports.createPayment = async (req, res, next) => {
  try {
    const { workspace_member_id, amount } = req.body;
    
    const member = await WorkspaceMember.findByPk(workspace_member_id, {
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });
    if (!member) throw new AppError('Workspace member not found', 404);

    const payment = await Payment.create({
      workspace_member_id,
      amount,
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
      await createNotification({
        user_id: u.id,
        type: 'PAYMENT_UPDATE',
        title: 'Có khoản thanh toán mới cho bạn',
        message: `Admin vừa tạo khoản thanh toán ${Number(amount).toLocaleString('vi-VN')}đ cho bạn. Hãy kiểm tra thông tin nhận tiền trong hồ sơ.`,
        link: '/candidate/profile',
        metadata: { payment_id: payment.id },
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
};

// PUT /api/admin/payments/:id/process
exports.processPayment = async (req, res, next) => {
  try {
    const { status, transaction_code } = req.body; // PENDING -> PROCESSING -> PAID
    if (!['PROCESSING', 'PAID', 'FAILED'].includes(status)) throw new AppError('Invalid status', 400);

    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: WorkspaceMember, include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }] }]
    });
    if (!payment) throw new AppError('Payment not found', 404);

    const updateData = { status, transaction_code };
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
      const PAY_NOTICE = {
        PROCESSING: ['Khoản thanh toán đang được xử lý', 'đang được xử lý'],
        PAID: ['Bạn đã được thanh toán', 'đã được thanh toán thành công'],
        FAILED: ['Thanh toán không thành công', 'chưa thanh toán được, vui lòng kiểm tra lại thông tin nhận tiền trong hồ sơ'],
      };
      await createNotification({
        user_id: u.id,
        type: 'PAYMENT_UPDATE',
        title: PAY_NOTICE[status][0],
        message: `Khoản thanh toán ${Number(payment.amount).toLocaleString('vi-VN')}đ của bạn ${PAY_NOTICE[status][1]}.${transaction_code ? ` Mã giao dịch: ${transaction_code}.` : ''}`,
        link: '/candidate/profile',
        metadata: { payment_id: payment.id, status },
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
          { model: CandidateProfile, include: [
            { model: User, attributes: ['full_name', 'email'] },
            { model: PaymentInformation, attributes: ['bank_name', 'account_number', 'account_holder_name'] }
          ]},
          { model: Workspace, attributes: ['name'] }
        ]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};
