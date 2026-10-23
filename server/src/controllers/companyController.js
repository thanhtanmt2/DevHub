const { Company, User } = require('../models');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const { createNotification, notifyAdmins } = require('./notificationController');

// Danh sách free email provider bị chặn
const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'yopmail.com',
  'mailinator.com', 'guerrillamail.com', 'temp-mail.org',
];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
}

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
    const { name, tax_code, address, email, website, description, logo_url } = req.body;
    const company = await Company.create({ user_id: req.user.id, name, tax_code, address, email, website, description, logo_url: logo_url || null });
    // Logo công ty cũng là ảnh đại diện của tài khoản
    if (logo_url) await User.update({ avatar_url: logo_url }, { where: { id: req.user.id } });
    await notifyAdmins({
      type: 'COMPANY_PENDING',
      title: 'Doanh nghiệp mới chờ xác thực',
      message: `${company.name} vừa tạo hồ sơ doanh nghiệp.`,
      link: '/admin/companies',
      metadata: { company_id: company.id },
    });
    res.status(201).json({ success: true, data: company });
  } catch (error) { next(error); }
};

// PUT /api/employer/company
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);
    // Nếu email thay đổi thì reset xác thực
    const { email, ...rest } = req.body;
    if (email && email !== company.email) {
      await company.update({ ...rest, email, company_email_verified: false, company_email_token: null, verification_status: 'PENDING' });
    } else {
      await company.update(rest);
    }
    // Logo công ty cũng là ảnh đại diện của tài khoản (hiện ở header)
    if (rest.logo_url !== undefined) {
      await User.update({ avatar_url: rest.logo_url || null }, { where: { id: req.user.id } });
    }
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};

// POST /api/employer/company/send-verify-email
exports.sendCompanyVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    // Chặn free email
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) throw new AppError('Email không hợp lệ', 400);
    if (FREE_EMAIL_DOMAINS.includes(domain)) {
      throw new AppError(
        `Email "${domain}" là dịch vụ email miễn phí. Vui lòng sử dụng email công ty (VD: hr@${domain === 'gmail.com' ? 'congty.vn' : domain})`,
        400
      );
    }

    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Vui lòng tạo hồ sơ công ty trước', 400);

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await company.update({
      email,
      company_email_token: otp,
      company_email_token_expires: expires,
      company_email_verified: false,
    });

    await sendEmail({
      to: email,
      subject: 'DevHub – Xác thực email doanh nghiệp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #1d4ed8; margin-bottom: 8px;">🏢 Xác thực Email Doanh nghiệp</h2>
          <p style="color: #374151;">Xin chào,</p>
          <p style="color: #374151;">Mã OTP xác thực email doanh nghiệp của bạn là:</p>
          <div style="background: #1d4ed8; color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 12px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">Mã có hiệu lực trong <strong>10 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
        </div>
      `,
    });

    res.json({ success: true, message: `Đã gửi OTP đến ${email}` });
  } catch (error) { next(error); }
};

// POST /api/employer/company/verify-email
exports.verifyCompanyEmail = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) throw new AppError('OTP is required', 400);

    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);
    if (!company.company_email_token) throw new AppError('Chưa gửi OTP, vui lòng thử lại', 400);
    if (new Date() > new Date(company.company_email_token_expires)) {
      throw new AppError('OTP đã hết hạn, vui lòng gửi lại', 400);
    }
    if (company.company_email_token !== otp.trim()) {
      throw new AppError('OTP không đúng', 400);
    }

    await company.update({
      company_email_verified: true,
      company_email_token: null,
      company_email_token_expires: null,
      // Đã được Admin duyệt thì giữ nguyên; bị từ chối thì gửi lại để Admin xem xét; còn lại vẫn chờ duyệt
      verification_status: company.verification_status === 'REJECTED' ? 'PENDING' : company.verification_status,
    });

    // Xác thực email xong mà chưa được duyệt → Admin cần xem xét hồ sơ
    if (company.verification_status !== 'VERIFIED') {
      await notifyAdmins({
        type: 'COMPANY_PENDING',
        title: 'Doanh nghiệp chờ phê duyệt',
        message: `${company.name} đã xác thực email công ty và đang chờ bạn phê duyệt.`,
        link: '/admin/companies',
        metadata: { company_id: company.id },
      });
    }

    res.json({
      success: true,
      message: company.verification_status === 'VERIFIED'
        ? 'Xác thực email doanh nghiệp thành công!'
        : 'Xác thực email doanh nghiệp thành công! Hồ sơ của bạn đang chờ Admin xem xét và phê duyệt.',
    });
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

// PUT /api/admin/companies/:id/verify — admin verifies/rejects company (override)
exports.verifyCompany = async (req, res, next) => {
  try {
    const { verification_status } = req.body; // VERIFIED or REJECTED
    if (!['VERIFIED', 'REJECTED'].includes(verification_status)) throw new AppError('Invalid status', 400);
    const company = await Company.findByPk(req.params.id);
    if (!company) throw new AppError('Company not found', 404);
    await company.update({ verification_status });
    await createNotification({
      user_id: company.user_id,
      type: verification_status === 'VERIFIED' ? 'COMPANY_VERIFIED' : 'COMPANY_REJECTED',
      title: verification_status === 'VERIFIED' ? 'Doanh nghiệp đã được xác thực' : 'Hồ sơ doanh nghiệp bị từ chối',
      message: verification_status === 'VERIFIED'
        ? `${company.name} đã được Admin xác thực. Bạn có thể đăng tin tuyển dụng ngay bây giờ.`
        : `Hồ sơ của ${company.name} chưa được duyệt. Hãy kiểm tra lại thông tin và xác thực email công ty để gửi Admin xem xét lại.`,
      link: verification_status === 'VERIFIED' ? '/employer/jobs' : '/employer/company',
      metadata: { company_id: company.id },
    });
    res.json({ success: true, data: company });
  } catch (error) { next(error); }
};
