const {
  sequelize,
  Payment,
  WorkspaceMember,
  CandidateProfile,
  CandidateEvaluation,
  Workspace,
  InternalProject,
  ProjectJob,
  User,
  PaymentInformation,
} = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('./notificationController');

// Helper: gắn đầy đủ PaymentInformation theo candidate_profile_id
async function attachBankInfoToMembers(items, extractMember) {
  const profileIds = [
    ...new Set(
      items
        .map((it) => {
          const m = extractMember(it);
          return m?.candidate_profile_id || m?.CandidateProfile?.id;
        })
        .filter(Boolean)
    ),
  ];
  if (!profileIds.length) return items;

  const bankInfos = await PaymentInformation.findAll({
    where: { candidate_profile_id: { [Op.in]: profileIds } },
    attributes: ['candidate_profile_id', 'bank_name', 'account_number', 'account_holder_name'],
  });
  const bankByProfile = new Map(bankInfos.map((b) => [b.candidate_profile_id, b.toJSON()]));

  return items.map((it) => {
    const json = typeof it.toJSON === 'function' ? it.toJSON() : it;
    const m = extractMember(json);
    const pid = m?.candidate_profile_id || m?.CandidateProfile?.id;
    if (pid && m?.CandidateProfile) {
      m.CandidateProfile.PaymentInformation =
        bankByProfile.get(pid) || m.CandidateProfile.PaymentInformation || null;
    }
    return json;
  });
}

