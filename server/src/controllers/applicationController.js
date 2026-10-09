const { Application, ApplicationStatusHistory, CandidateProfile, JobPost, Company, User, Skill } = require('../models');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');

// POST /api/applications — candidate submits application
exports.apply = async (req, res, next) => {
  try {
    const { job_post_id, cover_letter, cv_url } = req.body;
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Please complete your candidate profile first', 400);

    const job = await JobPost.findByPk(job_post_id);
    if (!job) throw new AppError('Job post not found', 404);
    if (job.status !== 'OPEN') throw new AppError('This job post is no longer accepting applications', 400);

    // Check duplicate
    const existing = await Application.findOne({ where: { candidate_profile_id: profile.id, job_post_id } });
    if (existing) throw new AppError('You have already applied for this position', 409);

    const application = await Application.create({
      candidate_profile_id: profile.id,
      job_post_id,
      cover_letter,
      cv_url,
      status: 'PENDING',
    });

    await ApplicationStatusHistory.create({
      application_id: application.id,
      status: 'PENDING',
      note: 'Hồ sơ vừa được nộp',
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) { next(error); }
};

// GET /api/candidates/applications — candidate's application list
exports.getMyApplications = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.json({ success: true, data: [] });
    const applications = await Application.findAll({
      where: { candidate_profile_id: profile.id },
      include: [{
        model: JobPost,
        attributes: ['id', 'title', 'post_type', 'work_type', 'salary_min', 'salary_max', 'status'],
        include: [{ model: Company, attributes: ['id', 'name', 'logo_url'] }],
      }],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// GET /api/applications/:id — application detail with history
exports.getApplicationDetail = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    const application = await Application.findOne({
      where: { id: req.params.id, candidate_profile_id: profile?.id },
      include: [
        { model: JobPost, include: [{ model: Company }] },
        { model: ApplicationStatusHistory, order: [['changed_at', 'ASC']] },
      ],
    });
    if (!application) throw new AppError('Application not found', 404);
    res.json({ success: true, data: application });
  } catch (error) { next(error); }
};

// GET /api/employer/applications — employer views all applicants across all jobs
exports.getAllEmployerApplications = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);

    const { job_id, status } = req.query;
    const jobWhere = { company_id: company.id };
    if (job_id) jobWhere.id = job_id;

    const appWhere = {};
    if (status) appWhere.status = status;

    const applications = await Application.findAll({
      where: appWhere,
      include: [
        {
          model: JobPost,
          where: jobWhere,
          attributes: ['id', 'title', 'post_type', 'work_type', 'status'],
        },
        {
          model: CandidateProfile,
          attributes: ['id', 'professional_title', 'competency_score', 'github_url', 'portfolio_url', 'cv_url', 'cv_name'],
          include: [
            { model: User, attributes: ['full_name', 'email'] },
            { model: Skill, through: { attributes: ['level'] }, attributes: ['name'] },
          ],
        },
      ],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// GET /api/employer/jobs/:jobId/applications — employer views applicants
exports.getJobApplications = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) throw new AppError('Company not found', 404);
    const job = await JobPost.findOne({ where: { id: req.params.jobId, company_id: company.id } });
    if (!job) throw new AppError('Job not found or not yours', 404);

    const applications = await Application.findAll({
      where: { job_post_id: req.params.jobId },
      include: [{
        model: CandidateProfile,
        attributes: ['id', 'professional_title', 'competency_score', 'github_url', 'portfolio_url', 'cv_url', 'cv_name'],
        include: [
          { model: User, attributes: ['full_name', 'email'] },
          { model: Skill, through: { attributes: ['level'] }, attributes: ['name'] },
        ],
      }],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// PUT /api/employer/applications/:id/status — employer updates application status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['VIEWED', 'INTERVIEW', 'HIRED', 'REJECTED'];
    if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400);

    const company = await Company.findOne({ where: { user_id: req.user.id } });
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: JobPost, where: { company_id: company?.id } },
        { model: CandidateProfile, include: [{ model: User }] }
      ],
    });
    if (!application) throw new AppError('Application not found or access denied', 404);

    await application.update({ status });
    await ApplicationStatusHistory.create({ application_id: application.id, status, note });

    // --- SEND PROFESSIONAL EMAIL ---
    const candidateEmail = application.CandidateProfile?.User?.email;
    const candidateName = application.CandidateProfile?.User?.full_name || 'Ứng viên';
    const positionName = application.JobPost?.title || 'Vị trí công việc';
    const companyName = company.name;

    if (candidateEmail && ['INTERVIEW', 'HIRED', 'REJECTED'].includes(status)) {
      let subject = '';
      let titleHtml = '';
      let bodyHtml = '';

      if (status === 'INTERVIEW') {
        subject = `[DevHub] Cập nhật hồ sơ: Vòng phỏng vấn - ${companyName}`;
        titleHtml = 'Chúc mừng bạn bước vào Vòng phỏng vấn';
        bodyHtml = `
          <p style="color: #374151; margin: 0 0 16px;">
            Hồ sơ của bạn cho vị trí <strong>${positionName}</strong> đã vượt qua vòng sơ loại và chúng tôi rất ấn tượng với năng lực của bạn.
          </p>
          <p style="color: #374151; margin: 0 0 16px;">
            Chúng tôi sẽ sớm liên hệ với bạn qua email hoặc điện thoại để sắp xếp lịch phỏng vấn chính thức. Hãy chú ý hộp thư đến nhé!
          </p>
        `;
      } else if (status === 'HIRED') {
        subject = `[DevHub] Chúc mừng! Bạn đã trúng tuyển vị trí ${positionName} tại ${companyName}`;
        titleHtml = 'Chúc mừng bạn đã Trúng tuyển! 🎉';
        bodyHtml = `
          <p style="color: #374151; margin: 0 0 16px;">
            Chúng tôi vô cùng vui mừng thông báo rằng bạn đã <strong>chính thức trúng tuyển</strong> vào vị trí <strong>${positionName}</strong>.
          </p>
          <p style="color: #374151; margin: 0 0 16px;">
            Bộ phận Nhân sự của công ty sẽ liên hệ với bạn trong thời gian sớm nhất để trao đổi về Offer (Lương, thưởng, phúc lợi) và ngày bắt đầu công việc (Onboarding).
          </p>
          <p style="color: #374151; margin: 0 0 16px;">
            Chào mừng bạn gia nhập đội ngũ của chúng tôi!
          </p>
        `;
      } else if (status === 'REJECTED') {
        subject = `[DevHub] Cập nhật kết quả ứng tuyển - ${companyName}`;
        titleHtml = 'Cập nhật kết quả ứng tuyển';
        bodyHtml = `
          <p style="color: #374151; margin: 0 0 16px;">
            Cảm ơn bạn đã quan tâm và dành thời gian ứng tuyển vào vị trí <strong>${positionName}</strong> tại <strong>${companyName}</strong>.
          </p>
          <p style="color: #374151; margin: 0 0 16px;">
            Sau khi xem xét kỹ lưỡng hồ sơ, chúng tôi rất tiếc phải thông báo rằng kinh nghiệm của bạn hiện tại chưa hoàn toàn phù hợp với định hướng của vị trí này. 
            Tuy nhiên, chúng tôi đánh giá cao những kỹ năng của bạn và sẽ lưu lại hồ sơ để liên hệ khi có vị trí khác phù hợp hơn trong tương lai.
          </p>
          <p style="color: #374151; margin: 0 0 16px;">Chúc bạn gặp nhiều may mắn và thành công trên con đường sự nghiệp!</p>
        `;
      }

      await sendEmail({
        to: candidateEmail,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${companyName}</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Thông báo từ Nhà tuyển dụng</p>
            </div>
            <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #111827; margin: 0 0 20px; font-size: 18px;">${titleHtml}</h2>
              <p style="color: #374151; margin: 0 0 16px;">Xin chào <strong>${candidateName}</strong>,</p>
              
              ${bodyHtml}
              
              ${note ? `
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0;">
                <p style="color: #475569; margin: 0; font-size: 14px; font-style: italic;">
                  <strong>Ghi chú từ HR:</strong> ${note}
                </p>
              </div>
              ` : ''}

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                DevHub — Nền tảng kết nối ứng viên IT với các doanh nghiệp<br>
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </div>
          </div>
        `
      }).catch(err => console.error('Failed to send status update email:', err));
    }
    // --- END EMAIL ---

    res.json({ success: true, data: application });
  } catch (error) { next(error); }
};

// GET /api/admin/jobs/:jobId/applications — admin views applications for internal job
exports.getAdminJobApplications = async (req, res, next) => {
  try {
    const job = await JobPost.findByPk(req.params.jobId);
    if (!job) throw new AppError('Job not found', 404);
    const applications = await Application.findAll({
      where: { job_post_id: req.params.jobId },
      include: [{
        model: CandidateProfile,
        include: [
          { model: User, attributes: ['full_name', 'email'] },
          { model: Skill, through: { attributes: ['level'] }, attributes: ['name'] },
        ],
      }],
      order: [['applied_at', 'DESC']],
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// PUT /api/admin/applications/:id/status — admin updates status (for internal jobs)
exports.adminUpdateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findByPk(req.params.id);
    if (!application) throw new AppError('Application not found', 404);
    await application.update({ status });
    await ApplicationStatusHistory.create({ application_id: application.id, status, note });
    res.json({ success: true, data: application });
  } catch (error) { next(error); }
};

// DELETE /api/applications/:id — candidate withdraws their application
exports.withdrawApplication = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);

    const application = await Application.findOne({
      where: { id: req.params.id, candidate_profile_id: profile.id },
    });
    if (!application) throw new AppError('Application not found or access denied', 404);

    // Only allow withdraw if status is PENDING
    if (!['PENDING'].includes(application.status)) {
      throw new AppError('Chỉ có thể rút đơn khi hồ sơ đang ở trạng thái Chờ xem xét', 400);
    }

    await application.destroy();
    res.json({ success: true, message: 'Đã rút đơn ứng tuyển thành công' });
  } catch (error) { next(error); }
};
