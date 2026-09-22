const fs = require('fs');

let content = fs.readFileSync('./src/pages/admin/InternalProjectsPage.jsx', 'utf8');

// Replace API calls and states
content = content.replace(/workspaceApi/g, 'managerApi');
content = content.replace(/projectJobApi/g, 'managerApi');
content = content.replace(/import \{ managerApi \} from '@\/api\/managerApi';\nimport \{ managerApi \} from '@\/api\/managerApi';/g, "import { managerApi } from '@/api/managerApi';");

content = content.replace(/export default function InternalProjectsPage/g, 'export default function ManagedProjectsPage');
content = content.replace(/admin-projects/g, 'managed-projects');
content = content.replace(/admin-project-jobs/g, 'managed-project-jobs');
content = content.replace(/getProjects\(\)/g, 'getManagedProjects()');
content = content.replace(/getAdminProjectJobs/g, 'getProjectJobs');
content = content.replace(/createAdminProjectJob/g, 'createProjectJob');
content = content.replace(/updateProjectApplicationStatus/g, 'updateApplicationStatus');

// UI titles
content = content.replace(/Quản lý Dự án Thời vụ & Vị trí tuyển dụng/g, 'Dự án Quản lý');
content = content.replace(/Quản lý các dự án nội bộ và vị trí tuyển dụng thời vụ/g, 'Quản lý các dự án bạn được chỉ định');

// Remove Create Project block
content = content.replace(/<button onClick=\{[^}]+\}\s*className="btn-primary">[\s\S]*?\+ Tạo Dự án Mới\s*<\/button>/, '');
content = content.replace(/\{showAddProject && \([\s\S]*?\}\s*\{(?:<|%)\/\* Danh sách các dự án \*\/\}/g, '{/* Danh sách các dự án */}');

// Remove AssignManager Modal logic
content = content.replace(/\{assignManagerProject && \([\s\S]*?<AssignManagerModal[\s\S]*?\/>\s*\)\}/, '');
content = content.replace(/<button[^>]*onClick=\{[^}]*setAssignManagerProject[^}]*\}[^>]*>[\s\S]*?<\/button>/, '');

fs.writeFileSync('./src/pages/candidate/ManagedProjectsPage.jsx', content, 'utf8');
console.log('Script executed');
