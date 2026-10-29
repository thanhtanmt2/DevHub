const { Op } = require('sequelize');
const { CandidateProfile, CandidateCv, Skill, CandidateSkill, Experience } = require('../models');
const AppError = require('../utils/AppError');
const { readCvPdf, extractSkillNames, extractExperiences, normalizeDate, normName } = require('../utils/cvParser');
const { buildExperienceData } = require('./candidateController');

const MAX_IMPORT_ITEMS = 30;
const VALID_TYPES = ['COMPANY', 'PROJECT', 'FREELANCE', 'PERSONAL'];

async function getProfile(userId) {
  const profile = await CandidateProfile.findOne({ where: { user_id: userId } });
  if (!profile) throw new AppError('Chưa có hồ sơ ứng viên', 404);
  return profile;
}

// Mục kinh nghiệm trùng = cùng loại và tên giống nhau (hoặc chứa nhau với tên đủ dài)
function findDuplicate(existing, type, name) {
  const n = normName(name);
  if (!n) return null;
  return existing.find((e) => (e.type || 'COMPANY') === type && (() => {
    const en = normName(e.company_name);
    return en === n || (Math.min(en.length, n.length) >= 4 && (en.includes(n) || n.includes(en)));
  })()) || null;
}

// POST /api/candidates/cvs/:id/parse  { mode: 'skills' | 'experience' }
// Đọc một CV đã tải lên bằng AI và TRẢ VỀ BẢN XEM TRƯỚC, chưa lưu gì vào hồ sơ.
exports.parseCv = async (req, res, next) => {
  try {
    const mode = req.body.mode;
    if (!['skills', 'experience'].includes(mode)) throw new AppError('Chế độ nhập không hợp lệ', 400);
    const profile = await getProfile(req.user.id);
    const cv = await CandidateCv.findOne({ where: { id: req.params.id, candidate_profile_id: profile.id } });
    if (!cv) throw new AppError('CV không tồn tại', 404);
    const buffer = readCvPdf(cv.file_url);

    if (mode === 'skills') {
      const allSkills = await Skill.findAll({ attributes: ['id', 'name'] });
      if (!allSkills.length) return res.json({ success: true, data: { skills: [] } });
      const names = await extractSkillNames(buffer, allSkills.map((s) => s.name));
      const byName = new Map(allSkills.map((s) => [normName(s.name), s]));
      const matched = [...new Set(names.map((n) => byName.get(normName(n))).filter(Boolean))];
      const have = new Set((await CandidateSkill.findAll({ where: { candidate_profile_id: profile.id }, attributes: ['skill_id'] })).map((c) => c.skill_id));
      return res.json({
        success: true,
        data: { skills: matched.map((s) => ({ skill_id: s.id, name: s.name, already: have.has(s.id) })) },
      });
    }

    // mode === 'experience'
    const raw = (await extractExperiences(buffer)).slice(0, MAX_IMPORT_ITEMS);
    const existing = await Experience.findAll({ where: { candidate_profile_id: profile.id } });
    const existingCompanies = existing.filter((e) => (e.type || 'COMPANY') === 'COMPANY');

    const items = raw.map((r, i) => ({
      key: `cv-${i}`,
      type: VALID_TYPES.includes(r.type) ? r.type : 'COMPANY',
      company_name: String(r.name || '').trim().slice(0, 200),
      job_title: String(r.role || '').trim().slice(0, 150),
      start_date: normalizeDate(r.start_date),
      end_date: normalizeDate(r.end_date),
      description: r.description ? String(r.description).trim() : '',
      tasks: Array.isArray(r.tasks) ? r.tasks.map((t) => String(t).trim()).filter(Boolean).slice(0, 20) : [],
      technologies: Array.isArray(r.technologies) ? [...new Set(r.technologies.map((t) => String(t).trim()).filter(Boolean))].slice(0, 20) : [],
      link_url: /^https?:\/\//i.test(r.link_url || '') ? String(r.link_url).trim().slice(0, 500) : '',
      _parent: r.parent_company,
    })).filter((it) => it.company_name);

    // Gắn dự án vào công ty: ưu tiên công ty trong chính CV, sau đó công ty đã có trong hồ sơ
    const companyItems = items.filter((it) => it.type === 'COMPANY');
    for (const it of items) {
      if (it.type === 'PROJECT') {
        const pn = normName(it._parent);
        const inCv = pn && companyItems.find((c) => normName(c.company_name) === pn);
        const inDb = !inCv && pn && existingCompanies.find((c) => normName(c.company_name) === pn);
        it.parent_ref = inCv ? `k:${inCv.key}` : inDb ? `e:${inDb.id}` : null;
        // Không xác định được công ty cha thì xem như dự án cá nhân (ứng viên vẫn đổi lại được)
        if (!it.parent_ref) it.type = 'PERSONAL';
      } else {
        it.parent_ref = null;
      }
      delete it._parent;
      const dup = findDuplicate(existing, it.type, it.company_name);
      it.duplicate = dup ? { id: dup.id, company_name: dup.company_name, job_title: dup.job_title, start_date: dup.start_date, end_date: dup.end_date } : null;
    }
    return res.json({
      success: true,
      data: {
        experiences: items,
        existing_companies: existingCompanies.map((c) => ({ id: c.id, company_name: c.company_name })),
      },
    });
  } catch (error) { next(error); }
};

