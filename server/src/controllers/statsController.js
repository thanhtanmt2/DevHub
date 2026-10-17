const { User, JobPost, InternalProject, Application, Payment, Company, Role, ProjectApplication } = require('../models');

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
