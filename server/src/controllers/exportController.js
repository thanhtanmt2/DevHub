const ExcelJS = require('exceljs');
const { Payment, WorkspaceMember, CandidateProfile, CandidateEvaluation, Workspace, User, Application, JobPost, PaymentInformation } = require('../models');

// GET /api/admin/export/payments — Export Excel báo cáo thanh toán
exports.exportPaymentsExcel = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: WorkspaceMember,
        include: [
          { model: CandidateProfile, include: [{ model: User, attributes: ['full_name', 'email'] }] },
          { model: Workspace, attributes: ['name'] },
        ]
      }],
      order: [['created_at', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DevHub Admin';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Báo cáo Thanh toán');
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Ứng viên', key: 'candidate', width: 25 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Workspace/Dự án', key: 'workspace', width: 28 },
      { header: 'Số tiền (VNĐ)', key: 'amount', width: 18 },
      { header: 'Phương thức', key: 'method', width: 16 },
      { header: 'Mã giao dịch', key: 'txcode', width: 22 },
      { header: 'Trạng thái', key: 'status', width: 14 },
      { header: 'Ngày thanh toán', key: 'paid_at', width: 20 },
      { header: 'Ngày tạo', key: 'created', width: 20 },
    ];

    // Header style
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'thin' } };
    });

    const STATUS_VN = { PENDING: 'Chờ xử lý', PROCESSING: 'Đang xử lý', PAID: 'Đã thanh toán', FAILED: 'Thất bại' };

    payments.forEach((p, idx) => {
      const row = sheet.addRow({
        stt: idx + 1,
        candidate: p.WorkspaceMember?.CandidateProfile?.User?.full_name || '—',
        email: p.WorkspaceMember?.CandidateProfile?.User?.email || '—',
        workspace: p.WorkspaceMember?.Workspace?.name || '—',
        amount: parseFloat(p.amount),
        method: p.payment_method || '—',
        txcode: p.transaction_code || '—',
        status: STATUS_VN[p.status] || p.status,
        paid_at: p.paid_at ? new Date(p.paid_at).toLocaleDateString('vi-VN') : '—',
        created: new Date(p.createdAt).toLocaleDateString('vi-VN'),
      });
      // Color by status
      const statusCell = row.getCell('status');
      if (p.status === 'PAID') statusCell.font = { color: { argb: 'FF16A34A' }, bold: true };
      else if (p.status === 'FAILED') statusCell.font = { color: { argb: 'FFDC2626' } };
      else if (p.status === 'PROCESSING') statusCell.font = { color: { argb: 'FFD97706' } };

      // Amount format
      row.getCell('amount').numFmt = '#,##0';
    });

    // Auto-filter
    sheet.autoFilter = { from: 'A1', to: 'J1' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=bao-cao-thanh-toan-${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
};

// GET /api/admin/export/evaluations — Export Excel báo cáo đánh giá năng lực
exports.exportEvaluationsExcel = async (req, res, next) => {
  try {
    const evals = await CandidateEvaluation.findAll({
      include: [{
        model: WorkspaceMember,
        include: [
          { model: CandidateProfile, include: [{ model: User, attributes: ['full_name', 'email'] }] },
          { model: Workspace, attributes: ['name'] },
        ]
      }],
      order: [['evaluated_at', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Báo cáo Đánh giá Năng lực');
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Ứng viên', key: 'candidate', width: 25 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Workspace/Dự án', key: 'workspace', width: 28 },
      { header: 'Điểm đánh giá (0–10)', key: 'score', width: 20 },
      { header: 'Nhận xét', key: 'comment', width: 40 },
      { header: 'Ngày đánh giá', key: 'evaluated_at', width: 20 },
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    evals.forEach((ev, idx) => {
      const score = parseFloat(ev.score);
      const row = sheet.addRow({
        stt: idx + 1,
        candidate: ev.WorkspaceMember?.CandidateProfile?.User?.full_name || '—',
        email: ev.WorkspaceMember?.CandidateProfile?.User?.email || '—',
        workspace: ev.WorkspaceMember?.Workspace?.name || '—',
        score,
        comment: ev.comment || '—',
        evaluated_at: ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleDateString('vi-VN') : '—',
      });
      const scoreCell = row.getCell('score');
      if (score >= 8) scoreCell.font = { color: { argb: 'FF16A34A' }, bold: true };
      else if (score >= 5) scoreCell.font = { color: { argb: 'FFD97706' } };
      else scoreCell.font = { color: { argb: 'FFDC2626' } };
    });

    sheet.autoFilter = { from: 'A1', to: 'G1' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=bao-cao-danh-gia-${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
};

// GET /api/admin/export/applications — Export Excel báo cáo đơn ứng tuyển
exports.exportApplicationsExcel = async (req, res, next) => {
  try {
    const apps = await Application.findAll({
      include: [
        { model: CandidateProfile, include: [{ model: User, attributes: ['full_name', 'email'] }] },
        { model: JobPost, attributes: ['title'], include: [{ model: require('../models').Company, attributes: ['name'] }] },
      ],
      order: [['applied_at', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Báo cáo Ứng tuyển');
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Ứng viên', key: 'candidate', width: 25 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Vị trí ứng tuyển', key: 'job', width: 30 },
      { header: 'Công ty', key: 'company', width: 25 },
      { header: 'Trạng thái', key: 'status', width: 16 },
      { header: 'Ngày nộp', key: 'applied_at', width: 18 },
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const STATUS_VN = { PENDING: 'Chờ xem xét', VIEWED: 'Đã xem', INTERVIEW: 'Phỏng vấn', HIRED: 'Trúng tuyển', REJECTED: 'Từ chối' };
    apps.forEach((a, idx) => {
      sheet.addRow({
        stt: idx + 1,
        candidate: a.CandidateProfile?.User?.full_name || '—',
        email: a.CandidateProfile?.User?.email || '—',
        job: a.JobPost?.title || '—',
        company: a.JobPost?.Company?.name || '—',
        status: STATUS_VN[a.status] || a.status,
        applied_at: new Date(a.applied_at).toLocaleDateString('vi-VN'),
      });
    });

    sheet.autoFilter = { from: 'A1', to: 'G1' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=bao-cao-ung-tuyen-${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
};
