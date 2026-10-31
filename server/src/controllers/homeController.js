const { Op } = require('sequelize');
const { sequelize, JobPost, Skill, Company, CandidateProfile, Application } = require('../models');
const { CATEGORIES, getCandidateSignals, scoreJob } = require('../utils/jobMatch');

const MIN_MATCH_PERCENT = 45;

// Tin tuyển dụng đang mở và còn hạn nộp hồ sơ
const OPEN_JOB = "j.status = 'OPEN' AND (j.deadline IS NULL OR j.deadline >= NOW())";
const openJobWhere = () => ({
  status: 'OPEN',
  [Op.and]: [{ [Op.or]: [{ deadline: null }, { deadline: { [Op.gte]: new Date() } }] }],
});
const skillNamesSql = (names) => names.map((n) => sequelize.escape(n)).join(',');

// GET /api/home/overview — số liệu, lĩnh vực và doanh nghiệp tiêu biểu cho trang chủ (công khai)
exports.getOverview = async (req, res, next) => {
  try {
    const one = async (sql) => Number((await sequelize.query(sql, { type: 'SELECT' }))[0].c);
    const [openJobs, companies, projectJobs, candidates, catCounts, topCompanies, topSkills] = await Promise.all([
      one(`SELECT COUNT(*)::int AS c FROM job_posts j WHERE ${OPEN_JOB}`),
      one("SELECT COUNT(*)::int AS c FROM companies WHERE verification_status = 'VERIFIED'"),
      one("SELECT COUNT(*)::int AS c FROM project_jobs WHERE status = 'OPEN' AND (deadline IS NULL OR deadline >= NOW())"),
      one("SELECT COUNT(*)::int AS c FROM candidate_profiles cp JOIN users u ON u.id = cp.user_id WHERE u.status = 'ACTIVE'"),
      Promise.all(CATEGORIES.map((c) => sequelize.query(
        `SELECT COUNT(DISTINCT j.id)::int AS c FROM job_posts j
           JOIN job_post_skills js ON js.job_post_id = j.id JOIN skills s ON s.id = js.skill_id
          WHERE ${OPEN_JOB} AND s.name IN (${skillNamesSql(c.skills)})`,
        { type: 'SELECT' }
      ))),
      sequelize.query(
        `SELECT c.id, c.name, c.logo_url, c.address, COUNT(j.id)::int AS open_jobs
           FROM companies c JOIN job_posts j ON j.company_id = c.id AND ${OPEN_JOB}
          WHERE c.verification_status = 'VERIFIED'
          GROUP BY c.id ORDER BY open_jobs DESC, c.created_at ASC LIMIT 12`,
        { type: 'SELECT' }
      ),
      // Kỹ năng được yêu cầu nhiều nhất trong các tin đang mở (gợi ý tìm kiếm nhanh)
      sequelize.query(
        `SELECT s.id, s.name, COUNT(DISTINCT j.id)::int AS count
           FROM skills s JOIN job_post_skills js ON js.skill_id = s.id JOIN job_posts j ON j.id = js.job_post_id AND ${OPEN_JOB}
          WHERE s.status = 'ACTIVE' GROUP BY s.id ORDER BY count DESC, s.name ASC LIMIT 8`,
        { type: 'SELECT' }
      ),
    ]);
    res.json({
      success: true,
      data: {
        stats: { open_jobs: openJobs, companies, project_jobs: projectJobs, candidates },
        top_skills: topSkills,
        categories: CATEGORIES.map((c, i) => ({ key: c.key, label: c.label, count: Number(catCounts[i][0].c) })),
        companies: topCompanies.map((c) => ({
          id: c.id, name: c.name, logo_url: c.logo_url, open_jobs: c.open_jobs,
          city: (c.address || '').split(',').pop().trim() || null,
        })),
      },
    });
  } catch (error) { next(error); }
};