// GET /api/admin/payments/members — Danh sách thành viên trong các Workspace kèm trạng thái thanh toán & tiến độ task
exports.getPayableMembers = async (req, res, next) => {
  try {
    const members = await WorkspaceMember.findAll({
      where: { status: { [Op.in]: ['ACTIVE', 'COMPLETED'] } },
      include: [
        {
          model: CandidateProfile,
          attributes: ['id', 'professional_title', 'user_id', 'avatar_url'],
          include: [
            { model: User, attributes: ['id', 'full_name', 'email'] },
            { model: PaymentInformation, attributes: ['bank_name', 'account_number', 'account_holder_name'] },
          ],
        },
        {
          model: Workspace,
          attributes: ['id', 'name', 'status', 'project_id'],
          include: [{ model: InternalProject, attributes: ['id', 'name', 'status'] }],
        },
        {
          model: ProjectJob,
          attributes: ['id', 'title', 'budget'],
        },
        {
          model: CandidateEvaluation,
          attributes: ['id', 'score', 'comment', 'evaluated_at'],
        },
        {
          model: Payment,
          attributes: ['id', 'amount', 'status', 'payment_method', 'transaction_code', 'paid_at', 'created_at'],
        },
      ],
      order: [['joined_at', 'DESC']],
    });

    const memberIds = members.map((m) => m.id);
    const taskRows = memberIds.length
      ? await sequelize.query(
          `SELECT ta.workspace_member_id AS member_id,
                  COUNT(*) AS total_tasks,
                  COUNT(*) FILTER (WHERE t.status = 'DONE') AS done_tasks
             FROM task_assignees ta
             JOIN tasks t ON t.id = ta.task_id
            WHERE ta.workspace_member_id IN (:ids) AND t.status <> 'CANCELLED'
            GROUP BY ta.workspace_member_id`,
          { replacements: { ids: memberIds }, type: sequelize.QueryTypes.SELECT }
        )
      : [];
    const tasksByMember = new Map(
      taskRows.map((r) => [
        r.member_id,
        { total_tasks: Number(r.total_tasks || 0), done_tasks: Number(r.done_tasks || 0) },
      ])
    );

    const withBanks = await attachBankInfoToMembers(members, (m) => m);
    const data = withBanks.map((m) => ({
      ...m,
      task_stats: tasksByMember.get(m.id) || { total_tasks: 0, done_tasks: 0 },
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/payments — Tạo yêu cầu thanh toán (chống tạo trùng & chống tạo lại khi đã thanh toán)
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
        {
          model: Workspace,
          attributes: ['id', 'name'],
          include: [{ model: InternalProject, attributes: ['id', 'name'] }],
        },
        { model: ProjectJob, attributes: ['id', 'title', 'budget'] },
      ],
    });
    if (!member) throw new AppError('Không tìm thấy thành viên trong Workspace', 404);

    const projectName = member.Workspace?.Project?.name || member.Workspace?.name || 'Dự án';
    const existing = await Payment.findOne({ where: { workspace_member_id } });

    if (existing) {
      if (existing.status === 'PAID') {
        throw new AppError(
          `Thành viên ${member.CandidateProfile?.User?.full_name || ''} đã được thanh toán thù lao cho dự án "${projectName}" rồi, không thể tạo lại.`,
          409
        );
      }
      // Đã có khoản chưa thanh toán: chỉ cập nhật số tiền (không báo trùng), để thao tác lặp lại vẫn an toàn
      if (Number(existing.amount) !== numericAmount) await existing.update({ amount: numericAmount });
      return res.status(200).json({ success: true, data: existing, existing: true });
    }

    const payment = await Payment.create({
      workspace_member_id,
      amount: numericAmount,
      payment_method: payment_method || 'VIETQR',
      status: 'PENDING',
    });

    const u = member.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_CREATED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Thanh toán ${numericAmount.toLocaleString('vi-VN')}đ cho ${u.full_name}`,
        description: `Tạo yêu cầu thanh toán ${numericAmount.toLocaleString('vi-VN')} VND cho ${u.full_name} (${projectName})`,
        metadata: { workspace_member_id, workspace_id: member.workspace_id },
      });
      await createNotification({
        user_id: u.id,
        type: 'PAYMENT_UPDATE',
        title: 'Có khoản thanh toán mới cho bạn',
        message: `Admin vừa tạo khoản thanh toán ${numericAmount.toLocaleString('vi-VN')}đ cho bạn tại dự án "${projectName}". Hãy kiểm tra thông tin nhận tiền trong hồ sơ.`,
        link: '/candidate/profile?tab=payment',
        metadata: { payment_id: payment.id },
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError('Thành viên này đã có bản ghi thanh toán trong dự án này', 409));
    }
    next(error);
  }
};

// POST /api/admin/payments/batch-project — Tạo thanh toán hàng loạt cho các thành viên chưa có TT trong 1 Workspace
exports.createBatchProjectPayments = async (req, res, next) => {
  try {
    const { workspace_id } = req.body;
    if (!workspace_id) throw new AppError('Vui lòng chọn dự án / Workspace', 400);

    const workspace = await Workspace.findByPk(workspace_id, {
      include: [{ model: InternalProject, attributes: ['id', 'name'] }],
    });
    if (!workspace) throw new AppError('Không tìm thấy Workspace', 404);
    const projectName = workspace.Project?.name || workspace.name;

    const members = await WorkspaceMember.findAll({
      where: { workspace_id, status: { [Op.in]: ['ACTIVE', 'COMPLETED'] } },
      include: [
        { model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] },
        { model: ProjectJob, attributes: ['id', 'title', 'budget'] },
        { model: Payment },
      ],
    });

    let createdCount = 0;
    let skippedPaidOrPending = 0;
    let skippedNoBudget = 0;

    for (const m of members) {
      const existing = m.Payments?.[0] || null;
      if (existing) {
        skippedPaidOrPending += 1;
        continue;
      }

      const budget = Number(m.ProjectJob?.budget) || 0;
      if (budget < 1000) {
        skippedNoBudget += 1;
        continue;
      }

      const payment = await Payment.create({
        workspace_member_id: m.id,
        amount: budget,
        payment_method: 'VIETQR',
        status: 'PENDING',
      });
      createdCount += 1;

      const u = m.CandidateProfile?.User;
      if (u) {
        await logActivity(req, {
          action: 'PAYMENT_CREATED',
          entity_type: 'payment',
          entity_id: payment.id,
          entity_name: `Thanh toán ${budget.toLocaleString('vi-VN')}đ cho ${u.full_name}`,
          description: `Khởi tạo thanh toán ${budget.toLocaleString('vi-VN')} VND cho ${u.full_name} (${projectName})`,
          metadata: { workspace_member_id: m.id, workspace_id },
        });
        await createNotification({
          user_id: u.id,
          type: 'PAYMENT_UPDATE',
          title: 'Có khoản thanh toán mới cho bạn',
          message: `Khoản thù lao ${budget.toLocaleString('vi-VN')}đ tại dự án "${projectName}" đã được khởi tạo cho bạn.`,
          link: '/candidate/profile?tab=payment',
          metadata: { payment_id: payment.id },
        });
      }
    }

    res.json({
      success: true,
      created_count: createdCount,
      skipped_existing: skippedPaidOrPending,
      skipped_no_budget: skippedNoBudget,
      message:
        createdCount > 0
          ? `Đã tạo ${createdCount} khoản thanh toán mới cho dự án "${projectName}".`
          : `Tất cả thành viên hợp lệ trong dự án "${projectName}" đều đã có khoản thanh toán.`,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/payments/:id — Sửa số tiền khi khoản chưa thanh toán
exports.updatePayment = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 1000) {
      throw new AppError('Số tiền thanh toán phải từ 1.000đ trở lên', 400);
    }

    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: WorkspaceMember,
          include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }],
        },
      ],
    });
    if (!payment) throw new AppError('Không tìm thấy khoản thanh toán', 404);

    if (payment.status === 'PAID') {
      throw new AppError('Khoản này đã thanh toán. Hãy hoàn tác (đánh dấu chưa thanh toán) trước khi sửa số tiền', 400);
    }

    const oldAmount = Number(payment.amount);
    await payment.update({ amount: numericAmount });

    const u = payment.WorkspaceMember?.CandidateProfile?.User;
    if (u && oldAmount !== numericAmount) {
      await logActivity(req, {
        action: 'PAYMENT_PROCESSED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Cập nhật số tiền thanh toán cho ${u.full_name}`,
        old_value: String(oldAmount),
        new_value: String(numericAmount),
        description: `Điều chỉnh số tiền thanh toán của ${u.full_name}: ${oldAmount.toLocaleString('vi-VN')}đ → ${numericAmount.toLocaleString('vi-VN')}đ`,
        metadata: { workspace_member_id: payment.workspace_member_id },
      });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/payments/:id — Hủy / Xóa khoản thanh toán tạo nhầm (chỉ khi chưa thanh toán)
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: WorkspaceMember,
          include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }],
        },
      ],
    });
    if (!payment) throw new AppError('Không tìm thấy khoản thanh toán', 404);

    if (payment.status === 'PAID') {
      throw new AppError('Không thể xóa khoản đã thanh toán. Hãy hoàn tác trước nếu cần', 400);
    }

    const u = payment.WorkspaceMember?.CandidateProfile?.User;
    const amount = Number(payment.amount);
    await payment.destroy();

    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_PROCESSED',
        entity_type: 'payment',
        entity_id: req.params.id,
        entity_name: `Hủy yêu cầu thanh toán của ${u.full_name}`,
        description: `Đã hủy yêu cầu thanh toán ${amount.toLocaleString('vi-VN')}đ của ${u.full_name}`,
      });
    }

    res.json({ success: true, message: 'Đã hủy yêu cầu thanh toán' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/payments/:id/process { status: 'PAID' | 'PENDING', amount?, transaction_code? }
// Chỉ hai trạng thái: chưa thanh toán (PENDING) và đã thanh toán (PAID). Admin tự chuyển khoản (quét QR), rồi đánh dấu đã thanh toán;
// có thể sửa số tiền ngay lúc đó. PENDING dùng để hoàn tác khi đánh dấu nhầm. Không bắt buộc mã giao dịch.
exports.processPayment = async (req, res, next) => {
  try {
    const { status, amount, transaction_code } = req.body;
    if (!['PAID', 'PENDING'].includes(status)) {
      throw new AppError('Trạng thái thanh toán không hợp lệ', 400);
    }

    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: WorkspaceMember,
          include: [
            { model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] },
            {
              model: Workspace,
              attributes: ['id', 'name'],
              include: [{ model: InternalProject, attributes: ['id', 'name'] }],
            },
          ],
        },
      ],
    });
    if (!payment) throw new AppError('Không tìm thấy khoản thanh toán', 404);

    if (payment.status === status) {
      throw new AppError(status === 'PAID' ? 'Khoản này đã được đánh dấu là đã thanh toán' : 'Khoản này đang ở trạng thái chưa thanh toán', 400);
    }

    const updateData = { status };
    if (amount !== undefined) {
      if (payment.status === 'PAID') throw new AppError('Khoản này đã thanh toán. Hãy hoàn tác trước khi sửa số tiền', 400);
      const n = Number(amount);
      if (!Number.isFinite(n) || n < 1000) throw new AppError('Số tiền thanh toán phải từ 1.000đ trở lên', 400);
      updateData.amount = n;
    }
    if (status === 'PAID') {
      updateData.paid_at = new Date();
      updateData.payment_method = payment.payment_method || 'BANK_TRANSFER';
      if (transaction_code !== undefined) updateData.transaction_code = String(transaction_code).trim() || null;
    } else {
      updateData.paid_at = null;
      updateData.transaction_code = null;
    }

    await payment.update(updateData);

    const u = payment.WorkspaceMember?.CandidateProfile?.User;
    const projectName = payment.WorkspaceMember?.Workspace?.Project?.name || payment.WorkspaceMember?.Workspace?.name || '';
    const money = `${Number(payment.amount).toLocaleString('vi-VN')}đ`;
    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_PROCESSED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Thanh toán ${money} cho ${u.full_name}`,
        new_value: status,
        description: status === 'PAID'
          ? `Đánh dấu đã thanh toán ${money} cho ${u.full_name}${projectName ? ` (${projectName})` : ''}`
          : `Hoàn tác thanh toán ${money} của ${u.full_name}${projectName ? ` (${projectName})` : ''}`,
        metadata: { workspace_member_id: payment.workspace_member_id },
      });
      if (status === 'PAID') {
        await createNotification({
          user_id: u.id,
          type: 'PAYMENT_UPDATE',
          title: 'Bạn đã được thanh toán thù lao',
          message: `Khoản thù lao ${money} của bạn${projectName ? ` (${projectName})` : ''} đã được chuyển khoản.`,
          link: '/candidate/profile?tab=payment',
          metadata: { payment_id: payment.id, status },
        });
      }
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: WorkspaceMember,
          include: [
            {
              model: CandidateProfile,
              attributes: ['id', 'user_id', 'professional_title', 'avatar_url'],
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
            {
              model: CandidateEvaluation,
              attributes: ['id', 'score', 'comment', 'evaluated_at'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const data = await attachBankInfoToMembers(payments, (p) => p.WorkspaceMember);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