// POST /api/candidates/cvs/import  { skill_ids: [], experiences: [{ ..., action: 'create' | 'overwrite', overwrite_id }] }
// Lưu những gì ứng viên đã chọn trong bản xem trước.
exports.importFromCv = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    const skillIds = Array.isArray(req.body.skill_ids) ? [...new Set(req.body.skill_ids)] : [];
    const items = Array.isArray(req.body.experiences) ? req.body.experiences : [];
    if (items.length > MAX_IMPORT_ITEMS) throw new AppError(`Chỉ nhập tối đa ${MAX_IMPORT_ITEMS} mục mỗi lần`, 400);

    const result = { skills_added: 0, experiences_created: 0, experiences_updated: 0, errors: [] };

    if (skillIds.length) {
      const valid = await Skill.findAll({ where: { id: { [Op.in]: skillIds.filter((x) => /^[0-9a-f-]{36}$/i.test(x)) } }, attributes: ['id'] });
      const have = new Set((await CandidateSkill.findAll({ where: { candidate_profile_id: profile.id }, attributes: ['skill_id'] })).map((c) => c.skill_id));
      for (const s of valid) {
        if (have.has(s.id)) continue;
        await CandidateSkill.create({ candidate_profile_id: profile.id, skill_id: s.id, source: 'CV' });
        result.skills_added += 1;
      }
    }

    // Công ty trước, dự án sau để dự án luôn tìm được công ty cha
    const keyToId = new Map();
    const ordered = [...items].sort((a, b) => (a.type === 'COMPANY' ? 0 : 1) - (b.type === 'COMPANY' ? 0 : 1));
    for (const it of ordered) {
      const label = it.company_name || 'Mục không tên';
      try {
        let parent_id = null;
        if (it.type === 'PROJECT') {
          const ref = String(it.parent_ref || '');
          parent_id = ref.startsWith('e:') ? ref.slice(2) : keyToId.get(ref.slice(2)) || null;
          if (!parent_id) throw new AppError('Công ty của dự án này chưa được nhập hoặc đã bị bỏ qua', 400);
        }
        const input = { ...it, parent_id, tasks: it.tasks, technologies: it.technologies };
        if (it.action === 'overwrite' && it.overwrite_id) {
          const target = await Experience.findOne({ where: { id: it.overwrite_id, candidate_profile_id: profile.id } });
          if (!target) throw new AppError('Mục cần ghi đè không còn tồn tại', 404);
          const data = await buildExperienceData({ ...target.toJSON(), ...input }, profile, target.id);
          await target.update(data);
          if (it.key) keyToId.set(it.key, target.id);
          result.experiences_updated += 1;
        } else {
          const data = await buildExperienceData(input, profile);
          const created = await Experience.create({ candidate_profile_id: profile.id, ...data });
          if (it.key) keyToId.set(it.key, created.id);
          result.experiences_created += 1;
        }
      } catch (err) {
        result.errors.push({ key: it.key, name: label, message: err.message });
      }
    }
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
