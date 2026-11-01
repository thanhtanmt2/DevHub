// Nạp dữ liệu mẫu để web trông như đang vận hành thật.
//   npm run db:seed-demo              xóa dữ liệu mẫu cũ (nếu có) → nạp lại → chuẩn hóa vài dữ liệu cũ bị sai/dư khoảng trắng
//   npm run db:seed-demo -- --reset   chỉ gỡ toàn bộ dữ liệu mẫu
//   npm run db:seed-demo -- --no-normalize   không động tới dữ liệu có sẵn của bạn
//
// Nguyên tắc an toàn:
//  - Mọi dòng mẫu có mã (UUID) cố định suy ra từ khóa, tài khoản mẫu đều có email @demo.devhub.vn (mật khẩu 123456),
//    nên gỡ/nạp lại không đụng tới dữ liệu thật của bạn (hồ sơ, doanh nghiệp, dự án bạn tự tạo).
//  - Toàn bộ chạy trong MỘT giao dịch: lỗi giữa chừng thì không để lại dữ liệu dở.
//  - Có dữ liệu thanh toán theo module thanh toán mới (mỗi thành viên tối đa 1 khoản; PAID có mã giao dịch và thông tin ngân hàng).
//  - Logo công ty (uploads/images/demo-logo-*.png) và CV (uploads/cvs/demo-cv-*.pdf) chỉ được gắn nếu file có trong thư mục uploads.
//  - Không gửi email.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v5: uuidv5 } = require('uuid');
const { sequelize } = require('../src/models');
sequelize.options.logging = false;

const COMPANIES = require('./demo-data/companies');
const { ROLES, LEVELS, BENEFITS, BENEFITS_REMOTE, WORKING_TIME, SPECS, CITY } = require('./demo-data/jobs');
const {
  HO, NAM, NU, CITIES, ARCHETYPES, PAST_COMPANIES, PERSONAL_PROJECTS, INTRO_CLOSERS, COVER_LETTERS,
} = require('./demo-data/people');
const PROJECTS = require('./demo-data/projects');
const { CLIENT_BENEFITS } = PROJECTS;

const DEMO_DOMAIN = '@demo.devhub.vn';
const DEMO_PASSWORD = '123456';
const NS = '6f1c3a52-0d6e-4b61-9d3c-2f4d6a1b8e90';
const id = (...parts) => uuidv5(parts.join(':'), NS);

// ── Số ngẫu nhiên có hạt giống cố định: chạy lại cho ra cùng một bộ dữ liệu ──
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = mulberry32(20261030);
const int = (a, b) => a + Math.floor(R() * (b - a + 1));
const pick = (arr) => arr[Math.floor(R() * arr.length)];
const chance = (p) => R() < p;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (arr, n) => shuffle(arr).slice(0, n);
const weighted = (pairs) => { const total = pairs.reduce((s, [, w]) => s + w, 0); let x = R() * total; for (const [v, w] of pairs) { if ((x -= w) <= 0) return v; } return pairs[pairs.length - 1][0]; };

// ── Thời gian ──
const MS_DAY = 86400000;
const NOW = new Date();
const ago = (days) => new Date(NOW.getTime() - days * MS_DAY);
const inDays = (days) => new Date(NOW.getTime() + days * MS_DAY);
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 0); return x; };
const beforeNow = (d) => (d > NOW ? new Date(NOW.getTime() - 60000) : d);
const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const UPLOADS = path.join(__dirname, '..', 'uploads');
const hasFile = (folder, name) => fs.existsSync(path.join(UPLOADS, folder, name));
const stripVi = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
const slugDash = (s) => stripVi(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '');
const letters = (n) => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz'[int(0, 25)]).join('');
const meetUrl = () => `https://meet.google.com/${letters(3)}-${letters(4)}-${letters(3)}`;
const firstSentence = (s) => (s.split('. ')[0] || s).replace(/\.$/, '') + '.';

const NEW_SKILLS = [
  'Next.js', 'Tailwind CSS', 'Redux', 'HTML/CSS', 'Flutter', 'React Native', 'Kotlin', 'Swift', 'Firebase', 'C#', '.NET Core',
  'Selenium', 'Manual Testing', 'Cypress', 'Postman', 'Jira', 'Agile/Scrum', 'Linux', 'SQL', 'Power BI', 'Pandas',
  'Machine Learning', 'TensorFlow', 'Microservices', 'RabbitMQ',
];

// Thanh toán mẫu: 'dự án:vị trí' → [trạng thái, số ngày trước, hệ số trên thù lao của vị trí]
// (module thanh toán: 1 khoản/thành viên; PAID cần mã giao dịch + ứng viên có số tài khoản)
const PAYMENT_PLAN = {
  'p_thoitrang:fe': ['PAID', 55], 'p_thoitrang:php': ['PAID', 53], 'p_thoitrang:ux': ['PAID', 54],
  'p_chi:mo': ['PAID', 16], 'p_chi:be': ['PAID', 15], 'p_chi:qa': ['FAILED', 9],
  'p_kham:ux': ['PROCESSING', 1.5],
  'p_chatbot:fe': ['PENDING', 2, 0.5],
};
// Hai khoản này cố ý để ứng viên CHƯA có thông tin nhận tiền (thất bại / chờ ứng viên cập nhật)
const NO_BANK = new Set(['p_chi:qa', 'p_chatbot:fe']);
const BANKS = ['Vietcombank (VCB)', 'Techcombank (TCB)', 'MBBank (MB)', 'ACB', 'VPBank (VPB)', 'BIDV', 'VietinBank (CTG)', 'TPBank (TPB)', 'Sacombank (STB)'];
const APP_STATUS_LABEL = { PENDING: 'Chờ xem', VIEWED: 'Đã xem', INTERVIEW: 'Phỏng vấn', HIRED: 'Trúng tuyển', REJECTED: 'Từ chối' };
const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
];

// ═════════════════════════════════════════════ Gỡ dữ liệu mẫu ═════════════════════════════════════════════
const jobId = (i) => id('job', i);
const projectId = (key) => id('project', key);

async function resetDemo(t) {
  const jobs = SPECS.map((_, i) => jobId(i));
  const projects = PROJECTS.map((p) => projectId(p.key));
  const rep = { jobs, projects };
  const U = `(SELECT id FROM users WHERE email LIKE '%${DEMO_DOMAIN}')`;
  const P = `(SELECT id FROM candidate_profiles WHERE user_id IN ${U})`;
  const W = '(SELECT id FROM workspaces WHERE project_id IN (:projects))';
  const WM = `(SELECT id FROM workspace_members WHERE workspace_id IN ${W} OR candidate_profile_id IN ${P})`;
  const T = `(SELECT id FROM tasks WHERE workspace_id IN ${W})`;
  const PJ = '(SELECT id FROM project_jobs WHERE project_id IN (:projects))';
  const J = `(SELECT id FROM job_posts WHERE id IN (:jobs) OR company_id IN (SELECT id FROM companies WHERE user_id IN ${U}))`;
  const A = `(SELECT id FROM applications WHERE job_post_id IN ${J} OR candidate_profile_id IN ${P})`;
  const steps = [
    `DELETE FROM notifications WHERE user_id IN ${U} OR metadata->>'demo' = 'true'`,
    `DELETE FROM activity_logs WHERE user_id IN ${U} OR metadata->>'demo' = 'true'`,
    `DELETE FROM payments WHERE workspace_member_id IN ${WM}`,
    `DELETE FROM payment_information WHERE candidate_profile_id IN ${P}`,
    `DELETE FROM candidate_evaluations WHERE workspace_member_id IN ${WM}`,
    `DELETE FROM task_attachments WHERE task_id IN ${T}`,
    `DELETE FROM task_submissions WHERE task_id IN ${T}`,
    `DELETE FROM task_comments WHERE task_id IN ${T}`,
    `DELETE FROM task_activities WHERE task_id IN ${T}`,
    `DELETE FROM sub_tasks WHERE task_id IN ${T}`,
    `DELETE FROM task_assignees WHERE task_id IN ${T}`,
    `DELETE FROM tasks WHERE id IN ${T}`,
    `DELETE FROM workspace_members WHERE id IN ${WM}`,
    `DELETE FROM workspaces WHERE id IN ${W}`,
    `DELETE FROM project_applications WHERE project_job_id IN ${PJ} OR candidate_profile_id IN ${P}`,
    `DELETE FROM project_job_skills WHERE project_job_id IN ${PJ}`,
    `DELETE FROM project_jobs WHERE id IN ${PJ}`,
    `DELETE FROM projects WHERE id IN (:projects)`,
    `DELETE FROM application_status_history WHERE application_id IN ${A}`,
    `DELETE FROM applications WHERE id IN ${A}`,
    `DELETE FROM job_post_skills WHERE job_post_id IN ${J}`,
    `DELETE FROM job_posts WHERE id IN ${J}`,
    `DELETE FROM experiences WHERE candidate_profile_id IN ${P} AND parent_id IS NOT NULL`,
    `DELETE FROM experiences WHERE candidate_profile_id IN ${P}`,
    `DELETE FROM candidate_skills WHERE candidate_profile_id IN ${P}`,
    `DELETE FROM candidate_cvs WHERE candidate_profile_id IN ${P}`,
    `DELETE FROM candidate_profiles WHERE id IN ${P}`,
    `DELETE FROM companies WHERE user_id IN ${U}`,
    `DELETE FROM refresh_tokens WHERE user_id IN ${U}`,
    `DELETE FROM user_roles WHERE user_id IN ${U}`,
    `DELETE FROM users WHERE email LIKE '%${DEMO_DOMAIN}'`,
  ];
  let removed = 0;
  for (const sql of steps) {
    const [, meta] = await sequelize.query(sql, { transaction: t, replacements: rep });
    removed += meta?.rowCount || 0;
  }
  return removed;
}