// GET /api/home/recommended-jobs?category=&limit= — việc làm đề xuất
//  - Ứng viên đã khai kỹ năng: xếp theo mức độ phù hợp (tỉ lệ kỹ năng của tin mà hồ sơ có), ưu tiên tin mới và cùng khu vực;
//    không đưa lại các tin ứng viên đã ứng tuyển.
//  - Còn lại (khách, nhà tuyển dụng, ứng viên chưa có kỹ năng): việc làm nổi bật theo lượt xem.
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 24);
    const category = CATEGORIES.find((c) => c.key === req.query.category);
    const where = openJobWhere();
    if (category) {
      where[Op.and].push(sequelize.literal(
        `"JobPost"."id" IN (SELECT js.job_post_id FROM job_post_skills js JOIN skills s ON s.id = js.skill_id WHERE s.name IN (${skillNamesSql(category.skills)}))`
      ));
    }
    const include = [
      { model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] },
      { model: Company, attributes: ['id', 'name', 'logo_url', 'address'] },
    ];

    // Tín hiệu từ hồ sơ ứng viên (kỹ năng, kinh nghiệm, dự án đã làm); null nếu là khách / chưa có hồ sơ
    const sig = await getCandidateSignals(req);

    const featuredQuery = (extraWhere = [], n = limit) => JobPost.findAll({
      where: { ...where, [Op.and]: [...where[Op.and], ...extraWhere] },
      include,
      order: [['view_count', 'DESC'], ['posted_at', 'DESC']],
      limit: n,
    });

    if (!sig) {
      const rows = await featuredQuery();
      return res.json({ success: true, data: rows, personalized: false, matched_count: 0 });
    }

    // Loại các tin đã ứng tuyển
    const profileRow = await CandidateProfile.findOne({ where: { user_id: req.user.id }, attributes: ['id'] });
    const applied = (await Application.findAll({ where: { candidate_profile_id: profileRow.id }, attributes: ['job_post_id'], raw: true })).map((a) => a.job_post_id);
    const notApplied = applied.length ? [{ id: { [Op.notIn]: applied } }] : [];
    const pool = await JobPost.findAll({
      where: { ...where, [Op.and]: [...where[Op.and], ...notApplied] },
      include,
      order: [['posted_at', 'DESC']],
      limit: 120,
    });

    const city = (sig.address || '').trim().toLowerCase();
    const scored = pool.map((job) => {
      const json = job.toJSON();
      const m = scoreJob({ ...json, skills: json.Skills || [] }, sig);
      const days = json.posted_at ? (Date.now() - new Date(json.posted_at).getTime()) / 86400000 : 30;
      const recency = Math.max(0, 6 - days / 5); // tin càng mới càng được cộng điểm (tối đa 6)
      const place = `${json.location || ''} ${json.work_address || ''}`.toLowerCase();
      const nearby = city && place && (place.includes(city) || city.includes((json.location || '').toLowerCase())) ? 6
        : /toàn quốc/.test(place) || json.work_type === 'REMOTE' ? 3 : 0;
      return { json, m, score: m.percent + recency + nearby };
    });

    // Chỉ coi là "phù hợp" khi đạt ngưỡng điểm hồ sơ (kỹ năng + kinh nghiệm + dự án + cấp độ), không chỉ vì trùng 1 kỹ năng chung chung
    const hits = scored.filter((s) => s.m.percent >= MIN_MATCH_PERCENT).sort((a, b) => b.score - a.score).slice(0, limit)
      .map((s) => ({ ...s.json, match: s.m }));

    let data = hits;
    if (hits.length < limit) {
      // Chưa đủ tin phù hợp thì bổ sung bằng tin nổi bật khác (không gắn mức phù hợp)
      const exclude = [...applied, ...hits.map((h) => h.id)];
      const fill = await featuredQuery(exclude.length ? [{ id: { [Op.notIn]: exclude } }] : [], limit - hits.length);
      data = [...hits, ...fill.map((j) => j.toJSON())];
    }
    res.json({ success: true, data, personalized: hits.length > 0, matched_count: hits.length });
  } catch (error) { next(error); }
};

exports.CATEGORIES = CATEGORIES;
