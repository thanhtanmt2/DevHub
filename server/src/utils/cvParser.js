const fs = require('fs');
const path = require('path');
const AppError = require('./AppError');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

// Đọc file CV (chỉ PDF) trong thư mục uploads. Ném AppError với thông báo thân thiện nếu không đọc được.
function readCvPdf(fileUrl) {
  const clean = String(fileUrl || '').split('?')[0];
  if (path.extname(clean).toLowerCase() !== '.pdf') {
    throw new AppError('Chỉ đọc được CV dạng PDF. Hãy tải lên bản PDF của CV này rồi thử lại.', 400);
  }
  const filePath = path.join(UPLOAD_ROOT, clean.replace(/^\/?uploads\//, ''));
  if (!filePath.startsWith(UPLOAD_ROOT) || !fs.existsSync(filePath)) {
    throw new AppError('Không tìm thấy file CV trên máy chủ. Hãy tải lại CV.', 404);
  }
  return fs.readFileSync(filePath);
}

const PERSONAL_INFO_PROPERTIES = {
  professional_title: { type: 'STRING', nullable: true },
  phone: { type: 'STRING', nullable: true },
  address: { type: 'STRING', nullable: true },
  github_url: { type: 'STRING', nullable: true },
  portfolio_url: { type: 'STRING', nullable: true },
  introduction: { type: 'STRING', nullable: true },
};

const EXPERIENCE_ITEM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    type: { type: 'STRING', enum: ['COMPANY', 'PROJECT', 'FREELANCE', 'PERSONAL'] },
    name: { type: 'STRING' },
    role: { type: 'STRING' },
    parent_company: { type: 'STRING', nullable: true },
    start_date: { type: 'STRING', nullable: true },
    end_date: { type: 'STRING', nullable: true },
    description: { type: 'STRING', nullable: true },
    tasks: { type: 'ARRAY', items: { type: 'STRING' } },
    technologies: { type: 'ARRAY', items: { type: 'STRING' } },
    link_url: { type: 'STRING', nullable: true },
  },
  required: ['type', 'name', 'role', 'tasks', 'technologies'],
};

const PERSONAL_INFO_SCHEMA = {
  type: 'OBJECT',
  properties: {
    personal_info: {
      type: 'OBJECT',
      properties: PERSONAL_INFO_PROPERTIES,
    },
  },
  required: ['personal_info'],
};

const EXPERIENCE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    experiences: {
      type: 'ARRAY',
      items: EXPERIENCE_ITEM_SCHEMA,
    },
  },
  required: ['experiences'],
};

const SKILLS_SCHEMA = {
  type: 'OBJECT',
  properties: { skills: { type: 'ARRAY', items: { type: 'STRING' } } },
  required: ['skills'],
};

async function callGemini(buffer, prompt, schema) {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('Chức năng đọc CV chưa được cấu hình (thiếu GEMINI_API_KEY trên máy chủ).', 503);
  }
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'application/pdf', data: buffer.toString('base64') } }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0 },
      }),
    });
  } catch (err) {
    throw new AppError('Không kết nối được dịch vụ AI hoặc quá thời gian chờ. Vui lòng thử lại.', 503);
  }
  if (!res.ok) {
    console.error('Gemini error', res.status, (await res.text()).slice(0, 300));
    throw new AppError(res.status === 429 ? 'Dịch vụ AI đang quá tải, vui lòng thử lại sau ít phút.' : 'Dịch vụ AI gặp lỗi, vui lòng thử lại sau.', 503);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  try { return JSON.parse(text); } catch { throw new AppError('Không đọc được nội dung CV. CV có thể là bản scan (ảnh) hoặc bị lỗi.', 422); }
}