// ═════════════════════════════════════════════ Chuẩn hóa dữ liệu có sẵn ═════════════════════════════════════════════
async function normalizeExisting(t) {
  const out = [];
  const run = async (label, sql, rep) => {
    const [, meta] = await sequelize.query(sql, { transaction: t, replacements: rep });
    if (meta?.rowCount) out.push(`${label}: ${meta.rowCount} dòng`);
  };
  const NOT_DEMO = `email NOT LIKE '%${DEMO_DOMAIN}'`;
  await run('Cắt khoảng trắng thừa ở tên người dùng', `UPDATE users SET full_name = btrim(full_name) WHERE full_name <> btrim(full_name) AND ${NOT_DEMO}`);
  await run('Cắt khoảng trắng thừa ở thông tin nhận tiền', `UPDATE payment_information SET account_holder_name = btrim(account_holder_name), bank_name = btrim(bank_name), account_number = btrim(account_number) WHERE account_holder_name <> btrim(account_holder_name) OR bank_name <> btrim(bank_name) OR account_number <> btrim(account_number)`);
  await run('Cắt khoảng trắng thừa ở hồ sơ ứng viên', `UPDATE candidate_profiles SET professional_title = btrim(professional_title), phone = btrim(phone), address = btrim(address), introduction = btrim(introduction)
    WHERE professional_title <> btrim(professional_title) OR phone <> btrim(phone) OR address <> btrim(address) OR introduction <> btrim(introduction)`);
  await run('Thống nhất cách ghi địa chỉ "TPHCM"', `UPDATE candidate_profiles SET address = 'TP. Hồ Chí Minh' WHERE upper(btrim(address)) IN ('TPHCM', 'TP HCM', 'TP.HCM', 'HCM', 'HỒ CHÍ MINH')`);
  await run('Sửa lỗi chính tả tên công ty "FPT Softwave"', `UPDATE experiences SET company_name = 'FPT Software' WHERE company_name ILIKE 'FPT Softwave%'`);
  await run('Cắt khoảng trắng thừa ở kinh nghiệm', `UPDATE experiences SET job_title = btrim(job_title), company_name = btrim(company_name), description = btrim(description)
    WHERE job_title <> btrim(job_title) OR company_name <> btrim(company_name) OR description <> btrim(description)`);
  await run('Cắt khoảng trắng thừa ở dự án', `UPDATE projects SET name = btrim(name), description = btrim(description) WHERE name <> btrim(name) OR description <> btrim(description)`);
  await run('Viết hoa tên vị trí dự án "tester intern"', `UPDATE project_jobs SET title = 'Tester Intern (Kiểm thử phần mềm)' WHERE lower(btrim(title)) = 'tester intern'`);
  await run('Cắt khoảng trắng thừa ở vị trí dự án', `UPDATE project_jobs SET title = btrim(title), description = btrim(description) WHERE title <> btrim(title) OR description <> btrim(description)`);
  await run('Cắt khoảng trắng thừa ở tin tuyển dụng', `UPDATE job_posts SET title = btrim(title) WHERE title <> btrim(title)`);
  // Số tiền thử nghiệm (30.000đ, 2.000đ) → mức thù lao thực tế
  await run('Ngân sách dự án "Kiểm thử phần mềm" 30.000đ → 15.000.000đ, dời hạn dự kiến (đã quá hạn) thêm 50 ngày', `UPDATE projects SET budget = 15000000, expected_end_date = '${localDate(inDays(50))}' WHERE budget < 1000000 AND budget > 0 AND expected_end_date < CURRENT_DATE`);
  await run('Thù lao vị trí tester intern 2.000đ → 2.000.000đ', `UPDATE project_jobs SET budget = 2000000 WHERE budget > 0 AND budget < 100000`);
  await run('Gia hạn hạn nộp của vị trí dự án sắp hết hạn (còn dưới 7 ngày) thêm 30 ngày', `UPDATE project_jobs SET deadline = '${endOfDay(inDays(30)).toISOString()}' WHERE status = 'OPEN' AND deadline IS NOT NULL AND deadline < now() + interval '7 days'`);
  // Điền chỗ trống cho 2 tài khoản thử nghiệm (không ghi đè dữ liệu đã có)
  await run('Bổ sung thông tin còn trống cho tài khoản dev2', `UPDATE candidate_profiles SET
      phone = COALESCE(NULLIF(btrim(phone), ''), '0912345678'),
      address = COALESCE(NULLIF(btrim(address), ''), 'TP. Hồ Chí Minh'),
      introduction = COALESCE(NULLIF(btrim(introduction), ''), 'Frontend Developer có 2 năm kinh nghiệm xây dựng giao diện web với React và TypeScript. Quan tâm đến trải nghiệm người dùng, hiệu năng và code sạch. Mong muốn tham gia các dự án thực tế để hoàn thiện kỹ năng và hồ sơ năng lực.')
    WHERE user_id = (SELECT id FROM users WHERE email = 'dev2@gmail.com')`);
  await run('Bổ sung giới thiệu cho tài khoản dev1', `UPDATE candidate_profiles SET
      introduction = COALESCE(NULLIF(btrim(introduction), ''), 'Fullstack Web Developer với kinh nghiệm Node.js, React và PostgreSQL. Từng làm việc theo Scrum, thích xây dựng sản phẩm từ ý tưởng đến triển khai. Sẵn sàng nhận các dự án thời vụ từ xa.')
    WHERE user_id = (SELECT id FROM users WHERE email = 'dev1@gmail.com')`);
  return out;
}

