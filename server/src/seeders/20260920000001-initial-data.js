'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const roles = [
  { id: uuidv4(), name: 'ADMIN', description: 'System administrator with full access', created_at: new Date(), updated_at: new Date() },
  { id: uuidv4(), name: 'CANDIDATE', description: 'Job seeker / Freelancer', created_at: new Date(), updated_at: new Date() },
  { id: uuidv4(), name: 'EMPLOYER', description: 'External hiring company', created_at: new Date(), updated_at: new Date() },
];

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Express.js', 'NestJS', 'Python', 'Django',
  'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby on Rails',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker',
  'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git',
  'CI/CD', 'GraphQL', 'REST API', 'Figma', 'UI/UX Design',
].map(name => ({
  id: uuidv4(),
  name,
  description: `${name} skill`,
  status: 'ACTIVE',
  created_at: new Date(),
  updated_at: new Date(),
}));

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', roles, {});
    await queryInterface.bulkInsert('skills', skills, {});

    // Create admin user
    const adminId = uuidv4();
    const adminRoleId = roles.find(r => r.name === 'ADMIN').id;
    await queryInterface.bulkInsert('users', [{
      id: adminId,
      email: 'admin@devhub.vn',
      password_hash: await bcrypt.hash('Admin@123456', 12),
      full_name: 'DevHub Admin',
      status: 'ACTIVE',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('user_roles', [{ user_id: adminId, role_id: adminRoleId }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('skills', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
