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
      if (existing.status === 'PENDING' || existing.status === 'PROCESSING') {
        throw new AppError(
          `Thành viên ${member.CandidateProfile?.User?.full_name || ''} đã có khoản thanh toán đang chờ xử lý trong dự án "${projectName}". Bạn có thể sửa số tiền trực tiếp trên khoản thanh toán đó.`,
          409
        );
      }
      // Nếu khoản cũ ở trạng thái FAILED → khôi phục lại về PENDING với số tiền mới (không tạo bản ghi trùng)
      await existing.update({
        amount: numericAmount,
        payment_method: payment_method || 'VIETQR',
        status: 'PENDING',
        transaction_code: null,
        paid_at: null,
      });

      const u = member.CandidateProfile?.User;
      if (u) {
        await logActivity(req, {
          action: 'PAYMENT_CREATED',
          entity_type: 'payment',
          entity_id: existing.id,
          entity_name: `Khôi phục thanh toán ${numericAmount.toLocaleString('vi-VN')}đ cho ${u.full_name}`,
          description: `Khôi phục yêu cầu thanh toán ${numericAmount.toLocaleString('vi-VN')} VND cho ${u.full_name} (${projectName})`,
          metadata: { workspace_member_id, workspace_id: member.workspace_id },
        });
        await createNotification({
          user_id: u.id,
          type: 'PAYMENT_UPDATE',
          title: 'Yêu cầu thanh toán được tạo lại',
          message: `Khoản thanh toán ${numericAmount.toLocaleString('vi-VN')}đ tại "${projectName}" đã được đưa vào danh sách chờ xử lý lại.`,
          link: '/candidate/profile?tab=payment',
          metadata: { payment_id: existing.id },
        });
      }

      return res.status(200).json({ success: true, data: existing, restored: true });
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
      if (existing && ['PENDING', 'PROCESSING', 'PAID'].includes(existing.status)) {
        skippedPaidOrPending += 1;
        continue;
      }

      const budget = Number(m.ProjectJob?.budget) || 0;
      if (budget < 1000) {
        skippedNoBudget += 1;
        continue;
      }

      let payment;
      if (existing && existing.status === 'FAILED') {
        payment = await existing.update({
          amount: budget,
          payment_method: 'VIETQR',
          status: 'PENDING',
          transaction_code: null,
          paid_at: null,
        });
      } else {
        payment = await Payment.create({
          workspace_member_id: m.id,
          amount: budget,
          payment_method: 'VIETQR',
          status: 'PENDING',
        });
      }
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

// PUT /api/admin/payments/:id — Sửa số tiền khi khoản thanh toán đang ở PENDING hoặc FAILED
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

    if (payment.status === 'PAID' || payment.status === 'PROCESSING') {
      throw new AppError(
        'Chỉ có thể điều chỉnh số tiền khi khoản thanh toán đang ở trạng thái "Chờ xử lý" hoặc "Thất bại"',
        400
      );
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

// DELETE /api/admin/payments/:id — Hủy / Xóa khoản thanh toán tạo nhầm (chỉ cho phép khi PENDING hoặc FAILED)
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

    if (payment.status === 'PAID' || payment.status === 'PROCESSING') {
      throw new AppError(
        'Không thể xóa khoản thanh toán đang xử lý hoặc đã thanh toán hoàn tất',
        400
      );
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

// PUT /api/admin/payments/:id/process
exports.processPayment = async (req, res, next) => {
  try {
    const { status, transaction_code, payment_method } = req.body;
    if (!['PROCESSING', 'PAID', 'FAILED'].includes(status)) {
      throw new AppError('Trạng thái thanh toán không hợp lệ', 400);
    }

    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: WorkspaceMember,
          include: [
            {
              model: CandidateProfile,
              include: [
                { model: User, attributes: ['id', 'full_name'] },
                { model: PaymentInformation, attributes: ['bank_name', 'account_number', 'account_holder_name'] },
              ],
            },
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

    if (payment.status === 'PAID') {
      throw new AppError('Khoản thanh toán này đã được tất toán, không thể thay đổi trạng thái', 400);
    }

    const cleanTx = transaction_code !== undefined ? String(transaction_code).trim() : '';

    if (status === 'PAID') {
      if (!cleanTx) {
        throw new AppError('Vui lòng nhập mã giao dịch ngân hàng để xác nhận đã thanh toán', 400);
      }

      // Kiểm tra ứng viên đã có thông tin ngân hàng chưa
      const profileId = payment.WorkspaceMember?.candidate_profile_id || payment.WorkspaceMember?.CandidateProfile?.id;
      const bankInfo =
        payment.WorkspaceMember?.CandidateProfile?.PaymentInformation ||
        (profileId ? await PaymentInformation.findOne({ where: { candidate_profile_id: profileId } }) : null);
      if (!bankInfo?.account_number) {
        throw new AppError(
          'Ứng viên chưa cập nhật số tài khoản ngân hàng, không thể xác nhận đã chuyển khoản',
          400
        );
      }

      // Chống trùng mã giao dịch ngân hàng với khoản thanh toán khác
      const duplicateTx = await Payment.findOne({
        where: {
          transaction_code: cleanTx,
          id: { [Op.ne]: payment.id },
        },
      });
      if (duplicateTx) {
        throw new AppError(
          `Mã giao dịch "${cleanTx}" đã được sử dụng cho một khoản thanh toán khác. Vui lòng kiểm tra lại.`,
          409
        );
      }
    }

    const updateData = { status };
    if (transaction_code !== undefined) {
      updateData.transaction_code = cleanTx || null;
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
    const projectName =
      payment.WorkspaceMember?.Workspace?.Project?.name ||
      payment.WorkspaceMember?.Workspace?.name ||
      '';
    if (u) {
      await logActivity(req, {
        action: 'PAYMENT_PROCESSED',
        entity_type: 'payment',
        entity_id: payment.id,
        entity_name: `Thanh toán ${Number(payment.amount).toLocaleString('vi-VN')}đ cho ${u.full_name}`,
        new_value: status,
        description: `Cập nhật trạng thái thanh toán của ${u.full_name} thành ${status}${
          updateData.transaction_code ? ` (Mã GD: ${updateData.transaction_code})` : ''
        }`,
        metadata: { workspace_member_id: payment.workspace_member_id },
      });
      const PAY_NOTICE = {
        PROCESSING: ['Khoản thanh toán đang được xử lý', 'đang được xử lý'],
        PAID: ['Bạn đã được thanh toán thù lao', 'đã được chuyển khoản thành công'],
        FAILED: [
          'Thanh toán không thành công',
          'chưa thanh toán được, vui lòng kiểm tra lại thông tin tài khoản ngân hàng trong hồ sơ',
        ],
      };
      await createNotification({
        user_id: u.id,
        type: 'PAYMENT_UPDATE',
        title: PAY_NOTICE[status][0],
        message: `Khoản thanh toán ${Number(payment.amount).toLocaleString('vi-VN')}đ của bạn${
          projectName ? ` (${projectName})` : ''
        } ${PAY_NOTICE[status][1]}.${
          updateData.transaction_code ? ` Mã giao dịch: ${updateData.transaction_code}.` : ''
        }`,
        link: '/candidate/profile?tab=payment',
        metadata: { payment_id: payment.id, status },
      });
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
              attributes: ['id', 'user_id', 'professional_title'],
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
