const { sequelize, CandidateProfile, Experience } = require('../models');
const { getEvidenceForProfiles } = require('./skillEvidence');

// ─────────────────────────────────────────────────────────────────────────────
// Độ phù hợp giữa HỒ SƠ ứng viên và một tin tuyển dụng (0–100), chỉ gồm 2 tiêu chí:
//   1) Vị trí đã làm (60đ): các vị trí trong kinh nghiệm / chức danh / dự án DevHub có gần với tên tin không,
//      và đã làm vị trí đó bao lâu (làm ≥ 3 năm ở vị trí tương ứng thì đạt điểm tối đa).
//   2) Kỹ năng (40đ): tỉ lệ kỹ năng tin yêu cầu mà ứng viên có (khai báo, hoặc đã dùng trong kinh nghiệm / dự án).
// Không trùng vị trí lẫn kỹ năng nào thì 0 điểm.
// ─────────────────────────────────────────────────────────────────────────────

const POSITION_POINTS = 60;
const SKILL_POINTS = 40;
const FULL_POSITION_YEARS = 3; // số năm làm vị trí tương ứng để đạt điểm tối đa cho phần "thời gian"

// Nhóm hướng nghề: gom các kỹ năng liên quan (khớp theo tên kỹ năng trong danh mục). Dùng cho bộ lọc lĩnh vực ở trang chủ.
const CATEGORIES = [
  { key: 'frontend', label: 'Frontend', skills: ['React', 'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS', 'Redux', 'HTML/CSS'] },
  { key: 'backend', label: 'Backend', skills: ['Node.js', 'Express.js', 'NestJS', 'Java', 'Spring Boot', 'PHP', 'Laravel', 'Python', 'Django', 'Ruby on Rails', 'C#', '.NET Core', 'Microservices'] },
  { key: 'mobile', label: 'Mobile', skills: ['Flutter', 'React Native', 'Kotlin', 'Swift'] },
  { key: 'qa', label: 'QA / Tester', skills: ['Manual Testing', 'Selenium', 'Cypress', 'Postman', 'Jira'] },
  { key: 'data', label: 'Data & AI', skills: ['Machine Learning', 'TensorFlow', 'Pandas', 'Power BI'] },
  { key: 'devops', label: 'DevOps & Cloud', skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Azure', 'GCP', 'Linux'] },
  { key: 'design', label: 'UI/UX', skills: ['Figma', 'UI/UX Design'] },
];

const strip = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/front[\s-]?end/g, 'frontend').replace(/back[\s-]?end/g, 'backend').replace(/full[\s-]?stack/g, 'fullstack');
const GENERIC = new Set(['developer', 'engineer', 'senior', 'junior', 'fresher', 'intern', 'internship', 'part', 'time', 'full', 'remote',
  'lead', 'team', 'manager', 'specialist', 'staff', 'web', 'software', 'and', 'the', 'for', 'of', 'in', 'at', 'with', 'cong', 'tuyen', 'sinh', 'thuc', 'tap']);
