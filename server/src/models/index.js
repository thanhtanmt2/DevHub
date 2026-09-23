'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import all models
const Role = require('./Role')(sequelize, DataTypes);
const Permission = require('./Permission')(sequelize, DataTypes);
const RolePermission = require('./RolePermission')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const UserRole = require('./UserRole')(sequelize, DataTypes);
const CandidateProfile = require('./CandidateProfile')(sequelize, DataTypes);
const CandidateCv = require('./CandidateCv')(sequelize, DataTypes);
const Experience = require('./Experience')(sequelize, DataTypes);
const Skill = require('./Skill')(sequelize, DataTypes);
const CandidateSkill = require('./CandidateSkill')(sequelize, DataTypes);
const PaymentInformation = require('./PaymentInformation')(sequelize, DataTypes);
const Company = require('./Company')(sequelize, DataTypes);
const JobPost = require('./JobPost')(sequelize, DataTypes);
const JobPostSkill = require('./JobPostSkill')(sequelize, DataTypes);
const Application = require('./Application')(sequelize, DataTypes);
const ApplicationStatusHistory = require('./ApplicationStatusHistory')(sequelize, DataTypes);

// Project models (Freelance / Thời vụ)
const Project = require('./Project')(sequelize, DataTypes);
const ProjectJob = require('./ProjectJob')(sequelize, DataTypes);
const ProjectJobSkill = require('./ProjectJobSkill')(sequelize, DataTypes);
const ProjectApplication = require('./ProjectApplication')(sequelize, DataTypes);

// Workspace models
const Workspace = require('./Workspace')(sequelize, DataTypes);
const WorkspaceMember = require('./WorkspaceMember')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);
const TaskAssignee = require('./TaskAssignee')(sequelize, DataTypes);
const SubTask = require('./SubTask')(sequelize, DataTypes);
const TaskComment = require('./TaskComment')(sequelize, DataTypes);
const TaskActivity = require('./TaskActivity')(sequelize, DataTypes);
const TaskSubmission = require('./TaskSubmission')(sequelize, DataTypes);
const CandidateEvaluation = require('./CandidateEvaluation')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, DataTypes);

// ── Associations ──────────────────────────────────────────────────
// Role <-> Permission (many-to-many)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id' });

// User <-> Role (many-to-many)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

// User -> CandidateProfile (one-to-one)
User.hasOne(CandidateProfile, { foreignKey: 'user_id' });
CandidateProfile.belongsTo(User, { foreignKey: 'user_id' });

// User -> Company (one-to-one)
User.hasOne(Company, { foreignKey: 'user_id' });
Company.belongsTo(User, { foreignKey: 'user_id' });

// CandidateProfile -> Experience (one-to-many)
CandidateProfile.hasMany(Experience, { foreignKey: 'candidate_profile_id' });
Experience.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id' });

// CandidateProfile -> CandidateCv (one-to-many)
CandidateProfile.hasMany(CandidateCv, { foreignKey: 'candidate_profile_id', as: 'cvs' });
CandidateCv.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id' });

// CandidateProfile <-> Skill (many-to-many)
CandidateProfile.belongsToMany(Skill, { through: CandidateSkill, foreignKey: 'candidate_profile_id' });
Skill.belongsToMany(CandidateProfile, { through: CandidateSkill, foreignKey: 'skill_id' });

// CandidateProfile -> PaymentInformation (one-to-one)
CandidateProfile.hasOne(PaymentInformation, { foreignKey: 'candidate_profile_id' });
PaymentInformation.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id' });

// JobPost (Company recruitment)
User.hasMany(JobPost, { foreignKey: 'created_by_user_id' });
JobPost.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });
Company.hasMany(JobPost, { foreignKey: 'company_id' });
JobPost.belongsTo(Company, { foreignKey: 'company_id' });

// JobPost <-> Skill (many-to-many)
JobPost.belongsToMany(Skill, { through: JobPostSkill, foreignKey: 'job_post_id' });
Skill.belongsToMany(JobPost, { through: JobPostSkill, foreignKey: 'skill_id' });

// Application (Company job applications)
CandidateProfile.hasMany(Application, { foreignKey: 'candidate_profile_id' });
Application.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id' });
JobPost.hasMany(Application, { foreignKey: 'job_post_id' });
Application.belongsTo(JobPost, { foreignKey: 'job_post_id' });

// ApplicationStatusHistory
Application.hasMany(ApplicationStatusHistory, { foreignKey: 'application_id' });
ApplicationStatusHistory.belongsTo(Application, { foreignKey: 'application_id' });

// ── Project & ProjectJob (Freelance / Thời vụ) ────────────────────
User.hasMany(Project, { foreignKey: 'created_by_user_id' });
Project.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'creator' });

CandidateProfile.hasMany(Project, { foreignKey: 'manager_id', as: 'ManagedProjects' });
Project.belongsTo(CandidateProfile, { foreignKey: 'manager_id', as: 'Manager' });

