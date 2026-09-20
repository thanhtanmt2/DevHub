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

    // Lấy một admin user để gán creator
    const adminUser = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email = 'admin@devhub.vn';`);
    const adminId = adminUser[0][0].id;

    // Lấy một số Skill IDs
    const skills = await queryInterface.sequelize.query(`SELECT id, name FROM skills LIMIT 5;`);
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
        password: hashPassword,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: candidate1Id,
        full_name: 'Nguyễn Văn Dev',
        email: 'dev1@gmail.com',
        password: hashPassword,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: candidate2Id,
        full_name: 'Lê Thị Code',
        email: 'dev2@gmail.com',
        password: hashPassword,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Map Users to Roles
    await queryInterface.bulkInsert('user_roles', [
      { user_id: employerId, role_id: employerRoleId, created_at: new Date(), updated_at: new Date() },
      { user_id: candidate1Id, role_id: candidateRoleId, created_at: new Date(), updated_at: new Date() },
      { user_id: candidate2Id, role_id: candidateRoleId, created_at: new Date(), updated_at: new Date() }
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
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Add Candidate Skills
    await queryInterface.bulkInsert('candidate_skills', [
      { candidate_profile_id: profile1Id, skill_id: reactSkillId, level: 'ADVANCED', years_of_experience: 2, created_at: new Date(), updated_at: new Date() },
      { candidate_profile_id: profile1Id, skill_id: nodeSkillId, level: 'INTERMEDIATE', years_of_experience: 1.5, created_at: new Date(), updated_at: new Date() },
      { candidate_profile_id: profile2Id, skill_id: reactSkillId, level: 'EXPERT', years_of_experience: 3, created_at: new Date(), updated_at: new Date() }
    ]);

    // 5. Tạo Job Posts (1 PARTNER, 1 INTERNAL)
    const jobPartnerId = uuidv4();
    const jobInternalId = uuidv4();

    await queryInterface.bulkInsert('job_posts', [
      {
        id: jobPartnerId,
        company_id: companyId,
        created_by_user_id: employerId,
        title: 'Senior React Developer (Remote)',
        description: 'Tìm kiếm Senior React dev tham gia dự án thương mại điện tử lớn. Yêu cầu tiếng Anh tốt.',
        work_type: 'REMOTE',
        post_type: 'PARTNER',
        salary_min: 1500,
        salary_max: 2500,
        quantity: 2,
        status: 'OPEN',
        posted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: jobInternalId,
        created_by_user_id: adminId, // Internal job no company
        title: 'Fullstack NodeJS + React cho Dự án Quản lý kho',
        description: 'Dự án nội bộ (DevHub Project). Cần 1 bạn build từ A-Z một hệ thống quản lý kho hàng hóa.',
        work_type: 'FREELANCE',
        post_type: 'INTERNAL',
        salary_min: 500,
        salary_max: 1000,
        quantity: 1,
        status: 'OPEN',
        posted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Job Skills
    await queryInterface.bulkInsert('job_post_skills', [
      { job_post_id: jobPartnerId, skill_id: reactSkillId, created_at: new Date(), updated_at: new Date() },
      { job_post_id: jobInternalId, skill_id: reactSkillId, created_at: new Date(), updated_at: new Date() },
      { job_post_id: jobInternalId, skill_id: nodeSkillId, created_at: new Date(), updated_at: new Date() }
    ]);

    // 6. Tạo Applications
    const application1Id = uuidv4(); // Applied to Partner
    const application2Id = uuidv4(); // Applied to Internal

    await queryInterface.bulkInsert('applications', [
      {
        id: application1Id,
        candidate_profile_id: profile1Id,
        job_post_id: jobPartnerId,
        cover_letter: 'Tôi rất thích FPT và mong muốn được tham gia dự án này.',
        status: 'VIEWED',
        applied_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: application2Id,
        candidate_profile_id: profile2Id,
        job_post_id: jobInternalId,
        cover_letter: 'Tôi tự tin có thể hoàn thành dự án quản lý kho đúng hạn.',
        status: 'HIRED', // Trúng tuyển nội bộ
        applied_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 7. Tạo Internal Project & Workspace
    const projectId = uuidv4();
    await queryInterface.bulkInsert('internal_projects', [
      {
        id: projectId,
        job_post_id: jobInternalId,
        name: 'Hệ thống Quản lý kho Logistics',
        description: 'Xây dựng dashboard và API quản lý nhập xuất tồn.',
        budget: 15000000,
        start_date: new Date(),
        expected_end_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
        completion_rate: 35,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const workspaceId = uuidv4();
    await queryInterface.bulkInsert('workspaces', [
      {
        id: workspaceId,
        internal_project_id: projectId,
        name: 'WS - Logistics Dashboard',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Workspace Member (The hired candidate)
    const memberId = uuidv4();
    await queryInterface.bulkInsert('workspace_members', [
      {
        id: memberId,
        workspace_id: workspaceId,
        candidate_profile_id: profile2Id,
        role: 'LEAD',
        status: 'ACTIVE',
        start_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 8. Tạo Tasks trong Kanban
    const task1Id = uuidv4();
    const task2Id = uuidv4();
    const task3Id = uuidv4();

    await queryInterface.bulkInsert('tasks', [
      {
        id: task1Id,
        workspace_id: workspaceId,
        workspace_member_id: memberId,
        title: 'Thiết kế Database Schema',
        description: 'Thiết kế các bảng cho chức năng nhập/xuất kho.',
        status: 'DONE',
        completion_rate: 100,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: task2Id,
        workspace_id: workspaceId,
        workspace_member_id: memberId,
        title: 'Code API Login & Phân quyền',
        description: 'Tạo JWT auth cho admin và staff.',
        status: 'IN_PROGRESS',
        completion_rate: 60,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: task3Id,
        workspace_id: workspaceId,
        workspace_member_id: null, // Chưa giao
        title: 'Làm giao diện Dashboard React',
        description: 'Dựng layout với Tailwind CSS.',
        status: 'TODO',
        completion_rate: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 9. Tạo 1 Payment mẫu
    await queryInterface.bulkInsert('payments', [
      {
        id: uuidv4(),
        workspace_member_id: memberId,
        amount: 3000000, // Tạm ứng 3 củ
        note: 'Tạm ứng đợt 1 (30%)',
        status: 'PAID',
        payment_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

  },

  down: async (queryInterface, Sequelize) => {
    // Để cho an toàn, ta chỉ xóa những dữ liệu sinh ra bởi file này nếu rollback.
    // Thực tế thì chạy db:drop là nhanh nhất.
  }
};
