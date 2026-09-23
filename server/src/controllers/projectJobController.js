const { Op } = require('sequelize');
const { 
  Project, ProjectJob, ProjectJobSkill, Skill, 
  ProjectApplication, CandidateProfile, User, CandidateSkill,
  CandidateEvaluation, WorkspaceMember, Workspace,
} = require('../models');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const { logActivity } = require('../utils/activityLogger');

// GET /api/project-jobs — Public listing of project jobs
exports.getProjectJobs = async (req, res, next) => {
  try {
    const { keyword, skill_id, page = 1, limit = 10 } = req.query;
    const where = { status: 'OPEN' };

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const include = [
      {
        model: Project,
        attributes: ['id', 'name', 'description', 'budget', 'status', 'start_date', 'expected_end_date']
      },
      {
        model: Skill,
        through: { attributes: [] },
        attributes: ['id', 'name']
      }
    ];

    if (skill_id) {
      include[1].where = { id: skill_id };
      include[1].required = true;
    }

    const { count, rows } = await ProjectJob.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      }
    });
  } catch (error) { next(error); }
};

// GET /api/project-jobs/:id — Public detail
exports.getProjectJobById = async (req, res, next) => {
  try {
    const job = await ProjectJob.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          attributes: ['id', 'name', 'description', 'budget', 'status', 'start_date', 'expected_end_date']
        },
        {
          model: Skill,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]
    });
    if (!job) throw new AppError('Project job not found', 404);
    res.json({ success: true, data: job });
  } catch (error) { next(error); }
};

// POST /api/project-jobs/:id/apply — Candidate applies to a project job
exports.applyProjectJob = async (req, res, next) => {
  try {
    const { cover_letter, cv_url } = req.body;
    const projectJob = await ProjectJob.findByPk(req.params.id);
    if (!projectJob || projectJob.status !== 'OPEN') {
      throw new AppError('Vị trí dự án này không khả dụng hoặc đã đóng', 400);
    }

    const candidateProfile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!candidateProfile) throw new AppError('Candidate profile not found', 404);

    const existing = await ProjectApplication.findOne({
      where: {
        project_job_id: projectJob.id,
        candidate_profile_id: candidateProfile.id
      }
    });
    if (existing) throw new AppError('Bạn đã nộp đơn cho vị trí này rồi', 409);

    const application = await ProjectApplication.create({
      project_job_id: projectJob.id,
      candidate_profile_id: candidateProfile.id,
      cover_letter,
      cv_url,
      status: 'PENDING'
    });

    await logActivity(req, {
      action: 'APPLICATION_SUBMITTED',
      entity_type: 'project_application',
      entity_id: application.id,
      entity_name: `Ứng tuyển vị trí ${projectJob.title}`,
      description: `Đã nộp đơn ứng tuyển cho vị trí "${projectJob.title}"`,
      metadata: { project_job_id: projectJob.id, project_id: projectJob.project_id },
    });

    res.status(201).json({ success: true, data: application, message: 'Ứng tuyển thành công' });
  } catch (error) { next(error); }
};

// GET /api/candidates/project-applications — Candidate view their project applications
exports.getMyProjectApplications = async (req, res, next) => {
  try {
    const candidateProfile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!candidateProfile) return res.json({ success: true, data: [] });

    const applications = await ProjectApplication.findAll({
      where: { candidate_profile_id: candidateProfile.id },
      include: [
        {
          model: ProjectJob,
          include: [{ model: Project, attributes: ['id', 'name'] }]
        }
      ],
      order: [['applied_at', 'DESC']]
    });

    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
};

// POST /api/admin/projects/:projectId/jobs — Admin adds a job position to project
exports.adminCreateProjectJob = async (req, res, next) => {
  try {
    const { title, description, budget, quantity, deadline, skill_ids } = req.body;
    const project = await Project.findByPk(req.params.projectId);
    if (!project) throw new AppError('Project not found', 404);

    const projectJob = await ProjectJob.create({
      project_id: project.id,
      title,
      description,
      budget,
      quantity: quantity || 1,
      deadline,
      status: 'OPEN'
    });

    if (skill_ids && skill_ids.length > 0) {
      const skillsData = skill_ids.map(skill_id => ({ project_job_id: projectJob.id, skill_id }));
      await ProjectJobSkill.bulkCreate(skillsData, { ignoreDuplicates: true });
    }

    res.status(201).json({ success: true, data: projectJob });
  } catch (error) { next(error); }
};