Project.hasMany(ProjectJob, { foreignKey: 'project_id' });
ProjectJob.belongsTo(Project, { foreignKey: 'project_id' });

ProjectJob.belongsToMany(Skill, { through: ProjectJobSkill, foreignKey: 'project_job_id' });
Skill.belongsToMany(ProjectJob, { through: ProjectJobSkill, foreignKey: 'skill_id' });

ProjectJob.hasMany(ProjectApplication, { foreignKey: 'project_job_id' });
ProjectJob.hasMany(ProjectApplication, { foreignKey: 'project_job_id', as: 'apps' });
ProjectApplication.belongsTo(ProjectJob, { foreignKey: 'project_job_id' });

CandidateProfile.hasMany(ProjectApplication, { foreignKey: 'candidate_profile_id' });
ProjectApplication.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id' });

// Project <-> Workspace (1-1)
Project.hasOne(Workspace, { foreignKey: 'project_id' });
Workspace.belongsTo(Project, { foreignKey: 'project_id' });

// WorkspaceMember
Workspace.hasMany(WorkspaceMember, { foreignKey: 'workspace_id' });
WorkspaceMember.belongsTo(Workspace, { foreignKey: 'workspace_id' });
CandidateProfile.hasMany(WorkspaceMember, { foreignKey: 'candidate_profile_id', as: 'WorkspaceMembers' });
CandidateProfile.hasMany(WorkspaceMember, { foreignKey: 'candidate_profile_id', as: 'ws_members' });
WorkspaceMember.belongsTo(CandidateProfile, { foreignKey: 'candidate_profile_id' });
ProjectJob.hasMany(WorkspaceMember, { foreignKey: 'project_job_id' });
WorkspaceMember.belongsTo(ProjectJob, { foreignKey: 'project_job_id' });

// Task
Workspace.hasMany(Task, { foreignKey: 'workspace_id' });
Task.belongsTo(Workspace, { foreignKey: 'workspace_id' });

// Task <-> WorkspaceMember (many-to-many via TaskAssignee)
Task.belongsToMany(WorkspaceMember, { through: TaskAssignee, foreignKey: 'task_id', otherKey: 'workspace_member_id', as: 'Assignees' });
WorkspaceMember.belongsToMany(Task, { through: TaskAssignee, foreignKey: 'workspace_member_id', otherKey: 'task_id', as: 'AssignedTasks' });
TaskAssignee.belongsTo(Task, { foreignKey: 'task_id' });
TaskAssignee.belongsTo(WorkspaceMember, { foreignKey: 'workspace_member_id' });

// SubTask
Task.hasMany(SubTask, { foreignKey: 'task_id', as: 'SubTasks' });
SubTask.belongsTo(Task, { foreignKey: 'task_id' });

// TaskComment
Task.hasMany(TaskComment, { foreignKey: 'task_id', as: 'Comments' });
TaskComment.belongsTo(Task, { foreignKey: 'task_id' });
TaskComment.belongsTo(WorkspaceMember, { foreignKey: 'workspace_member_id', as: 'Author' });

// TaskActivity
Task.hasMany(TaskActivity, { foreignKey: 'task_id', as: 'Activities' });
TaskActivity.belongsTo(Task, { foreignKey: 'task_id' });
TaskActivity.belongsTo(WorkspaceMember, { foreignKey: 'workspace_member_id', as: 'Actor' });

// TaskSubmission (kept for legacy compatibility)
Task.hasMany(TaskSubmission, { foreignKey: 'task_id' });
TaskSubmission.belongsTo(Task, { foreignKey: 'task_id' });

// CandidateEvaluation
WorkspaceMember.hasOne(CandidateEvaluation, { foreignKey: 'workspace_member_id' });
CandidateEvaluation.belongsTo(WorkspaceMember, { foreignKey: 'workspace_member_id' });

// Payment
WorkspaceMember.hasMany(Payment, { foreignKey: 'workspace_member_id' });
Payment.belongsTo(WorkspaceMember, { foreignKey: 'workspace_member_id' });

// Notification (user receives many notifications)
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// ActivityLog (user performs many actions)
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'ActivityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

// Backwards compatibility alias
const InternalProject = Project;

module.exports = {
  sequelize,
  Sequelize,
  Role, Permission, RolePermission,
  User, UserRole,
  CandidateProfile, CandidateCv, Experience, Skill, CandidateSkill, PaymentInformation,
  Company,
  JobPost, JobPostSkill,
  Application, ApplicationStatusHistory,
  Project, ProjectJob, ProjectJobSkill, ProjectApplication,
  InternalProject, // alias
  Workspace, WorkspaceMember,
  Task, TaskAssignee, SubTask, TaskComment, TaskActivity, TaskSubmission,
  CandidateEvaluation,
  Payment,
  Notification,
  ActivityLog,
};