const tokens = (s) => strip(s).split(/[^a-z0-9+#.]+/).map((t) => t.replace(/^\.+|\.+$/g, '')).filter((t) => t.length > 1 && !GENERIC.has(t));

// Từ trong tên vị trí → hướng nghề
const TITLE_FAMILY = {
  frontend: ['frontend'], backend: ['backend'], fullstack: ['frontend', 'backend'], mobile: ['mobile'], android: ['mobile'], ios: ['mobile'],
  qa: ['qa'], tester: ['qa'], testing: ['qa'], data: ['data'], ai: ['data'], ml: ['data'], analyst: ['data'],
  devops: ['devops'], cloud: ['devops'], sre: ['devops'], ui: ['design'], ux: ['design'], designer: ['design'],
};
const CAT_BY_SKILL = new Map(CATEGORIES.flatMap((c) => c.skills.map((s) => [strip(s), c.key])));
// Hướng nghề của một chức danh (từ khóa hướng nghề hoặc tên công nghệ trong chức danh, vd. "React Developer" → frontend)
const familiesOf = (toks) => new Set(toks.flatMap((t) => TITLE_FAMILY[t] || (CAT_BY_SKILL.has(t) ? [CAT_BY_SKILL.get(t)] : [])));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phraseCache = new Map();
const hasPhrase = (text, phrase) => {
  if (!phrase) return false;
  if (!phraseCache.has(phrase)) phraseCache.set(phrase, new RegExp(`(^|[^a-z0-9+#.])${escapeRe(phrase)}($|[^a-z0-9+#.])`));
  return phraseCache.get(phrase).test(text);
};

const YEAR_MS = 365.25 * 86400000;
const yearsBetween = (start, end) => {
  if (!start) return 0.5; // chưa ghi thời gian: coi như làm khoảng 6 tháng
  const a = new Date(start).getTime();
  const b = end ? new Date(end).getTime() : Date.now();
  return Number.isFinite(a) && Number.isFinite(b) && b > a ? (b - a) / YEAR_MS : 0.5;
};
const fmtDuration = (years) => (years >= 1 ? `~${Math.round(years * 10) / 10} năm` : `~${Math.max(1, Math.round(years * 12))} tháng`);

// Tín hiệu từ hồ sơ ứng viên đang đăng nhập; null nếu là khách / không phải ứng viên / hồ sơ còn trống
async function getCandidateSignals(req) {
  if (!req.user || !req.userRoles?.includes('CANDIDATE')) return null;
  const profile = await CandidateProfile.findOne({
    where: { user_id: req.user.id }, attributes: ['id', 'professional_title', 'address'],
  });
  if (!profile) return null;
  const [skillRows, exps, evidenceAll] = await Promise.all([
    sequelize.query('SELECT s.id, s.name FROM candidate_skills cs JOIN skills s ON s.id = cs.skill_id WHERE cs.candidate_profile_id = :id',
      { replacements: { id: profile.id }, type: 'SELECT' }),
    Experience.findAll({ where: { candidate_profile_id: profile.id }, raw: true }),
    getEvidenceForProfiles([profile.id]),
  ]);
  if (!skillRows.length && !exps.length) return null;

  const evidence = evidenceAll.get(profile.id) || new Map(); // skillId → [{ project_name, position }]

  // Các vị trí đã làm (kèm thời gian). "Dự án trong công ty" (PROJECT) thuộc một công ty đã tính nên bỏ qua để không tính trùng
  const positions = exps.filter((e) => e.type !== 'PROJECT').map((e) => ({
    title: e.job_title, company: e.company_name,
    years: yearsBetween(e.start_date, e.end_date) * (e.type === 'PERSONAL' ? 0.5 : 1), // dự án cá nhân tính nửa
    toks: tokens(e.job_title),
    techs: (e.technologies || []).map(strip), // công nghệ đã dùng ở vị trí này → suy ra hướng nghề khi chức danh chung chung (vd. "Web Developer")
  }));
  if (profile.professional_title) positions.push({ title: profile.professional_title, company: null, years: 0, toks: tokens(profile.professional_title) });
  const seen = new Set();
  for (const ev of [...evidence.values()].flat()) { // vị trí đã làm trong dự án DevHub đã hoàn thành
    if (ev.position && !seen.has(ev.position)) {
      seen.add(ev.position);
      positions.push({ title: ev.position, company: `dự án ${ev.project_name}`, years: 0.5, toks: tokens(ev.position) });
    }
  }
  for (const p of positions) p.fams = familiesOf([...p.toks, ...(p.techs || [])]);

  return {
    address: profile.address || '',
    declaredIds: new Set(skillRows.map((s) => s.id)),
    declaredNorm: new Set(skillRows.map((s) => strip(s.name))),
    evidence,
    techNorm: new Set(exps.flatMap((e) => (e.technologies || []).map(strip))),
    expTextNorm: strip(exps.map((e) => [e.job_title, e.description, ...(e.tasks || []), ...(e.technologies || [])].join(' ')).join(' \n ')),
    positions,
  };
}

// Mức liên quan (0..1) giữa một vị trí đã làm và tên tin: trùng từ khóa chức danh hoặc cùng hướng nghề
function relevance(position, jobToks, jobFams) {
  const overlap = jobToks.length ? jobToks.filter((t) => position.toks.includes(t)).length / jobToks.length : 0;
  const sameFamily = [...jobFams].some((f) => position.fams.has(f));
  return Math.max(overlap, sameFamily ? 1 : 0);
}

// Chấm một tin. job = { id, title, skills: [{ id, name }] }
function scoreJob(job, sig) {
  // 1) Vị trí đã làm + thời gian làm
  const jt = tokens(job.title);
  const jf = familiesOf(jt);
  let best = null; let bestRel = 0; let relYears = 0;
  for (const p of sig.positions) {
    const r = relevance(p, jt, jf);
    if (r >= 0.5) {
      relYears += r * p.years;
      if (!best || r > bestRel || (r === bestRel && p.years > best.years)) { best = p; bestRel = r; }
    }
  }
  const positionFit = best ? 0.5 * bestRel + 0.5 * Math.min(1, relYears / FULL_POSITION_YEARS) : 0;

  // 2) Kỹ năng: khai báo hoặc đã dùng trong kinh nghiệm / dự án
  const skills = job.skills || [];
  const hits = []; const proofs = [];
  for (const s of skills) {
    const sn = strip(s.name);
    const ev = sig.evidence.get(s.id);
    const used = !!(ev?.length) || sig.techNorm.has(sn) || hasPhrase(sig.expTextNorm, sn);
    if (sig.declaredIds.has(s.id) || sig.declaredNorm.has(sn) || used) hits.push(s.name);
    if (ev?.length) proofs.push({ skill: s.name, project: ev[0].project_name });
  }
  const skillFit = skills.length ? hits.length / skills.length : 0;

  const percent = Math.round(POSITION_POINTS * positionFit + SKILL_POINTS * skillFit);

  const reasons = [];
  if (best) {
    const where = best.company ? ` tại ${best.company}` : '';
    reasons.push(relYears >= 0.2 ? `Từng làm "${best.title}"${where}, tổng ${fmtDuration(relYears)} ở vị trí tương tự` : `Chức danh "${best.title}" gần với vị trí này`);
  }
  if (hits.length) reasons.push(`Trùng ${hits.length}/${skills.length} kỹ năng: ${hits.slice(0, 3).join(', ')}${hits.length > 3 ? '...' : ''}`);
  if (proofs.length) reasons.push(`Đã làm dự án "${proofs[0].project}" với ${proofs[0].skill}`);
  return { percent: Math.max(0, Math.min(100, percent)), matched: hits, reasons: reasons.slice(0, 3) };
}

// Kỹ năng đầy đủ của một nhóm tin: Map(jobId → [{ id, name }])
async function loadJobSkills(jobIds) {
  const map = new Map();
  if (!jobIds.length) return map;
  const rows = await sequelize.query(
    'SELECT js.job_post_id, s.id, s.name FROM job_post_skills js JOIN skills s ON s.id = js.skill_id WHERE js.job_post_id IN (:ids)',
    { replacements: { ids: jobIds }, type: 'SELECT' }
  );
  for (const r of rows) {
    if (!map.has(r.job_post_id)) map.set(r.job_post_id, []);
    map.get(r.job_post_id).push({ id: r.id, name: r.name });
  }
  return map;
}

// Chấm nhiều tin → Map(jobId → match). Kỹ năng của tin đọc từ skillsMap
function scoreJobs(jobs, skillsMap, sig) {
  const out = new Map();
  for (const j of jobs) out.set(j.id, scoreJob({ ...j, skills: skillsMap.get(j.id) || [] }, sig));
  return out;
}

module.exports = { CATEGORIES, getCandidateSignals, scoreJob, scoreJobs, loadJobSkills };
