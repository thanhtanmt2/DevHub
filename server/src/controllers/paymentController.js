const { Payment, WorkspaceMember, CandidateProfile, Workspace, InternalProject, ProjectJob, User, PaymentInformation } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('./notificationController');

// GET /api/admin/payments/members — Danh sách thành viên trong các Workspace để tạo thanh toán
exports.getPayableMembers = async (req, res, next) => {
  try {
    const members = await WorkspaceMember.findAll({
      where: { status: { [Op.in]: ['ACTIVE', 'COMPLETED'] } },
      include: [
        {
          model: CandidateProfile,
          attributes: ['id', 'professional_title', 'user_id'],
          include: [
            { model: User, attributes: ['id', 'full_name', 'email'] },
            { model: PaymentInformation, attributes: ['bank_name', 'account_number', 'account_holder_name'] },
          ],
        },
        {
          model: Workspace,
          attributes: ['id', 'name', 'status', 'project_id'],
          include: [{ model: InternalProject, attributes: ['id', 'name', 'status', 'budget'] }],
        },
        {
          model: ProjectJob,
          attributes: ['id', 'title', 'budget'],
        },
        {
          model: Payment,
          attributes: ['id', 'amount', 'status', 'transaction_code', 'paid_at', 'created_at'],
        },
      ],
      order: [['joined_at', 'DESC']],
    });

    res.json({ success: true, data: members });
  } catch (error) { next(error); }
};

// POST /api/admin/payments
exports.createPayment = async (req, res, next) => {
  try {
    const { workspace_member_id, amount, payment_method } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 1000) {
      throw new AppError('Số tiền thanh toán phải từ 1.000đ trở lên', 400);
    }

    const member = await WorkspaceMember.findByPk(workspace_member_id, {
      include: [
        { model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] },
        { model: Workspace, attributes: ['id', 'name'] },
        { model: ProjectJob, attributes: ['id', 'title'] },
      ],
    });
    if (!member) throw new AppError('Không tìm thấy thành viên trong Workspace', 404);

    const payment = await Payment.create({
      workspace_member_id,
      amount: numericAmount,
      payment_method: payment_method || 'BANK_TRANSFER',
      status: 'PENDING',
    });

    const u = member.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_CREATED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Thanh toán ${numericAmount.toLocaleString('vi-VN')}đ cho ${u.full_name}`,
        description: `Tạo yêu cầu thanh toán ${numericAmount.toLocaleString('vi-VN')} VND cho ${u.full_name}${member.Workspace?.name ? ` (${member.Workspace.name})` : ''}`,
        metadata: { workspace_member_id, workspace_id: member.workspace_id },
      });
      await createNotification({
        user_id: u.id,
        type: 'PAYMENT_UPDATE',
        title: 'Có khoản thanh toán mới cho bạn',
        message: `Admin vừa tạo khoản thanh toán ${numericAmount.toLocaleString('vi-VN')}đ cho bạn${member.Workspace?.name ? ` tại ${member.Workspace.name}` : ''}. Hãy kiểm tra thông tin nhận tiền trong hồ sơ.`,
        link: '/candidate/profile?tab=payment',
        metadata: { payment_id: payment.id },
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
};

// PUT /api/admin/payments/:id/process
exports.processPayment = async (req, res, next) => {
  try {
    const { status, transaction_code, payment_method } = req.body; // PENDING -> PROCESSING -> PAID
    if (!['PROCESSING', 'PAID', 'FAILED'].includes(status)) throw new AppError('Trạng thái thanh toán không hợp lệ', 400);

    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: WorkspaceMember,
        include: [
          { model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] },
          { model: Workspace, attributes: ['id', 'name'] },
        ],
      }],
    });
    if (!payment) throw new AppError('Không tìm thấy khoản thanh toán', 404);

    const updateData = { status };
    if (transaction_code !== undefined) {
      updateData.transaction_code = String(transaction_code).trim() || null;
    }
    if (payment_method !== undefined) {
      updateData.payment_method = payment_method;
    } else if (status === 'PAID' && !payment.payment_method) {
      updateData.payment_method = 'VIETQR';
    }
    if (status === 'PAID') {
      updateData.paid_at = new Date();
    }

    await payment.update(updateData);

    const u = payment.WorkspaceMember?.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_PROCESSED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Thanh toán ${Number(payment.amount).toLocaleString('vi-VN')}đ cho ${u.full_name}`,
        new_value: status,
        description: `Cập nhật trạng thái thanh toán của ${u.full_name} thành ${status}${updateData.transaction_code ? ` (Mã GD: ${updateData.transaction_code})` : ''}`,
        metadata: { workspace_member_id: payment.workspace_member_id },
      });
      const PAY_NOTICE = {
        PROCESSING: ['Khoản thanh toán đang được xử lý', 'đang được xử lý'],
        PAID: ['Bạn đã được thanh toán thù lao', 'đã được chuyển khoản thành công'],
        FAILED: ['Thanh toán không thành công', 'chưa thanh toán được, vui lòng kiểm tra lại thông tin tài khoản ngân hàng trong hồ sơ'],
      };
      await createNotification({
        user_id: u.id,
        type: 'PAYMENT_UPDATE',
        title: PAY_NOTICE[status][0],
        message: `Khoản thanh toán ${Number(payment.amount).toLocaleString('vi-VN')}đ của bạn${payment.WorkspaceMember?.Workspace?.name ? ` (${payment.WorkspaceMember.Workspace.name})` : ''} ${PAY_NOTICE[status][1]}.${updateData.transaction_code ? ` Mã giao dịch: ${updateData.transaction_code}.` : ''}`,
        link: '/candidate/profile?tab=payment',
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
          {
            model: CandidateProfile,
            include: [
              { model: User, attributes: ['full_name', 'email'] },
              { model: PaymentInformation, attributes: ['bank_name', 'account_number', 'account_holder_name'] },
            ],
          },
          {
            model: Workspace,
            attributes: ['id', 'name', 'project_id'],
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
