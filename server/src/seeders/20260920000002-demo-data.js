'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashPassword = await bcrypt.hash('123456', 12);
    
    // 1. Lấy Role IDs
    const roles = await queryInterface.sequelize.query(`SELECT id, name FROM roles;`);
    const roleRows = roles[0];
    const candidateRoleId = roleRows.find(r => r.name === 'CANDIDATE').id;
    const employerRoleId = roleRows.find(r => r.name === 'EMPLOYER').id;
    const adminRoleId = roleRows.find(r => r.name === 'ADMIN').id;

    // Lấy admin user để gán creator
    const adminUser = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email = 'admin@devhub.vn';`);
    const adminId = adminUser[0][0].id;

    // Lấy Skill IDs
    const skills = await queryInterface.sequelize.query(`SELECT id, name FROM skills LIMIT 10;`);
    const skillRows = skills[0];
    const reactSkillId = skillRows.find(s => s.name === 'React')?.id || skillRows[0].id;
    const nodeSkillId = skillRows.find(s => s.name === 'Node.js')?.id || skillRows[1].id;

    // 2. Tạo Users (1 Employer, 2 Candidates)
    const employerId = uuidv4();
    const candidate1Id = uuidv4();
    const candidate2Id = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: employerId,
        full_name: 'Trần Nhà Tuyển Dụng',
        email: 'employer@fpt.com',
        password_hash: hashPassword,
        status: 'ACTIVE',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: candidate1Id,
        full_name: 'Nguyễn Văn Dev',
        email: 'dev1@gmail.com',
        password_hash: hashPassword,
        status: 'ACTIVE',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: candidate2Id,
        full_name: 'Lê Thị Code',
        email: 'dev2@gmail.com',
        password_hash: hashPassword,
        status: 'ACTIVE',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Map Users to Roles
    await queryInterface.bulkInsert('user_roles', [
      { user_id: employerId, role_id: employerRoleId },
      { user_id: candidate1Id, role_id: candidateRoleId },
      { user_id: candidate2Id, role_id: candidateRoleId }
    ]);

    // 3. Tạo Company cho Employer
    const companyId = uuidv4();
    await queryInterface.bulkInsert('companies', [
      {
        id: companyId,
        user_id: employerId,
        name: 'FPT Software',
        tax_code: '0101248141',
        address: 'F-Town 3, Quận 9, TP.HCM',
        email: 'tuyendung@fpt.com',
        website: 'https://fptsoftware.com',
        description: 'Tập đoàn công nghệ hàng đầu Việt Nam',
        verification_status: 'VERIFIED',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 4. Tạo Candidate Profiles
    const profile1Id = uuidv4();
    const profile2Id = uuidv4();

    await queryInterface.bulkInsert('candidate_profiles', [
      {
        id: profile1Id,
        user_id: candidate1Id,
        professional_title: 'Fullstack Web Developer',
        introduction: 'Đam mê lập trình web với React và Node.js, có 2 năm kinh nghiệm.',
        competency_score: 8.5,
        github_url: 'https://github.com/nguyenvandev',
        cv_url: 'https://example.com/cvs/CV_Nguyen_Van_Dev_Fullstack.pdf',
        cv_name: 'CV_Nguyen_Van_Dev_Fullstack.pdf',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: profile2Id,
        user_id: candidate2Id,
        professional_title: 'Frontend Developer',
        introduction: 'Chuyên gia React, UI/UX, thích viết code sạch.',
        competency_score: 9.0,
        github_url: 'https://github.com/lethicode',
        cv_url: 'https://example.com/cvs/CV_Le_Thi_Code_React.pdf',
        cv_name: 'CV_Le_Thi_Code_React.pdf',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Add Candidate Skills
    await queryInterface.bulkInsert('candidate_skills', [
      { candidate_profile_id: profile1Id, skill_id: reactSkillId, level: 'ADVANCED', years_of_experience: 2 },
      { candidate_profile_id: profile1Id, skill_id: nodeSkillId, level: 'INTERMEDIATE', years_of_experience: 1.5 },
      { candidate_profile_id: profile2Id, skill_id: reactSkillId, level: 'EXPERT', years_of_experience: 3 }
    ]);

    // 5. Tuyển dụng Công ty: Job Posts (Thuần túy Doanh nghiệp tuyển nhân sự dài hạn)
    const jobCompany1Id = uuidv4();
    const jobCompany2Id = uuidv4();

    await queryInterface.bulkInsert('job_posts', [
      {
        id: jobCompany1Id,
        company_id: companyId,
        created_by_user_id: employerId,
        title: 'Senior React Developer (Toàn thời gian)',
        description: 'FPT Software tuyển dụng Senior React Developer tham gia dự án thương mại điện tử quốc tế. Cơ hội thăng tiến và chế độ đãi ngộ hấp dẫn.',
        work_type: 'FULL_TIME',
        post_type: 'PARTNER',
        location: 'TP. Hồ Chí Minh',
        salary_min: 25000000,
        salary_max: 40000000,
        quantity: 2,
        status: 'OPEN',
        posted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: jobCompany2Id,
        company_id: companyId,
        created_by_user_id: employerId,
        title: 'Backend Node.js Engineer (Remote)',
        description: 'Tuyển kỹ sư Backend thành thạo Node.js, Express, PostgreSQL. Làm việc từ xa linh hoạt, đánh giá theo hiệu quả công việc.',
        work_type: 'REMOTE',
        post_type: 'PARTNER',
        location: 'Toàn quốc',
        salary_min: 20000000,
        salary_max: 35000000,
        quantity: 3,
        status: 'OPEN',
        posted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Job Skills
    await queryInterface.bulkInsert('job_post_skills', [
      { job_post_id: jobCompany1Id, skill_id: reactSkillId },
      { job_post_id: jobCompany2Id, skill_id: nodeSkillId }
    ]);

    // Application vào Job Doanh nghiệp
    const applicationCompanyId = uuidv4();
    await queryInterface.bulkInsert('applications', [
      {
        id: applicationCompanyId,
        candidate_profile_id: profile1Id,
        job_post_id: jobCompany1Id,
        cover_letter: 'Tôi rất thích môi trường chuyên nghiệp tại FPT Software và mong muốn được cống hiến lâu dài.',
        status: 'VIEWED',
        applied_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 6. DỰ ÁN THỜI VỤ (Projects & ProjectJobs)
    const projectId = uuidv4();
    await queryInterface.bulkInsert('projects', [
      {
        id: projectId,
        name: 'Hệ thống Quản lý kho Logistics (DevHub Client)',
        description: 'Xây dựng toàn diện ứng dụng web quản lý nhập, xuất, tồn kho hàng hóa và tích hợp mã QR.',
        budget: 30000000,
        start_date: new Date(),
        expected_end_date: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000),
        status: 'RECRUITING',
        completion_rate: 35,
        created_by_user_id: adminId,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 7. CÁC VỊ TRÍ CÔNG VIỆC THỜI VỤ TRONG DỰ ÁN (ProjectJobs)
    const projectJob1Id = uuidv4();
    const projectJob2Id = uuidv4();

    await queryInterface.bulkInsert('project_jobs', [
      {
        id: projectJob1Id,
        project_id: projectId,
        title: 'Frontend React Developer (Dự án Kho)',
        description: 'Xây dựng giao diện Dashboard, Kanban điều phối và bảng kê kho bằng React + Tailwind CSS. Thời gian dự kiến 1 tháng.',
        budget: 12000000, // 12 triệu thù lao
        quantity: 1,
        deadline: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: projectJob2Id,
        project_id: projectId,
        title: 'Backend Node.js & Database Developer (Dự án Kho)',
        description: 'Thiết kế cơ sở dữ liệu PostgreSQL và viết RESTful API quản lý hàng tồn, báo cáo doanh thu. Yêu cầu viết code sạch, chuẩn REST.',
        budget: 18000000, // 18 triệu thù lao
        quantity: 1,
        deadline: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Kỹ năng yêu cầu cho vị trí trong dự án
    await queryInterface.bulkInsert('project_job_skills', [
      { project_job_id: projectJob1Id, skill_id: reactSkillId },
      { project_job_id: projectJob2Id, skill_id: nodeSkillId }
    ]);

    // 8. Ứng tuyển vào Vị trí Dự án (ProjectApplications)
    const projectApp1Id = uuidv4();
    const projectApp2Id = uuidv4();

    await queryInterface.bulkInsert('project_applications', [
      {
        id: projectApp1Id,
        project_job_id: projectJob1Id,
        candidate_profile_id: profile2Id,
        cover_letter: 'Tôi có nhiều kinh nghiệm làm giao diện React Dashboard và cam kết hoàn thành đúng deadline.',
        status: 'ACCEPTED', // Đã duyệt trúng tuyển vào dự án
        applied_at: new Date(),
        updated_at: new Date()
      },
      {
        id: projectApp2Id,
        project_job_id: projectJob2Id,
        candidate_profile_id: profile1Id,
        cover_letter: 'Tôi thành thạo Node.js và PostgreSQL, tự tin làm tốt hệ thống này.',
        status: 'PENDING',
        applied_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 9. WORKSPACE & WORKSPACE MEMBERS (Cho ứng viên đã trúng tuyển vào dự án)
    const workspaceId = uuidv4();
    await queryInterface.bulkInsert('workspaces', [
      {
        id: workspaceId,
        project_id: projectId,
        name: 'WS - Logistics Dashboard',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const memberId = uuidv4();
    await queryInterface.bulkInsert('workspace_members', [
      {
        id: memberId,
        workspace_id: workspaceId,
        candidate_profile_id: profile2Id,
        project_job_id: projectJob1Id,
        status: 'ACTIVE',
        joined_at: new Date()
      }
    ]);

    // 10. Tasks trong Kanban Workspace
    const task1Id = uuidv4();
    const task2Id = uuidv4();
    const task3Id = uuidv4();

    await queryInterface.bulkInsert('tasks', [
      {
        id: task1Id,
        workspace_id: workspaceId,
        workspace_member_id: memberId,
        title: 'Thiết kế giao diện Dashboard kho',
        description: 'Tạo layout thống kê số lượng hàng nhập xuất tồn theo tuần.',
        status: 'DONE',
        completion_rate: 100,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: task2Id,
        workspace_id: workspaceId,
        workspace_member_id: memberId,
        title: 'Tích hợp bảng quét mã vạch sản phẩm',
        description: 'Xây dựng component quét và nhập liệu tức thời.',
        status: 'IN_PROGRESS',
        completion_rate: 60,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: task3Id,
        workspace_id: workspaceId,
        workspace_member_id: null,
        title: 'Tối ưu Responsive trên máy tính bảng',
        description: 'Kiểm thử hiển thị trên màn hình iPad và tablet công nghiệp.',
        status: 'TODO',
        completion_rate: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 11. Thanh toán mẫu cho thành viên dự án
    await queryInterface.bulkInsert('payments', [
      {
        id: uuidv4(),
        workspace_member_id: memberId,
        amount: 4000000, // Tạm ứng đợt 1
        status: 'PAID',
        paid_at: new Date(),
        created_at: new Date()
      }
    ]);

  },

  down: async (queryInterface, Sequelize) => {
    // Drop logic
  }
};