// ═════════════════════════════════════════════ Nạp dữ liệu ═════════════════════════════════════════════
async function insert(t, table, rows, { json = [], arrays = [] } = {}) {
  if (!rows.length) return;
  const qi = sequelize.getQueryInterface();
  const prepared = rows.map((r) => {
    const o = { ...r };
    for (const k of json) if (k in o) o[k] = JSON.stringify(o[k]);
    for (const k of arrays) if (k in o) o[k] = '{' + o[k].map((v) => '"' + String(v).replace(/(["\\])/g, '\\$1') + '"').join(',') + '}';
    return o;
  });
  for (let i = 0; i < prepared.length; i += 150) await qi.bulkInsert(table, prepared.slice(i, i + 150), { transaction: t });
}

async function seed(t) {
  const q = async (sql, replacements) => sequelize.query(sql, { type: 'SELECT', transaction: t, replacements });
  const counts = {};
  const count = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
  const logs = [];
  const notifs = [];

  // ── Tham chiếu có sẵn trong hệ thống ──
  const roles = Object.fromEntries((await q('SELECT id, name FROM roles')).map((r) => [r.name, r.id]));
  if (!roles.CANDIDATE || !roles.EMPLOYER) throw new Error('Chưa có vai trò CANDIDATE/EMPLOYER. Hãy chạy db:seed trước.');
  const admin = (await q("SELECT id, full_name FROM users WHERE email = 'admin@devhub.vn'"))[0] || null;
  const fptCompany = (await q("SELECT c.id, c.user_id, c.name, c.address, u.full_name FROM companies c JOIN users u ON u.id = c.user_id WHERE c.tax_code = '0101248141'"))[0] || null;
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const addLog = (userId, name, role, action, entityType, entityId, entityName, description, meta, when, oldV = null, newV = null) => {
    logs.push({
      id: id('log', logs.length, entityId || '', action), user_id: userId, user_name: name, user_role: role, action,
      entity_type: entityType, entity_id: entityId, entity_name: entityName, old_value: oldV, new_value: newV, description,
      metadata: { demo: true, ...meta }, ip_address: `27.${int(64, 79)}.${int(1, 254)}.${int(1, 254)}`, user_agent: pick(UAS), created_at: beforeNow(when),
    });
  };
  const addNotif = (userId, type, title, message, link, when, read, meta = {}) => {
    notifs.push({
      id: id('notif', notifs.length, userId, type), user_id: userId, type, title, message, link, is_read: read,
      metadata: { demo: true, ...meta }, created_at: beforeNow(when),
    });
  };

  // ── 1. Kỹ năng ──
  const existingSkills = await q('SELECT id, name FROM skills');
  const skillId = new Map(existingSkills.map((s) => [s.name.toLowerCase(), s.id]));
  const newSkillRows = [];
  for (const name of NEW_SKILLS) {
    if (!skillId.has(name.toLowerCase())) {
      const sid = id('skill', name);
      skillId.set(name.toLowerCase(), sid);
      newSkillRows.push({ id: sid, name, description: null, status: 'ACTIVE', created_at: ago(70), updated_at: ago(70) });
    }
  }
  await insert(t, 'skills', newSkillRows);
  count('Kỹ năng mới', newSkillRows.length);
  const sk = (name) => { const v = skillId.get(name.toLowerCase()); if (!v) throw new Error('Thiếu kỹ năng: ' + name); return v; };

  // ── 2. Tài khoản + doanh nghiệp ──
  const firstPost = {};
  SPECS.forEach((sp) => { firstPost[sp[0]] = Math.max(firstPost[sp[0]] || 0, sp[6]); });
  const users = []; const userRoles = []; const companyRows = [];
  const companies = {}; // key → { id, userId, name, address, hr, ... }
  for (const c of COMPANIES) {
    const email = `hr.${c.key}${DEMO_DOMAIN}`;
    const uid = id('user', email);
    const created = ago(Math.max(c.daysAgo, (firstPost[c.key] || 0) + 2));
    const logoFile = `demo-logo-${c.key}.png`;
    const logo = hasFile('images', logoFile) ? `/uploads/images/${logoFile}` : null;
    users.push({ id: uid, email, password_hash: passwordHash, full_name: c.hr, avatar_url: logo, status: 'ACTIVE', email_verified: true, created_at: created, updated_at: created });
    userRoles.push({ user_id: uid, role_id: roles.EMPLOYER });
    companies[c.key] = { ...c, id: id('company', c.key), userId: uid };
    companyRows.push({
      id: companies[c.key].id, user_id: uid, name: c.name, tax_code: c.tax, address: c.address, email: `tuyendung@${c.key}.vn`,
      website: c.website || `https://${c.key}.vn`, logo_url: logo, description: c.description, verification_status: c.verification,
      company_email_verified: c.verification === 'VERIFIED', created_at: created, updated_at: created,
    });
    addLog(uid, c.hr, 'EMPLOYER', 'USER_REGISTER', 'user', uid, c.hr, `${c.hr} (${email}) đã đăng ký tài khoản mới với vai trò EMPLOYER`, {}, created);
  }
  if (fptCompany) companies.fpt = { key: 'fpt', id: fptCompany.id, userId: fptCompany.user_id, name: fptCompany.name, address: fptCompany.address, hr: fptCompany.full_name, description: 'Tập đoàn công nghệ hàng đầu Việt Nam, triển khai các dự án chuyển đổi số cho khách hàng trong và ngoài nước. Môi trường chuyên nghiệp, nhiều cơ hội học hỏi và thăng tiến.' };

  // ── 3. Ứng viên ──
  const people = [];
  const usedNames = new Set();
  let n = 0;
  for (const [arch, def] of Object.entries(ARCHETYPES)) {
    for (let k = 0; k < def.count; k++) {
      const female = chance(0.42);
      let full; let ten; let ho;
      do {
        ho = pick(HO);
        const pool = female ? NU : NAM;
        ten = pick(pool.ten);
        full = `${ho} ${pick(pool.dem)} ${ten}`;
      } while (usedNames.has(full));
      usedNames.add(full);
      people.push({ idx: n++, arch, def, full, ten, ho });
    }
  }
  const shuffled = shuffle(people);
  const candidates = shuffled.map((p, i) => {
    const years = pick([0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6]);
    const handle = `${slug(p.ten)}-${slug(p.ho)}${i + 1}`;
    const email = `${slug(p.ten)}.${slug(p.ho)}${String(i + 1).padStart(2, '0')}${DEMO_DOMAIN}`;
    const status = i === shuffled.length - 1 ? 'INACTIVE' : i === shuffled.length - 2 ? 'LOCKED' : 'ACTIVE';
    const created = ago(2 + R() * 68);
    const extra = pickN(p.def.extra, Math.min(p.def.extra.length, int(2, 4)));
    const title = years === 0 ? `Fresher ${pick(p.def.titles)}` : years >= 5 ? `Senior ${pick(p.def.titles)}` : pick(p.def.titles);
    const expText = years === 0 ? 'Mình vừa tốt nghiệp và đã thực hiện nhiều đồ án, dự án cá nhân' : `Mình có ${years} năm kinh nghiệm`;
    const intro = `${expText} về ${p.def.focus}. Thành thạo ${p.def.core.join(', ')}${extra.length ? ` và đã làm quen với ${extra.slice(0, 2).join(', ')}` : ''}. ${pick(INTRO_CLOSERS)}`;
    return {
      ...p, years, handle, email, status, created, skills: [...p.def.core, ...extra], title, intro,
      userId: id('user', email), profileId: id('profile', email), city: pick(CITIES),
      phone: `0${pick(['3', '5', '7', '8', '9'])}${String(int(0, 99999999)).padStart(8, '0')}`,
      active: status === 'ACTIVE', projectCount: 0,
      cvFile: `demo-cv-${slugDash(p.full)}.pdf`,
    };
  });
  const profileRows = []; const candSkillRows = []; const expRows = []; const cvRows = [];
  for (const c of candidates) {
    if (c.active && hasFile('cvs', c.cvFile)) {
      c.cvUrl = `/uploads/cvs/${c.cvFile}`;
      c.cvDisplay = `CV_${stripVi(c.full).replace(/\s+/g, '')}.pdf`;
      const when = new Date(c.created.getTime() + 7200000);
      cvRows.push({ id: id('cv', c.profileId), candidate_profile_id: c.profileId, name: 'CV chính', file_url: c.cvUrl, file_name: c.cvDisplay, file_size: fs.statSync(path.join(UPLOADS, 'cvs', c.cvFile)).size, is_default: true, created_at: when, updated_at: when });
    } else { c.cvUrl = null; }
    users.push({
      id: c.userId, email: c.email, password_hash: passwordHash, full_name: c.full, status: c.status, email_verified: c.status !== 'INACTIVE',
      created_at: c.created, updated_at: c.created,
    });
    userRoles.push({ user_id: c.userId, role_id: roles.CANDIDATE });
    profileRows.push({
      id: c.profileId, user_id: c.userId, professional_title: c.title, introduction: c.intro, phone: c.phone, address: c.city,
      github_url: `https://github.com/${c.handle}`,
      portfolio_url: ['uiux', 'frontend'].includes(c.arch) && chance(0.6) ? `https://${c.handle}.dev` : null,
      avatar_url: null, cv_url: c.cvUrl, cv_name: c.cvUrl ? c.cvDisplay : null, competency_score: 0, created_at: new Date(c.created.getTime() + 3600000), updated_at: c.created,
    });
    for (const s of c.skills) candSkillRows.push({ candidate_profile_id: c.profileId, skill_id: sk(s), source: chance(0.25) ? 'CV' : 'MANUAL' });
    addLog(c.userId, c.full, 'CANDIDATE', 'USER_REGISTER', 'user', c.userId, c.full, `${c.full} (${c.email}) đã đăng ký tài khoản mới với vai trò CANDIDATE`, {}, c.created);

    // Kinh nghiệm làm việc
    const techs = (k) => pickN(c.skills, Math.min(k, c.skills.length));
    if (c.years === 0) {
      let cursor = 4 + int(0, 8); // tháng trước
      if (chance(0.45)) {
        const eid = id('exp', c.profileId, 'intern');
        expRows.push({
          id: eid, candidate_profile_id: c.profileId, type: 'COMPANY', parent_id: null, job_title: `Thực tập sinh ${pick(c.def.roles)}`,
          company_name: pick(PAST_COMPANIES), start_date: localDate(ago(cursor * 30)), end_date: localDate(ago((cursor - 3) * 30)),
          description: `Thực tập 3 tháng, tham gia các tác vụ về ${c.def.focus} dưới sự hướng dẫn của mentor.`,
          tasks: pickN(c.def.tasks, 2), technologies: techs(3), link_url: null, created_at: c.created, updated_at: c.created,
        });
        cursor -= 3;
      }
      const prj = pickN(PERSONAL_PROJECTS, int(1, 2));
      prj.forEach(([name, desc], pi) => {
        expRows.push({
          id: id('exp', c.profileId, 'personal', pi), candidate_profile_id: c.profileId, type: 'PERSONAL', parent_id: null, job_title: 'Tác giả dự án',
          company_name: name, start_date: localDate(ago((cursor + 2 + pi * 2) * 30)), end_date: localDate(ago((cursor - 1 + pi) * 30 > 0 ? (cursor - 1 + pi) * 30 : 20)),
          description: desc, tasks: pickN(c.def.tasks, 2), technologies: techs(3),
          link_url: `https://github.com/${c.handle}/${slug(name).slice(0, 24)}`, created_at: c.created, updated_at: c.created,
        });
      });
    } else {
      const nComp = c.years < 2 ? 1 : c.years < 5 ? 2 : 3;
      const totalMonths = c.years * 12 + int(0, 5);
      const each = Math.floor(totalMonths / nComp);
      const companiesUsed = pickN(PAST_COMPANIES, nComp);
      let startMonthsAgo = totalMonths;
      let latestId = null; let latestStart = null;
      for (let k = 0; k < nComp; k++) {
        const isLatest = k === nComp - 1;
        const endMonthsAgo = isLatest ? 0 : startMonthsAgo - each;
        const level = k === 0 && nComp > 1 ? 'Junior ' : isLatest && c.years >= 5 ? 'Senior ' : '';
        const eid = id('exp', c.profileId, 'company', k);
        const startD = ago(startMonthsAgo * 30);
        expRows.push({
          id: eid, candidate_profile_id: c.profileId, type: 'COMPANY', parent_id: null, job_title: `${level}${pick(c.def.roles)}`,
          company_name: companiesUsed[k], start_date: localDate(startD), end_date: isLatest ? null : localDate(ago(endMonthsAgo * 30)),
          description: `Tham gia phát triển ${c.def.focus} cho các sản phẩm của công ty, làm việc theo Scrum.`,
          tasks: pickN(c.def.tasks, 3), technologies: techs(4), link_url: null, created_at: c.created, updated_at: c.created,
        });
        if (isLatest) { latestId = eid; latestStart = startD; }
        startMonthsAgo = endMonthsAgo;
      }
      if (latestId && chance(0.5)) {
        expRows.push({
          id: id('exp', c.profileId, 'project'), candidate_profile_id: c.profileId, type: 'PROJECT', parent_id: latestId,
          job_title: 'Thành viên phát triển', company_name: pick(['Hệ thống quản lý nhân sự nội bộ', 'Cổng thanh toán cho khách hàng doanh nghiệp', 'Ứng dụng chăm sóc khách hàng', 'Nền tảng báo cáo và thống kê']),
          start_date: localDate(new Date(latestStart.getTime() + 20 * MS_DAY)), end_date: null,
          description: 'Dự án trọng điểm của công ty, làm việc cùng đội 6–8 người.', tasks: pickN(c.def.tasks, 2), technologies: techs(3),
          link_url: null, created_at: c.created, updated_at: c.created,
        });
      }
      if (c.years >= 2 && chance(0.3)) {
        expRows.push({
          id: id('exp', c.profileId, 'freelance'), candidate_profile_id: c.profileId, type: 'FREELANCE', parent_id: null, job_title: 'Freelancer',
          company_name: 'Khách hàng cá nhân (freelance)', start_date: localDate(ago(10 * 30)), end_date: localDate(ago(4 * 30)),
          description: 'Nhận làm website và công cụ nhỏ cho khách hàng cá nhân vào thời gian rảnh.', tasks: pickN(c.def.tasks, 2), technologies: techs(3),
          link_url: null, created_at: c.created, updated_at: c.created,
        });
      }
    }
  }
  const activeCands = candidates.filter((c) => c.active);

  // ── 4. Tin tuyển dụng + ứng tuyển ──
  const years2 = (lvl, y) => ({ INTERN: y <= 1, FRESHER: y <= 1, JUNIOR: y >= 1 && y <= 3, MIDDLE: y >= 2 && y <= 5, SENIOR: y >= 4 })[lvl];
  const RELATED = { fullstack: ['frontend', 'backend_node'], python: ['data_ai'], data_ai: ['python'], backend_node: ['fullstack', 'java'], frontend: ['fullstack', 'uiux'], java: ['backend_node', 'dotnet'], dotnet: ['java'], php: ['backend_node'], mobile: ['frontend'], uiux: ['frontend'], qa: [], devops: [] };
  const affinity = (c, roleKey) => (c.arch === roleKey ? 3 : (RELATED[roleKey] || []).includes(c.arch) ? 1.5 : 0);
  // Mỗi lần được chọn thì bị trừ điểm, để các hồ sơ ứng tuyển phân bổ đều giữa các ứng viên (không ai nộp quá nhiều đơn)
  const usage = new Map();
  const choose = (roleKey, k, exclude, level) => {
    const picked = activeCands
      .filter((c) => !exclude.has(c.profileId))
      .map((c) => ({ c, s: affinity(c, roleKey) * 2 + R() * 2.2 + (level ? (years2(level, c.years) ? 1 : -0.7) : 0) - 0.45 * (usage.get(c.profileId) || 0) }))
      .sort((a, b) => b.s - a.s).slice(0, k).map((x) => x.c);
    picked.forEach((c) => usage.set(c.profileId, (usage.get(c.profileId) || 0) + 1));
    return picked;
  };

  const jobRows = []; const jobSkillRows = []; const appRows = []; const histRows = [];
  SPECS.forEach(([ck, rk, lvl, wt, loc, status, postedAgo, deadlineIn, qty], i) => {
    const co = companies[ck];
    if (!co) return;
    const role = ROLES[rk]; const L = LEVELS[lvl];
    const prefix = { INTERN: '', FRESHER: 'Fresher ', JUNIOR: 'Junior ', MIDDLE: '', SENIOR: 'Senior ' }[lvl];
    const suffix = { INTERN: ' Intern', FRESHER: '', JUNIOR: '', MIDDLE: '', SENIOR: '' }[lvl];
    const wtSuffix = { REMOTE: ' (Remote)', PART_TIME: ' (Part-time)', FREELANCE: ' (Freelance)', FULL_TIME: '' }[wt];
    const title = `${prefix}${role.title}${suffix}${wtSuffix}`;
    const jid = jobId(i);
    const posted = ['PENDING_APPROVAL', 'DRAFT'].includes(status) ? null : ago(postedAgo);
    const created = ago(postedAgo + (posted ? 0.6 : 0.1));
    const lo = L.sal[0] + R() * (L.sal[1] - L.sal[0]) * 0.35;
    const hi = lo + (L.sal[1] - lo) * (0.45 + R() * 0.55);
    const scale = wt === 'PART_TIME' ? 0.5 : 1;
    const round = (m) => Math.round(m * scale * 2) / 2 * 1000000;
    const negotiable = i % 11 === 7;
    const duties = pickN(role.duties, 5);
    const benefits = wt === 'REMOTE' || wt === 'FREELANCE' ? [...pickN(BENEFITS_REMOTE, 3), ...pickN(BENEFITS, 2)] : pickN(BENEFITS, 5);
    const deadline = deadlineIn === null ? null : endOfDay(inDays(deadlineIn));
    const views = posted ? Math.floor((postedAgo + 1) * (6 + R() * 26)) : 0;
    jobRows.push({
      id: jid, created_by_user_id: co.userId, company_id: co.id, title,
      description: `${firstSentence(co.description)}\nChúng tôi đang tìm ${title} gia nhập đội ngũ phát triển ${role.stack}.\n\nBạn sẽ:\n${duties.map((d) => `- ${d}`).join('\n')}`,
      post_type: 'PARTNER', work_type: wt, location: CITY[loc], work_address: loc === 'ALL' ? null : co.address,
      salary_min: negotiable ? null : round(lo), salary_max: negotiable ? null : round(hi), quantity: qty,
      requirements: [`${L.years}`, ...pickN(role.reqs, 5)].map((r) => `- ${r}`).join('\n'),
      benefits: benefits.map((b) => `- ${b}`).join('\n'), experience: L.exp, position_level: lvl,
      working_time: pick(WORKING_TIME[wt]), posted_at: posted, deadline, status, view_count: views, created_at: created, updated_at: posted || created,
    });
    for (const s of role.skills.slice(0, 5)) jobSkillRows.push({ job_post_id: jid, skill_id: sk(s) });
    if (status === 'PENDING_APPROVAL') {
      if (admin) addNotif(admin.id, 'JOB_PENDING', 'Có tin tuyển dụng chờ duyệt', `${co.name} vừa đăng tin "${title}".`, '/admin/jobs', created, false, { job_post_id: jid });
    }
    if (status === 'OPEN' && postedAgo <= 7) addNotif(co.userId, 'JOB_APPROVED', 'Tin tuyển dụng đã được duyệt', `Tin "${title}" đã được duyệt và hiển thị công khai.`, `/employer/jobs/${jid}`, posted, postedAgo > 2, { job_post_id: jid });
    if (status === 'HIDDEN') addNotif(co.userId, 'JOB_REJECTED', 'Tin tuyển dụng chưa được duyệt', `Tin "${title}" chưa được duyệt. Bạn có thể chỉnh sửa nội dung rồi gửi lại.`, `/employer/jobs/${jid}`, ago(postedAgo - 1), true, { job_post_id: jid });

    // Hồ sơ ứng tuyển
    if (['OPEN', 'CLOSED'].includes(status)) {
      const k = status === 'CLOSED' ? int(4, 7) : Math.min(7, Math.max(1, Math.floor(postedAgo / 3) + int(0, 3)));
      let hiredLeft = qty;
      for (const c of choose(rk, k, new Set(), lvl)) {
        const windowEnd = status === 'CLOSED' && deadline ? Math.min(deadline.getTime(), NOW.getTime()) : NOW.getTime();
        const appliedAt = beforeNow(new Date(posted.getTime() + (windowEnd - posted.getTime()) * (0.05 + 0.9 * R() * R() + 0.02)));
        const ageDays = (NOW - appliedAt) / MS_DAY;
        let st;
        if (status === 'CLOSED') st = weighted([['HIRED', hiredLeft > 0 ? 28 : 0], ['REJECTED', 60], ['INTERVIEW', 6], ['VIEWED', 6]]);
        else if (ageDays <= 2.5) st = weighted([['PENDING', 70], ['VIEWED', 25], ['INTERVIEW', 5]]);
        else st = weighted([['PENDING', 14], ['VIEWED', 24], ['INTERVIEW', 24], ['HIRED', hiredLeft > 0 ? 10 : 0], ['REJECTED', 28]]);
        if (st === 'HIRED') hiredLeft--;
        const aid = id('app', jid, c.profileId);
        const chain = ['PENDING'];
        if (st !== 'PENDING') {
          if (['VIEWED', 'INTERVIEW', 'HIRED', 'REJECTED'].includes(st) && (st === 'VIEWED' || chance(0.75))) chain.push('VIEWED');
          if (['INTERVIEW', 'HIRED'].includes(st) || (st === 'REJECTED' && chance(0.3))) chain.push('INTERVIEW');
          if (['HIRED', 'REJECTED'].includes(st)) chain.push(st);
          else if (chain[chain.length - 1] !== st) chain.push(st);
        }
        const NOTES = {
          PENDING: 'Hồ sơ vừa được nộp',
          VIEWED: null,
          INTERVIEW: pick(['Mời phỏng vấn vòng 1 qua Google Meet, thời gian chi tiết sẽ gửi qua email.', 'Mời bạn trao đổi chuyên môn 45 phút với trưởng nhóm kỹ thuật.', null]),
          HIRED: pick(['Chúc mừng bạn! Bộ phận nhân sự sẽ liên hệ để trao đổi về offer.', null]),
          REJECTED: pick(['Hồ sơ chưa phù hợp với yêu cầu hiện tại của vị trí.', 'Cảm ơn bạn đã quan tâm, chúng tôi sẽ lưu hồ sơ cho các vị trí phù hợp sau này.', null]),
        };
        let last = appliedAt;
        chain.forEach((s, ci) => {
          const when = ci === 0 ? appliedAt : beforeNow(new Date(appliedAt.getTime() + (NOW - appliedAt) * Math.min(0.95, (ci / chain.length) * (0.5 + R() * 0.5) + 0.05)));
          last = when;
          histRows.push({ id: id('hist', aid, ci), application_id: aid, status: s, note: NOTES[s], changed_at: when });
          if (ci > 0) {
            addLog(co.userId, co.hr, 'EMPLOYER', 'APPLICATION_STATUS_CHANGED', 'application', aid, title, `Đơn ứng tuyển của ${c.full} đã chuyển sang trạng thái: ${APP_STATUS_LABEL[s]}`, { job_post_id: jid }, when, chain[ci - 1], s);
            if (s !== 'PENDING' && (NOW - when) / MS_DAY <= 14) {
              const T = {
                VIEWED: ['Hồ sơ của bạn đã được xem', `${co.name} đã xem hồ sơ ứng tuyển vị trí "${title}" của bạn.`],
                INTERVIEW: ['Bạn được mời phỏng vấn', `${co.name} mời bạn vào vòng phỏng vấn cho vị trí "${title}". Hãy chú ý email và điện thoại để nhận lịch.`],
                HIRED: ['Chúc mừng, bạn đã trúng tuyển!', `${co.name} đã nhận bạn vào vị trí "${title}". Bộ phận nhân sự sẽ sớm liên hệ để trao đổi chi tiết.`],
                REJECTED: ['Kết quả ứng tuyển', `${co.name} chưa thể tiếp nhận hồ sơ vị trí "${title}" của bạn lần này. Cảm ơn bạn đã quan tâm.`],
              }[s];
              addNotif(c.userId, 'APPLICATION_STATUS', T[0], T[1], '/candidate/applications', when, chance(0.5), { application_id: aid, status: s });
            }
          }
        });
        appRows.push({
          id: aid, candidate_profile_id: c.profileId, job_post_id: jid, cover_letter: pick(COVER_LETTERS) || null, cv_url: c.cvUrl && chance(0.85) ? c.cvUrl : null, status: st,
          applied_at: appliedAt, updated_at: last,
        });
        addLog(c.userId, c.full, 'CANDIDATE', 'APPLICATION_SUBMITTED', 'application', aid, title, `Đã nộp đơn ứng tuyển cho vị trí "${title}"`, { job_post_id: jid }, appliedAt);
        if (ageDays <= 10) addNotif(co.userId, 'APPLICATION_SUBMITTED', 'Có hồ sơ ứng tuyển mới', `${c.full} vừa nộp hồ sơ vào vị trí "${title}".`, `/employer/jobs/${jid}?tab=applications`, appliedAt, st !== 'PENDING' || ageDays > 4, { application_id: aid, job_post_id: jid });
      }
    }
  });
  if (!fptCompany) console.warn('  (Không thấy doanh nghiệp FPT Software có sẵn, bỏ qua 4 tin của FPT)');

  // ── 5. Dự án nội bộ ──
  const projRows = []; const wsRows = []; const pjRows = []; const pjSkillRows = []; const papRows = []; const wmRows = [];
  const taskRows = []; const assigneeRows = []; const subRows = []; const commentRows = []; const actRows = []; const subRowsX = []; const submissionRows = []; const evalRows = [];
  const memberUsage = new Map(); // profileId → số dự án đã tham gia
  const payRows = []; const bankProfiles = new Set(); const noBankProfiles = new Set(); const paidTx = new Set();
  const evalsByProfile = new Map();
  const projectSkillsByProfile = new Map();

  for (const P of PROJECTS) {
    const pid = projectId(P.key);
    const wsId = id('ws', P.key);
    const start = ago(P.startAgo);
    const created = ago(P.startAgo + 6);
    const doneP = P.status === 'COMPLETED';
    projRows.push({
      id: pid, name: P.name, description: P.description, budget: P.budget, start_date: localDate(start), expected_end_date: localDate(inDays(P.endIn)),
      actual_end_date: doneP ? localDate(ago(P.actualEndAgo)) : null, status: P.status, completion_rate: 0, created_by_user_id: admin?.id || null,
      manager_id: null, created_at: created, updated_at: doneP ? ago(P.actualEndAgo) : created,
    });
    wsRows.push({ id: wsId, project_id: pid, name: `WS - ${P.name}`, status: doneP ? 'CLOSED' : 'ACTIVE', created_at: created, updated_at: created });
    if (admin) addLog(admin.id, admin.full_name, 'ADMIN', 'PROJECT_CREATED', 'project', pid, P.name, `Tạo dự án mới "${P.name}"`, { workspace_id: wsId, project_id: pid }, created);

    const hasWs = ['IN_PROGRESS', 'COMPLETED'].includes(P.status);
    const usedInProject = new Set();
    const memberOf = {}; // jobKey → { cand, wmId }
    for (const J of P.jobs) {
      const role = ROLES[J.role];
      const pjid = id('pjob', P.key, J.key);
      const jobCreated = ago(P.startAgo + (J.status === 'CLOSED' ? 5 : 0.5));
      const closedDeadline = ago(P.startAgo - 1);
      pjRows.push({
        id: pjid, project_id: pid, title: J.title,
        description: `Tham gia dự án "${P.name}" với vai trò ${J.title.split(' (')[0]}.\n\nCông việc chính:\n${pickN(role.duties, 4).map((d) => `- ${d}`).join('\n')}`,
        budget: J.budget, quantity: J.qty, deadline: J.status === 'CLOSED' ? endOfDay(closedDeadline) : endOfDay(inDays(J.deadlineIn || 20)),
        status: J.status, requirements: pickN(role.reqs, 4).map((r) => `- ${r}`).join('\n'), benefits: pickN(CLIENT_BENEFITS, 4).map((b) => `- ${b}`).join('\n'),
        experience: J.experience, created_at: jobCreated, updated_at: jobCreated,
      });
      for (const s of role.skills.slice(0, 4)) pjSkillRows.push({ project_job_id: pjid, skill_id: sk(s) });

      const appsFor = []; // [cand, status, appliedAt]
      if (hasWs) {
        const [member] = choose(J.role, 1, new Set([...usedInProject, ...activeCands.filter((c) => (memberUsage.get(c.profileId) || 0) >= 2).map((c) => c.profileId)]), J.lead ? 'MIDDLE' : undefined);
        usedInProject.add(member.profileId);
        memberUsage.set(member.profileId, (memberUsage.get(member.profileId) || 0) + 1);
        memberOf[J.key] = { cand: member, wmId: id('wm', P.key, J.key), job: J, pjid };
        appsFor.push([member, 'ACCEPTED', ago(P.startAgo + 3 + R() * 4)]);
        for (const c of choose(J.role, int(2, 3), usedInProject)) { usedInProject.add(c.profileId); appsFor.push([c, 'REJECTED', ago(P.startAgo + 2 + R() * 6)]); }
      } else {
        const k = int(3, 6);
        for (const c of choose(J.role, k, usedInProject)) {
          usedInProject.add(c.profileId);
          const st = weighted([['PENDING', 38], ['REVIEWING', 24], ['INTERVIEW', 22], ['REJECTED', 10], ['ACCEPTED', J.key === 'fs1' && !appsFor.some((a) => a[1] === 'ACCEPTED') ? 100 : 0]]);
          appsFor.push([c, st, ago(R() * Math.max(P.startAgo, 3) * 0.9 + 0.1)]);
        }
      }
      for (const [c, st, appliedAt] of appsFor) {
        const aid = id('papp', pjid, c.profileId);
        const interviewed = ['INTERVIEW', 'ACCEPTED'].includes(st) || (st === 'REJECTED' && chance(0.3));
        const iv = st === 'INTERVIEW' ? (() => { const d = inDays(1 + R() * 4); d.setHours(pick([9, 10, 14, 15]), pick([0, 30]), 0, 0); return d; })() : interviewed ? new Date(Math.min(appliedAt.getTime() + 3 * MS_DAY, NOW.getTime() - 3600000)) : null;
        papRows.push({
          id: aid, project_job_id: pjid, candidate_profile_id: c.profileId, cover_letter: pick(COVER_LETTERS) || null, cv_url: c.cvUrl && chance(0.9) ? c.cvUrl : null, status: st,
          interview_time: iv, meet_url: iv ? meetUrl() : null,
          interview_note: iv ? 'Phỏng vấn kỹ thuật 45 phút: trao đổi kinh nghiệm và làm bài tập ngắn.' : null,
          applied_at: beforeNow(appliedAt), updated_at: beforeNow(new Date(appliedAt.getTime() + 2 * MS_DAY)),
        });
        addLog(c.userId, c.full, 'CANDIDATE', 'APPLICATION_SUBMITTED', 'project_application', aid, J.title, `Đã nộp đơn ứng tuyển cho vị trí "${J.title}"`, { project_job_id: pjid, project_id: pid }, appliedAt);
        if (st === 'INTERVIEW' && admin) addLog(admin.id, admin.full_name, 'ADMIN', 'INTERVIEW_SCHEDULED', 'project_application', aid, J.title, `Đã xếp lịch phỏng vấn cho ${c.full}`, { project_job_id: pjid }, new Date(Math.min(NOW.getTime() - 3600000, appliedAt.getTime() + MS_DAY)));
        if (st === 'INTERVIEW') addNotif(c.userId, 'INTERVIEW_SCHEDULED', 'Lịch phỏng vấn được đặt', `Bạn được mời phỏng vấn vị trí "${J.title}" vào ${iv.toLocaleString('vi-VN')}.`, '/candidate/applications', new Date(Math.min(NOW.getTime() - 3600000, appliedAt.getTime() + MS_DAY)), false, { project_job_id: pjid });
        if (['PENDING', 'REVIEWING'].includes(st) && (NOW - appliedAt) / MS_DAY <= 6 && admin) addNotif(admin.id, 'PROJECT_APPLICATION', 'Có ứng viên mới ứng tuyển dự án', `${c.full} vừa ứng tuyển vị trí "${J.title}".`, '/admin/projects', appliedAt, false, { project_job_id: pjid });
      }
    }

    // Workspace: thành viên, task, đánh giá
    if (hasWs) {
      const members = Object.values(memberOf);
      members.forEach((m) => {
        wmRows.push({
          id: m.wmId, workspace_id: wsId, candidate_profile_id: m.cand.profileId, project_job_id: m.pjid, role: m.job.lead ? 'LEAD' : 'MEMBER',
          joined_at: new Date(start.getTime() + MS_DAY), status: doneP ? 'COMPLETED' : 'ACTIVE',
        });
        if (admin) addLog(admin.id, admin.full_name, 'ADMIN', 'WORKSPACE_MEMBER_ADDED', 'workspace_member', m.wmId, m.cand.full, `Đã thêm ${m.cand.full} vào workspace`, { workspace_id: wsId, project_id: pid, user_id: m.cand.userId }, new Date(start.getTime() + MS_DAY));
        if ((NOW - start) / MS_DAY <= 14) addNotif(m.cand.userId, 'MEMBER_ADDED', 'Bạn được thêm vào workspace', `Bạn đã được thêm vào dự án "${P.name}".`, `/candidate/workspaces/${wsId}`, new Date(start.getTime() + MS_DAY), true, { workspace_id: wsId });
        // kỹ năng của vị trí đã làm → minh chứng trong hồ sơ
        if (doneP) {
          const set = projectSkillsByProfile.get(m.cand.profileId) || new Set();
          ROLES[m.job.role].skills.slice(0, 4).forEach((s) => set.add(s));
          projectSkillsByProfile.set(m.cand.profileId, set);
        }
      });
      const lead = members.find((m) => m.job.lead) || members[0];
      const positions = {};
      let doneCount = 0;
      P.tasks.forEach(([title, who, status, prio, hrs, dl, labels, subs, comment], ti) => {
        const m = memberOf[who] || lead;
        const tid = id('task', P.key, ti);
        const maxAgo = P.startAgo - 0.5;
        const clamp = (x) => Math.max(0.2, Math.min(x, maxAgo));
        let tl;
        if (status === 'DONE') {
          const reviewedAgo = clamp(dl < 0 ? -dl - R() * 2 : 1 + R() * 4);
          const submittedAgo = clamp(reviewedAgo + 0.3 + R() * 1.2);
          const startedAgo = clamp(submittedAgo + hrs / 8 + R() * 3);
          tl = { reviewedAgo, submittedAgo, startedAgo, createdAgo: clamp(startedAgo + 0.5 + R() * 3) };
        } else if (status === 'REVIEW') {
          const submittedAgo = clamp(0.2 + R() * 2); const startedAgo = clamp(submittedAgo + hrs / 8 + R() * 3);
          tl = { submittedAgo, startedAgo, createdAgo: clamp(startedAgo + 1 + R() * 4) };
        } else if (status === 'IN_PROGRESS') {
          const startedAgo = clamp(0.5 + R() * 5);
          tl = { startedAgo, createdAgo: clamp(startedAgo + 1 + R() * 6) };
        } else tl = { createdAgo: clamp(0.5 + R() * 8) };
        positions[status] = (positions[status] || 0);
        const done = status === 'DONE';
        if (done) doneCount++;
        const note = pick(['Đạt yêu cầu, cảm ơn bạn.', 'Hoàn thành tốt và đúng hạn.', 'Chất lượng tốt, đã kiểm tra lại.', 'Ổn, đã nghiệm thu.']);
        taskRows.push({
          id: tid, workspace_id: wsId, title, description: `${title}.\n\nTiêu chí hoàn thành:\n- Đúng mô tả và yêu cầu đã thống nhất\n- Đã tự kiểm tra, không còn lỗi nghiêm trọng\n- Ghi chú bàn giao đầy đủ khi cần`,
          priority: prio, status, labels, deadline: endOfDay(inDays(dl)), estimated_hours: hrs,
          actual_hours: done || status === 'REVIEW' ? Math.round(hrs * (0.8 + R() * 0.5) * 2) / 2 : null, completion_rate: 0, position: positions[status]++,
          review_note: done ? note : null, reviewed_by: done ? lead.wmId : null, reviewed_at: done ? ago(tl.reviewedAgo) : null,
          review_status: done ? 'APPROVED' : 'PENDING', created_at: ago(tl.createdAgo), updated_at: ago(tl.reviewedAgo ?? tl.submittedAgo ?? tl.startedAgo ?? tl.createdAgo),
        });
        assigneeRows.push({ id: id('ta', tid, m.wmId), task_id: tid, workspace_member_id: m.wmId });
        if (chance(0.2) && members.length > 1) { const o = pick(members.filter((x) => x.wmId !== m.wmId)); assigneeRows.push({ id: id('ta', tid, o.wmId), task_id: tid, workspace_member_id: o.wmId }); }
        subs.forEach((st, si) => subRows.push({ id: id('sub', tid, si), task_id: tid, title: `${si + 1}. ${st}`, is_done: done || status === 'REVIEW' || (status === 'IN_PROGRESS' && si < Math.ceil(subs.length / 2)), position: si, created_at: ago(tl.createdAgo), updated_at: ago(tl.createdAgo) }));
        const act = (when, action, who2, oldV, newV, d) => actRows.push({ id: id('act', tid, actRows.length), task_id: tid, workspace_member_id: who2, action, old_value: oldV, new_value: newV, description: d, created_at: beforeNow(when) });
        act(ago(tl.createdAgo), 'TASK_CREATED', null, null, null, `Tạo task: ${title}`);
        if (admin) addLog(admin.id, admin.full_name, 'ADMIN', 'TASK_CREATED', 'task', tid, title, `Tạo task "${title}"`, { workspace_id: wsId, project_id: pid }, ago(tl.createdAgo));
        if (tl.startedAgo !== undefined) {
          act(ago(tl.startedAgo), 'STATUS_CHANGED', null, 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm');
          addLog(m.cand.userId, m.cand.full, 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', tid, title, `Chuyển trạng thái: Cần làm → Đang làm`, { workspace_id: wsId, project_id: pid }, ago(tl.startedAgo), 'TODO', 'IN_PROGRESS');
        }
        if (tl.submittedAgo !== undefined) {
          const sid = id('subm', tid, 1);
          const revised = done && chance(0.2);
          const link = labels.includes('Design') ? `https://www.figma.com/design/demo${ti}/${slug(title).slice(0, 20)}` : labels.includes('Testing') ? `https://docs.google.com/spreadsheets/d/demo${ti}-${slug(title).slice(0, 10)}/edit` : `https://github.com/demo-team/${P.key.replace('p_', '')}/pull/${ti + 3}`;
          if (revised) {
            submissionRows.push({ id: sid, task_id: tid, product_url: link, attachment_url: null, note: 'Em đã hoàn thành, nhờ anh/chị duyệt.', version: 1, review_status: 'REVISION_REQUIRED', submitted_at: ago(tl.submittedAgo + 0.8) });
            act(ago(tl.submittedAgo + 0.8), 'SUBMITTED', m.wmId, null, '1', 'Nộp sản phẩm lần 1 và gửi duyệt');
            act(ago(tl.submittedAgo + 0.4), 'TASK_REVISION', null, null, null, 'Yêu cầu chỉnh sửa: bổ sung xử lý trường hợp dữ liệu rỗng');
          }
          const ver = revised ? 2 : 1;
          submissionRows.push({ id: revised ? id('subm', tid, 2) : sid, task_id: tid, product_url: link, attachment_url: null, note: 'Em đã hoàn thành theo mô tả, nhờ anh/chị duyệt giúp.', version: ver, review_status: done ? 'ACCEPTED' : 'PENDING_REVIEW', submitted_at: ago(tl.submittedAgo) });
          act(ago(tl.submittedAgo), 'SUBMITTED', m.wmId, null, String(ver), `Nộp sản phẩm lần ${ver} và gửi duyệt`);
          addLog(m.cand.userId, m.cand.full, 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', tid, title, 'Chuyển trạng thái: Đang làm → Chờ duyệt', { workspace_id: wsId, project_id: pid }, ago(tl.submittedAgo), 'IN_PROGRESS', 'REVIEW');
          if (status === 'REVIEW' && admin) addNotif(admin.id, 'TASK_STATUS_CHANGED', 'Task chờ nghiệm thu', `${m.cand.full} đã nộp "${title}" và chờ bạn duyệt.`, `/admin/workspaces/${wsId}`, ago(tl.submittedAgo), false, { workspace_id: wsId });
        }
        if (done) {
          act(ago(tl.reviewedAgo), 'TASK_APPROVED', null, null, null, `Nghiệm thu: duyệt hoàn thành — "${note}"`);
          if (admin) addLog(admin.id, admin.full_name, 'ADMIN', 'TASK_APPROVED', 'task', tid, title, `Nghiệm thu: duyệt hoàn thành — "${note}"`, { workspace_id: wsId, project_id: pid }, ago(tl.reviewedAgo));
          if (tl.reviewedAgo <= 14) addNotif(m.cand.userId, 'TASK_APPROVED', 'Task được duyệt', `Task "${title}" của bạn đã được nghiệm thu.`, `/candidate/workspaces/${wsId}`, ago(tl.reviewedAgo), tl.reviewedAgo > 3, { workspace_id: wsId });
          if (admin) commentRows.push({ id: id('cmt', tid, 'admin'), task_id: tid, workspace_member_id: null, user_id: admin.id, content: 'Đã nghiệm thu, cảm ơn bạn.', created_at: ago(tl.reviewedAgo), updated_at: ago(tl.reviewedAgo) });
        }
        if (comment) commentRows.push({ id: id('cmt', tid, 'm'), task_id: tid, workspace_member_id: m.wmId, user_id: m.cand.userId, content: comment, created_at: ago(tl.submittedAgo ?? tl.startedAgo ?? tl.createdAgo), updated_at: ago(tl.submittedAgo ?? tl.startedAgo ?? tl.createdAgo) });
        if (['TODO', 'IN_PROGRESS'].includes(status) && tl.createdAgo <= 14) addNotif(m.cand.userId, 'TASK_ASSIGNED', 'Task mới được giao', `Bạn được giao task "${title}" trong dự án "${P.name}".`, `/candidate/workspaces/${wsId}`, ago(tl.createdAgo), tl.createdAgo > 4, { workspace_id: wsId });
      });
      const pr = projRows[projRows.length - 1];
      pr.completion_rate = doneP ? 100 : P.tasks.length ? Math.round((doneCount / P.tasks.length) * 100) : 0;

      if (doneP && P.scores) {
        members.forEach((m) => {
          const [score, cmt] = P.scores[m.job.key] || [8, 'Hoàn thành công việc đúng yêu cầu.'];
          const when = ago(P.actualEndAgo - 0.5);
          evalRows.push({ id: id('eval', m.wmId), workspace_member_id: m.wmId, score, comment: cmt, evaluated_at: when });
          const list = evalsByProfile.get(m.cand.profileId) || []; list.push(score); evalsByProfile.set(m.cand.profileId, list);
          if (admin) addLog(admin.id, admin.full_name, 'ADMIN', 'MEMBER_EVALUATED', 'evaluation', id('eval', m.wmId), `Đánh giá ${m.cand.full}`, `Đã đánh giá thành viên ${m.cand.full} với ${score} điểm`, { workspace_id: wsId, project_id: pid, user_id: m.cand.userId }, when);
          if (P.actualEndAgo <= 30) addNotif(m.cand.userId, 'APPLICATION_STATUS', 'Bạn đã được đánh giá', `Admin đã đánh giá bạn ${score}/10 cho dự án "${P.name}".`, `/candidate/workspaces/${wsId}`, when, true, { workspace_id: wsId });
        });
        if (admin) addLog(admin.id, admin.full_name, 'ADMIN', 'PROJECT_CLOSED', 'project', pid, P.name, `Cập nhật dự án "${P.name}" (Trạng thái: COMPLETED)`, { workspace_id: wsId, project_id: pid }, ago(P.actualEndAgo));
      }

      // Thanh toán thù lao
      members.forEach((m) => {
        const key = `${P.key}:${m.job.key}`;
        const plan = PAYMENT_PLAN[key];
        if (!plan) return;
        const [pst, daysAgo, factor = 1] = plan;
        const amount = Math.round((Number(m.job.budget) * factor) / 1000) * 1000;
        const payId = id('pay', m.wmId);
        const createdAt = ago(pst === 'PAID' ? daysAgo + 1.5 : daysAgo);
        let tx = null;
        if (pst === 'PAID') { do { tx = `FT26${String(int(0, 999999999999)).padStart(12, '0')}`; } while (paidTx.has(tx)); paidTx.add(tx); }
        if (NO_BANK.has(key)) noBankProfiles.add(m.cand.profileId); else if (['PAID', 'PROCESSING'].includes(pst)) bankProfiles.add(m.cand.profileId);
        payRows.push({ id: payId, workspace_member_id: m.wmId, amount, payment_method: 'VIETQR', transaction_code: tx, status: pst, paid_at: pst === 'PAID' ? ago(daysAgo) : null, created_at: createdAt });
        const money = `${amount.toLocaleString('vi-VN')}đ`;
        if (admin) {
          addLog(admin.id, admin.full_name, 'ADMIN', 'PAYMENT_CREATED', 'payment', payId, `Thanh toán ${money} cho ${m.cand.full}`, `Tạo yêu cầu thanh toán ${amount.toLocaleString('vi-VN')} VND cho ${m.cand.full} (${P.name})`, { workspace_member_id: m.wmId, workspace_id: wsId }, createdAt);
          if (pst !== 'PENDING') addLog(admin.id, admin.full_name, 'ADMIN', 'PAYMENT_PROCESSED', 'payment', payId, `Thanh toán ${money} cho ${m.cand.full}`, `Cập nhật trạng thái thanh toán của ${m.cand.full} thành ${pst}${tx ? ` (Mã GD: ${tx})` : ''}`, { workspace_member_id: m.wmId }, ago(daysAgo), null, pst);
        }
        const N = {
          PENDING: ['Có khoản thanh toán mới cho bạn', `Admin vừa tạo khoản thanh toán ${money} cho bạn tại dự án "${P.name}". Hãy kiểm tra thông tin nhận tiền trong hồ sơ.`],
          PROCESSING: ['Khoản thanh toán đang được xử lý', `Khoản thanh toán ${money} của bạn (${P.name}) đang được xử lý.`],
          PAID: ['Bạn đã được thanh toán thù lao', `Khoản thanh toán ${money} của bạn (${P.name}) đã được chuyển khoản thành công. Mã giao dịch: ${tx}.`],
          FAILED: ['Thanh toán không thành công', `Khoản thanh toán ${money} của bạn (${P.name}) chưa thanh toán được, vui lòng kiểm tra lại thông tin tài khoản ngân hàng trong hồ sơ.`],
        }[pst];
        if (daysAgo <= 30) addNotif(m.cand.userId, 'PAYMENT_UPDATE', N[0], N[1], '/candidate/profile?tab=payment', ago(daysAgo), pst === 'PAID' && daysAgo > 7, { payment_id: payId, status: pst });
      });
    }
  }
  // Điểm năng lực = trung bình các đánh giá; kỹ năng từ dự án đã hoàn thành → nguồn PROJECT
  const profileById = new Map(profileRows.map((p) => [p.id, p]));
  for (const [pidv, scores] of evalsByProfile) profileById.get(pidv).competency_score = Math.round((scores.reduce((s, x) => s + Number(x), 0) / scores.length) * 100) / 100;
  for (const [pidv, set] of projectSkillsByProfile) {
    const have = new Set(candSkillRows.filter((r) => r.candidate_profile_id === pidv).map((r) => r.skill_id));
    for (const s of set) if (!have.has(sk(s))) candSkillRows.push({ candidate_profile_id: pidv, skill_id: sk(s), source: 'PROJECT' });
  }

  // ── Thông báo/nhật ký cho Admin khi có doanh nghiệp chờ duyệt ──
  for (const c of COMPANIES) {
    if (c.verification === 'PENDING' && admin) addNotif(admin.id, 'COMPANY_PENDING', 'Doanh nghiệp mới chờ xác thực', `${c.name} vừa tạo hồ sơ doanh nghiệp.`, '/admin/companies', ago(c.daysAgo), false, { company_id: companies[c.key].id });
  }

  // ── Tài khoản ứng viên phải được tạo trước lần hoạt động đầu tiên (nộp hồ sơ / vào dự án) ──
  const firstSeen = new Map();
  const touch = (pid, d) => { const cur = firstSeen.get(pid); if (!cur || d < cur) firstSeen.set(pid, d); };
  appRows.forEach((a) => touch(a.candidate_profile_id, a.applied_at));
  papRows.forEach((a) => touch(a.candidate_profile_id, a.applied_at));
  wmRows.forEach((m) => touch(m.candidate_profile_id, m.joined_at));
  const userById = new Map(users.map((u) => [u.id, u]));
  for (const c of candidates) {
    const f = firstSeen.get(c.profileId);
    if (!f || c.created <= new Date(f.getTime() - MS_DAY)) continue;
    const created = new Date(f.getTime() - (1 + R() * 9) * MS_DAY);
    const u = userById.get(c.userId); u.created_at = created; u.updated_at = created;
    const pr = profileById.get(c.profileId); pr.created_at = new Date(created.getTime() + 3600000); pr.updated_at = created;
    const lg = logs.find((l) => l.user_id === c.userId && l.action === 'USER_REGISTER'); if (lg) lg.created_at = created;
    expRows.filter((e) => e.candidate_profile_id === c.profileId).forEach((e) => { e.created_at = created; e.updated_at = created; });
  }

  // ── Thông tin nhận tiền: bắt buộc với khoản đã trả/đang xử lý; thêm vài ứng viên khác cho tự nhiên ──
  shuffle(activeCands).filter((c) => !bankProfiles.has(c.profileId) && !noBankProfiles.has(c.profileId)).slice(0, 8).forEach((c) => bankProfiles.add(c.profileId));
  const bankRows = [...bankProfiles].map((pid) => {
    const c = candidates.find((x) => x.profileId === pid);
    const when = new Date(c.created.getTime() + 5 * MS_DAY);
    return {
      id: id('bank', pid), candidate_profile_id: pid, account_holder_name: stripVi(c.full).toUpperCase(),
      bank_name: pick(BANKS), account_number: String(int(10 ** 9, 10 ** 12 - 1)).slice(0, int(10, 12)), status: 'ACTIVE', created_at: when, updated_at: when,
    };
  });

  // ── Ghi vào cơ sở dữ liệu (đúng thứ tự khóa ngoại) ──
  await insert(t, 'users', users);
  await insert(t, 'user_roles', userRoles);
  await insert(t, 'companies', companyRows);
  await insert(t, 'candidate_profiles', profileRows);
  await insert(t, 'candidate_cvs', cvRows);
  await insert(t, 'payment_information', bankRows);
  await insert(t, 'candidate_skills', candSkillRows);
  const parents = expRows.filter((e) => !e.parent_id); const children = expRows.filter((e) => e.parent_id);
  await insert(t, 'experiences', parents, { json: ['tasks', 'technologies'] });
  await insert(t, 'experiences', children, { json: ['tasks', 'technologies'] });
  await insert(t, 'job_posts', jobRows);
  await insert(t, 'job_post_skills', jobSkillRows);
  await insert(t, 'applications', appRows);
  await insert(t, 'application_status_history', histRows);
  await insert(t, 'projects', projRows);
  await insert(t, 'workspaces', wsRows);
  await insert(t, 'project_jobs', pjRows);
  await insert(t, 'project_job_skills', pjSkillRows);
  await insert(t, 'project_applications', papRows);
  await insert(t, 'workspace_members', wmRows);
  await insert(t, 'tasks', taskRows, { arrays: ['labels'] });
  await insert(t, 'task_assignees', assigneeRows);
  await insert(t, 'sub_tasks', subRows);
  await insert(t, 'task_comments', commentRows);
  await insert(t, 'task_activities', actRows);
  await insert(t, 'task_submissions', submissionRows);
  await insert(t, 'candidate_evaluations', evalRows);
  await insert(t, 'payments', payRows);
  await insert(t, 'notifications', notifs, { json: ['metadata'] });
  await insert(t, 'activity_logs', logs, { json: ['metadata'] });

  const summary = {
    'Doanh nghiệp': companyRows.length, 'Ứng viên': candidates.length, 'Kỹ năng mới': newSkillRows.length,
    'Tin tuyển dụng': jobRows.length, 'Hồ sơ ứng tuyển': appRows.length, 'Dự án nội bộ': projRows.length, 'Vị trí dự án': pjRows.length,
    'Đơn ứng tuyển dự án': papRows.length, 'Thành viên workspace': wmRows.length, 'Task': taskRows.length, 'Đánh giá năng lực': evalRows.length, 'Thanh toán': payRows.length, 'Thông tin nhận tiền': bankRows.length, 'CV đính kèm': cvRows.length,
    'Thông báo': notifs.length, 'Nhật ký hoạt động': logs.length,
  };
  return summary;
}

(async () => {
  const args = process.argv.slice(2);
  const t = await sequelize.transaction();
  try {
    const removed = await resetDemo(t);
    console.log(`Đã gỡ ${removed} dòng dữ liệu mẫu cũ.`);
    if (args.includes('--reset')) { await t.commit(); console.log('Xong (chỉ gỡ dữ liệu mẫu).'); process.exit(0); }
    const summary = await seed(t);
    let notes = [];
    if (!args.includes('--no-normalize')) notes = await normalizeExisting(t);
    await t.commit();
    console.log('\n✅ Đã nạp dữ liệu mẫu:');
    Object.entries(summary).forEach(([k, v]) => console.log(`   ${k.padEnd(24)} ${v}`));
    if (notes.length) { console.log('\nĐã chuẩn hóa dữ liệu có sẵn:'); notes.forEach((x) => console.log('   - ' + x)); }
    console.log(`\nTài khoản mẫu: email dạng *${DEMO_DOMAIN}, mật khẩu ${DEMO_PASSWORD} (vd: hr.saoviet${DEMO_DOMAIN} là nhà tuyển dụng).`);
    process.exit(0);
  } catch (e) {
    await t.rollback();
    console.error('❌ Lỗi, đã hoàn tác toàn bộ (không có dữ liệu nào được ghi):', e.message);
    if (process.env.DEBUG) console.error(e.stack);
    process.exit(1);
  }
})();