// Chuẩn hóa ngày AI trả về (YYYY, YYYY-MM, YYYY-MM-DD) thành YYYY-MM-DD; không hợp lệ / "hiện tại" thì null.
function normalizeDate(v) {
  // Chỉ lấy phần ngày ở đầu chuỗi (model đôi khi trả kèm chữ thừa phía sau)
  const m = String(v ?? '').trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?(?!\d)/);
  if (!m) return null;
  const y = Number(m[1]); const mo = Number(m[2] || 1); const d = Number(m[3] || 1);
  if (y < 1970 || y > new Date().getFullYear() + 1 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Chuẩn hóa tên để so khớp / phát hiện trùng (bỏ dấu, hoa thường, ký tự đặc biệt)
function normName(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Chuẩn hóa số điện thoại Việt Nam từ CV
function normalizePhone(raw) {
  if (!raw) return '';
  let digits = String(raw).trim().replace(/[\s.\-()]/g, '');
  if (digits.startsWith('+84')) digits = '0' + digits.slice(3);
  else if (digits.startsWith('84') && digits.length === 11) digits = '0' + digits.slice(2);
  return digits.slice(0, 20);
}

// Chuẩn hóa URL từ CV (thêm https:// nếu thiếu)
function normalizeUrl(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s.slice(0, 500);
}

const INFO_PROMPT_PART =
  'THÔNG TIN CÁ NHÂN (personal_info):\n' +
  '- professional_title: Chức danh chuyên môn / vị trí ứng tuyển ghi trên CV (VD: "Frontend Developer", "Backend Intern").\n' +
  '- phone: Số điện thoại liên hệ trong CV.\n' +
  '- address: Địa chỉ nơi ở của ứng viên trong CV.\n' +
  '- github_url: Đường dẫn GitHub của ứng viên (nếu có).\n' +
  '- portfolio_url: Đường dẫn Website cá nhân / Portfolio / LinkedIn (không trùng với link GitHub).\n' +
  '- introduction: Đoạn giới thiệu bản thân / mục tiêu nghề nghiệp (Summary / Objective / About me) trong CV.\n' +
  '- Trường nào không có trong CV thì để null, tuyệt đối không tự bịa.';

const EXPERIENCE_PROMPT_PART =
  'KINH NGHIỆM VÀ DỰ ÁN (experiences):\n' +
  '- type=COMPANY: làm việc/thực tập tại một công ty hoặc tổ chức (name = tên công ty, role = chức danh).\n' +
  '- type=PROJECT: dự án làm trong khuôn khổ một công ty ở trên (name = tên dự án, role = vai trò, parent_company = đúng tên công ty đã liệt kê).\n' +
  '- type=FREELANCE: việc làm tự do cho khách hàng. type=PERSONAL: dự án cá nhân / đồ án / mã nguồn mở không thuộc công ty nào.\n' +
  '- Ngày dạng YYYY-MM (hoặc YYYY-MM-DD); nếu đang làm hoặc "hiện tại" thì end_date = null; không có thông tin thì null. Không bịa ngày.\n' +
  '- tasks: các việc cụ thể đã làm (mỗi việc một câu ngắn). technologies: công nghệ/công cụ dùng. Chỉ ghi thông tin có trong CV, không suy diễn.\n' +
  '- Nếu CV không có kinh nghiệm hay dự án nào thì trả về mảng rỗng. Giữ nguyên ngôn ngữ gốc của CV.';

async function extractPersonalInfo(buffer) {
  const prompt = 'Đây là CV của một ứng viên. Hãy trích xuất THÔNG TIN CÁ NHÂN theo quy tắc sau:\n' + INFO_PROMPT_PART;
  const out = await callGemini(buffer, prompt, PERSONAL_INFO_SCHEMA);
  return out.personal_info || {};
}

async function extractSkillNames(buffer, skillNames) {
  const prompt =
    'Đây là CV của một ứng viên. Từ DANH SÁCH KỸ NĂNG bên dưới, chọn ra những kỹ năng ứng viên thực sự có trong CV ' +
    '(nhắc đến trong phần kỹ năng, kinh nghiệm hoặc dự án). Chỉ trả về tên đúng như trong danh sách, không thêm tên mới.\n\nDANH SÁCH KỸ NĂNG:\n' + skillNames.join(', ');
  const out = await callGemini(buffer, prompt, SKILLS_SCHEMA);
  return Array.isArray(out.skills) ? out.skills.filter((x) => typeof x === 'string') : [];
}

async function extractExperiences(buffer) {
  const prompt = 'Đây là CV của một ứng viên. Hãy trích xuất toàn bộ KINH NGHIỆM và DỰ ÁN trong CV. Quy tắc:\n' + EXPERIENCE_PROMPT_PART;
  const out = await callGemini(buffer, prompt, EXPERIENCE_SCHEMA);
  return Array.isArray(out.experiences) ? out.experiences : [];
}

// Đọc nhiều mục (info / skills / experience) trong 1 lần gọi Gemini duy nhất để nhanh và tiết kiệm quota
async function extractCvSections(buffer, modes, skillNames = []) {
  const wantInfo = modes.includes('info');
  const wantSkills = modes.includes('skills') && skillNames.length > 0;
  const wantExp = modes.includes('experience');

  const properties = {};
  const required = [];
  const promptParts = ['Đây là CV của một ứng viên. Hãy trích xuất chính xác các phần được yêu cầu dưới đây:'];

  if (wantInfo) {
    properties.personal_info = { type: 'OBJECT', properties: PERSONAL_INFO_PROPERTIES };
    required.push('personal_info');
    promptParts.push(INFO_PROMPT_PART);
  }
  if (wantSkills) {
    properties.skills = { type: 'ARRAY', items: { type: 'STRING' } };
    required.push('skills');
    promptParts.push(
      'KỸ NĂNG (skills):\n' +
      '- Từ DANH SÁCH KỸ NĂNG bên dưới, chọn ra những kỹ năng ứng viên thực sự có trong CV (nhắc đến trong phần kỹ năng, kinh nghiệm hoặc dự án).\n' +
      '- Chỉ trả về tên đúng như trong danh sách, không thêm tên mới.\nDANH SÁCH KỸ NĂNG:\n' + skillNames.join(', ')
    );
  }
  if (wantExp) {
    properties.experiences = { type: 'ARRAY', items: EXPERIENCE_ITEM_SCHEMA };
    required.push('experiences');
    promptParts.push(EXPERIENCE_PROMPT_PART);
  }

  if (!required.length) return { personal_info: {}, skills: [], experiences: [] };

  const schema = { type: 'OBJECT', properties, required };
  const out = await callGemini(buffer, promptParts.join('\n\n'), schema);
  return {
    personal_info: out.personal_info || {},
    skills: Array.isArray(out.skills) ? out.skills.filter((x) => typeof x === 'string') : [],
    experiences: Array.isArray(out.experiences) ? out.experiences : [],
  };
}

module.exports = {
  readCvPdf,
  extractPersonalInfo,
  extractSkillNames,
  extractExperiences,
  extractCvSections,
  normalizeDate,
  normalizePhone,
  normalizeUrl,
  normName,
};