// GET /api/admin/projects/:projectId/jobs — Admin get all jobs of a project
exports.adminGetProjectJobs = async (req, res, next) => {
  try {
    const jobs = await ProjectJob.findAll({
      where: { project_id: req.params.projectId },
      include: [
        { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
        { 
          model: ProjectApplication, 
          as: 'apps',
          include: [{ 
            model: CandidateProfile, 
            attributes: ['id', 'professional_title', 'competency_score', 'github_url', 'portfolio_url', 'cv_url', 'cv_name'],
            include: [
              { model: User, attributes: ['full_name', 'email'] },
              { 
                model: Skill, 
                through: { model: CandidateSkill, attributes: ['level', 'years_of_experience'] }, 
                attributes: ['id', 'name'] 
              },
              { 
                model: WorkspaceMember,
                as: 'ws_members',
                attributes: ['id', 'status', 'joined_at'],
                include: [
                  { model: CandidateEvaluation, attributes: ['score', 'comment', 'evaluated_at'] },
                  { model: Workspace, attributes: ['id'], include: [{ model: Project, attributes: ['id', 'name'] }] }
                ],
                required: false
              }
            ]
          }] 
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Map short aliases back to standard frontend keys
    const mappedJobs = jobs.map(job => {
      const jobJson = job.toJSON();
      if (jobJson.apps) {
        jobJson.ProjectApplications = jobJson.apps.map(app => {
          if (app.CandidateProfile && app.CandidateProfile.ws_members) {
            app.CandidateProfile.WorkspaceMembers = app.CandidateProfile.ws_members;
            delete app.CandidateProfile.ws_members;
          }
          return app;
        });
        delete jobJson.apps;
      } else {
        jobJson.ProjectApplications = [];
      }
      return jobJson;
    });

    res.json({ success: true, data: mappedJobs });
  } catch (error) { next(error); }
};

// PUT /api/admin/project-applications/:id/status — Admin review application (auto-assign to Workspace on ACCEPTED)
exports.adminUpdateProjectApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // ACCEPTED, REJECTED, REVIEWING, INTERVIEW
    if (!['REVIEWING', 'ACCEPTED', 'REJECTED', 'INTERVIEW'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const application = await ProjectApplication.findByPk(req.params.id, {
      include: [{ model: ProjectJob }]
    });
    if (!application) throw new AppError('Application not found', 404);

    await application.update({ status });

    // If ACCEPTED -> Automatically add candidate into project's Workspace!
    if (status === 'ACCEPTED') {
      const workspace = await Workspace.findOne({
        where: { project_id: application.ProjectJob.project_id }
      });

      if (workspace) {
        const existingMember = await WorkspaceMember.findOne({
          where: {
            workspace_id: workspace.id,
            candidate_profile_id: application.candidate_profile_id
          }
        });

        if (!existingMember) {
          await WorkspaceMember.create({
            workspace_id: workspace.id,
            candidate_profile_id: application.candidate_profile_id,
            project_job_id: application.project_job_id,
            status: 'ACTIVE',
            joined_at: new Date()
          });
        }
      }
    }

    const cp = await CandidateProfile.findByPk(application.candidate_profile_id, { include: [{ model: User, attributes: ['id', 'full_name'] }] });
    const u = cp?.User;

    if (u) {
      await logActivity(req, {
        action: 'APPLICATION_STATUS_CHANGED',
        entity_type: 'project_application',
        entity_id: application.id,
        entity_name: application.ProjectJob?.title || 'Vị trí dự án',
        new_value: status,
        description: `Đơn ứng tuyển của ${u.full_name} đã chuyển sang trạng thái: ${status}`,
        metadata: { project_job_id: application.project_job_id, user_id: u.id },
        notify_user_ids: [u.id],
      });
    }

    res.json({ 
      success: true, 
      data: application, 
      message: status === 'ACCEPTED' 
        ? 'Đã duyệt ứng viên và tự động thêm vào Không gian làm việc (Workspace)' 
        : 'Đã cập nhật trạng thái hồ sơ' 
    });
  } catch (error) { next(error); }
};

// POST /api/admin/project-applications/:id/schedule-interview
exports.adminScheduleInterview = async (req, res, next) => {
  try {
    const { interview_time, meet_url, interview_note } = req.body;

    if (!interview_time || !meet_url) {
      throw new AppError('Vui lòng điền đầy đủ thời gian và link Google Meet', 400);
    }

    const application = await ProjectApplication.findByPk(req.params.id, {
      include: [
        {
          model: ProjectJob,
          include: [{ model: Project, attributes: ['id', 'name'] }]
        },
        {
          model: CandidateProfile,
          include: [{ model: User, attributes: ['full_name', 'email'] }]
        }
      ]
    });

    if (!application) throw new AppError('Application not found', 404);

    // Save interview info to application
    await application.update({
      interview_time,
      meet_url,
      interview_note: interview_note || null,
      status: 'INTERVIEW'
    });

    // Format date for email
    const dateObj = new Date(interview_time);
    const formattedDate = dateObj.toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = dateObj.toLocaleTimeString('vi-VN', {
      hour: '2-digit', minute: '2-digit'
    });

    const candidateName = application.CandidateProfile?.User?.full_name || 'Ứng viên';
    const candidateEmail = application.CandidateProfile?.User?.email;
    const projectName = application.ProjectJob?.Project?.name || 'Dự án';
    const positionName = application.ProjectJob?.title || 'Vị trí ứng tuyển';

    // Send email
    if (candidateEmail) {
      await sendEmail({
        to: candidateEmail,
        subject: `[DevHub] Thư mời phỏng vấn - Vị trí ${positionName} tại dự án ${projectName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">DevHub</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Thư mời phỏng vấn</p>
            </div>
            <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #374151; margin: 0 0 16px;">Xin chào <strong>${candidateName}</strong>,</p>
              <p style="color: #374151; margin: 0 0 24px;">
                Chúng tôi rất vui khi thông báo rằng hồ sơ của bạn cho vị trí <strong>${positionName}</strong>
                tại dự án <strong>${projectName}</strong> đã được xem xét và chúng tôi muốn mời bạn tham gia buổi phỏng vấn.
              </p>

              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #0369a1; margin: 0 0 12px; font-size: 16px;">📅 Thông tin buổi phỏng vấn</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; width: 140px; font-size: 14px;">Dự án:</td>
                    <td style="padding: 6px 0; color: #111827; font-weight: 600; font-size: 14px;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Vị trí:</td>
                    <td style="padding: 6px 0; color: #111827; font-weight: 600; font-size: 14px;">${positionName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Ngày phỏng vấn:</td>
                    <td style="padding: 6px 0; color: #111827; font-weight: 600; font-size: 14px;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Giờ phỏng vấn:</td>
                    <td style="padding: 6px 0; color: #111827; font-weight: 600; font-size: 14px;">${formattedTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Hình thức:</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 14px;">Trực tuyến qua Google Meet</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${meet_url}" target="_blank"
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  🎥 Tham gia Google Meet
                </a>
                <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">Link: <a href="${meet_url}" style="color: #6366f1;">${meet_url}</a></p>
              </div>

              ${interview_note ? `
              <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h4 style="color: #92400e; margin: 0 0 8px; font-size: 14px;">📝 Ghi chú từ ban tổ chức:</h4>
                <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">${interview_note}</p>
              </div>
              ` : ''}

              <p style="color: #374151; margin: 0 0 8px; font-size: 14px;">
                Vui lòng đảm bảo thiết bị của bạn có kết nối internet ổn định và camera/microphone hoạt động tốt trước buổi phỏng vấn.
              </p>
              <p style="color: #374151; margin: 0; font-size: 14px;">
                Nếu có bất kỳ vấn đề gì, hãy liên hệ với chúng tôi qua email này.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                DevHub — Nền tảng kết nối ứng viên IT với các dự án thực tế<br>
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </div>
          </div>
        `
      });
    }

    const u = application.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'INTERVIEW_SCHEDULED',
        entity_type: 'project_application',
        entity_id: application.id,
        entity_name: positionName,
        description: `Đã xếp lịch phỏng vấn cho ${u.full_name} lúc ${formattedTime} ${formattedDate}`,
        metadata: { project_job_id: application.project_job_id, user_id: u.id },
        notify_user_ids: [u.id],
      });
    }

    res.json({
      success: true,
      data: application,
      message: `Đã đặt lịch phỏng vấn và gửi email đến ${candidateEmail}`
    });
  } catch (error) { next(error); }
};
