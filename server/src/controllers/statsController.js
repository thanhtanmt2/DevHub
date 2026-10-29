const { Op } = require('sequelize');
const { User, JobPost, InternalProject, Application, Payment, Company, Role, ProjectApplication, Task, Workspace, ActivityLog } = require('../models');

// Dashboard Admin: những việc đang chờ Admin xử lý + task chờ nghiệm thu + hoạt động gần đây
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [
      pendingCompanies, pendingJobs, pendingProjectApplications,
      pendingPayments, processingPayments, tasksInReview,
      openTasksWithDeadline, reviewTasks, recentActivity,
    ] = await Promise.all([
      Company.count({ where: { verification_status: 'PENDING' } }),
      JobPost.count({ where: { status: 'PENDING_APPROVAL' } }),
      // Ứng viên dự án chưa có quyết định cuối (chưa Trúng tuyển / Từ chối)
      ProjectApplication.count({ where: { status: { [Op.notIn]: ['ACCEPTED', 'REJECTED'] } } }),
      Payment.count({ where: { status: 'PENDING' } }),
      Payment.count({ where: { status: 'PROCESSING' } }),
      Task.count({ where: { status: 'REVIEW' } }),
      Task.findAll({
        where: { status: { [Op.in]: ['TODO', 'IN_PROGRESS'] }, deadline: { [Op.ne]: null } },
        attributes: ['deadline'],
        raw: true,
      }),
      Task.findAll({
        where: { status: 'REVIEW' },
        attributes: ['id', 'title', 'workspace_id', 'updated_at'],
        include: [{ model: Workspace, attributes: ['id', 'name'] }],
        order: [['updated_at', 'ASC']], // chờ lâu nhất lên đầu
        limit: 5,
      }),
      // Bỏ qua đăng nhập/đăng xuất cho đỡ nhiễu
      ActivityLog.findAll({
        where: { action: { [Op.notIn]: ['USER_LOGIN', 'USER_LOGOUT'] } },
        attributes: ['id', 'user_name', 'user_role', 'action', 'description', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 8,
      }),
    ]);

    // Cùng quy ước với trang Workspace: deadline tính hết ngày, chỉ task chưa gửi duyệt mới bị coi là quá hạn
    const now = new Date();
    const overdueTasks = openTasksWithDeadline.filter((t) => {
      const end = new Date(t.deadline);
      end.setHours(23, 59, 59, 999);
      return end < now;
    }).length;

    res.json({
      success: true,
      data: {
        todo: {
          pending_companies: pendingCompanies,
          pending_jobs: pendingJobs,
          pending_project_applications: pendingProjectApplications,
          pending_payments: pendingPayments + processingPayments,
          tasks_in_review: tasksInReview,
          overdue_tasks: overdueTasks,
        },
        review_tasks: reviewTasks,
        recent_activity: recentActivity,
      },
    });
  } catch (error) { next(error); }
};

exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalJobs = await JobPost.count();
    const totalProjects = await InternalProject.count();
    
    // Revenue / Payouts (sum of PAID payments)
    const paidPayments = await Payment.findAll({ where: { status: 'PAID' } });
    const totalPayout = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const recentApplications = await Application.count({
      where: { applied_at: { [require('sequelize').Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) } }
    });

    // Extended stats
    const totalCandidates = await User.count({ where: { '$Roles.name$': 'CANDIDATE' }, include: [{ model: Role }] });
    const totalEmployers = await User.count({ where: { '$Roles.name$': 'EMPLOYER' }, include: [{ model: Role }] });
    const pendingPayments = await Payment.count({ where: { status: 'PENDING' } });
    const processingPayments = await Payment.count({ where: { status: 'PROCESSING' } });
    const paidPayments2 = await Payment.count({ where: { status: 'PAID' } });
    const totalApplications = await Application.count();
    const totalProjectApplications = await ProjectApplication.count();

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_candidates: totalCandidates,
        total_employers: totalEmployers,
        total_jobs: totalJobs,
        total_projects: totalProjects,
        total_payout: totalPayout,
        recent_applications: recentApplications,
        total_applications: totalApplications,
        total_project_applications: totalProjectApplications,
        payments: {
          pending: pendingPayments,
          processing: processingPayments,
          paid: paidPayments2,
        },
      }
    });
  } catch (error) { next(error); }
};

exports.getEmployerStats = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.json({ success: true, data: { total_jobs: 0, total_applications: 0 } });

    const totalJobs = await JobPost.count({ where: { company_id: company.id } });
    const jobs = await JobPost.findAll({ where: { company_id: company.id }, attributes: ['id'] });
    const jobIds = jobs.map(j => j.id);

    const totalApplications = await Application.count({ where: { job_post_id: jobIds } });
    
    res.json({
      success: true,
      data: {
        total_jobs: totalJobs,
        total_applications: totalApplications
      }
    });
  } catch (error) { next(error); }
};
