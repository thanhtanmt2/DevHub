const path = require('path');
const zlib = require('zlib');
const AppError = require('./AppError');
const { normName, normalizeDate } = require('./cvParser');

const ALLOWED_JD_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp'];

const MIME_BY_EXT = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const WORK_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE'];
const POSITION_LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER'];
const EXPERIENCES = ['NONE', 'UNDER_1', 'Y1_2', 'Y2_5', 'OVER_5'];

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định',
  'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
  'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An',
  'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

const JD_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', nullable: true },
    work_type: { type: 'STRING', enum: WORK_TYPES, nullable: true },
    quantity: { type: 'INTEGER', nullable: true },
    position_level: { type: 'STRING', enum: POSITION_LEVELS, nullable: true },
    experience: { type: 'STRING', enum: EXPERIENCES, nullable: true },
    location: { type: 'STRING', nullable: true },
    work_address: { type: 'STRING', nullable: true },
    working_time: { type: 'STRING', nullable: true },
    salary_min: { type: 'NUMBER', nullable: true },
    salary_max: { type: 'NUMBER', nullable: true },
    deadline: { type: 'STRING', nullable: true },
    description: { type: 'STRING', nullable: true },
    requirements: { type: 'STRING', nullable: true },
    benefits: { type: 'STRING', nullable: true },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: [
    'title',
    'work_type',
    'quantity',
    'position_level',
    'experience',
    'location',
    'work_address',
    'working_time',
    'salary_min',
    'salary_max',
    'deadline',
    'description',
    'requirements',
    'benefits',
    'skills',
  ],
};

// Giải nén văn bản từ file .docx (ZIP chứa word/document.xml) bằng zlib tích hợp sẵn của Node.js
function extractTextFromDocx(buffer) {
  try {
    // Tìm End of Central Directory (0x06054b50) từ cuối buffer
    let eocdPos = -1;
    const minPos = Math.max(0, buffer.length - 65557);
    for (let i = buffer.length - 22; i >= minPos; i--) {
      if (buffer.readUInt32LE(i) === 0x06054b50) {
        eocdPos = i;
        break;
      }
    }
    if (eocdPos === -1) throw new Error('Invalid DOCX zip');

    const cdCount = buffer.readUInt16LE(eocdPos + 10);
    let pos = buffer.readUInt32LE(eocdPos + 16);

    for (let i = 0; i < cdCount && pos < eocdPos; i++) {
      if (buffer.readUInt32LE(pos) !== 0x02014b50) break;
      const compressionMethod = buffer.readUInt16LE(pos + 10);
      const compressedSize = buffer.readUInt32LE(pos + 20);
      const nameLen = buffer.readUInt16LE(pos + 28);
      const extraLen = buffer.readUInt16LE(pos + 30);
      const commentLen = buffer.readUInt16LE(pos + 32);
      const localHeaderOffset = buffer.readUInt32LE(pos + 42);
      const fileName = buffer.subarray(pos + 46, pos + 46 + nameLen).toString('utf8');

      if (fileName === 'word/document.xml') {
        if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) break;
        const localNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
        const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
        const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
        const compBuf = buffer.subarray(dataStart, dataStart + compressedSize);
        const xml =
          compressionMethod === 0
            ? compBuf.toString('utf8')
            : zlib.inflateRawSync(compBuf).toString('utf8');

        return xml
          .replace(/<\/w:p>/gi, '\n')
          .replace(/<\/w:tr>/gi, '\n')
          .replace(/<w:(?:br|cr)[^>]*\/>/gi, '\n')
          .replace(/<\/w:tc>/gi, '\t')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }
      pos += 46 + nameLen + extraLen + commentLen;
    }
    throw new Error('word/document.xml not found');
  } catch {
    throw new AppError('Không đọc được nội dung file Word (.docx). Vui lòng kiểm tra lại file hoặc chuyển sang PDF.', 400);
  }
}

function normalizeProvince(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const n = normName(s);
  if (n.includes('toan quoc') || n === 'remote' || n.includes('anywhere')) return 'Toàn quốc';
  if (n.includes('ho chi minh') || n === 'hcm' || n === 'tphcm' || n.includes('sai gon')) return 'TP. Hồ Chí Minh';
  if (n.includes('ha noi') || n === 'hanoi' || n === 'hn') return 'Hà Nội';
  if (n.includes('da nang') || n === 'danang') return 'Đà Nẵng';
  if (n.includes('hai phong') || n === 'haiphong') return 'Hải Phòng';
  if (n.includes('can tho') || n === 'cantho') return 'Cần Thơ';
  if (n.includes('vung tau') || n.includes('ba ria')) return 'Bà Rịa - Vũng Tàu';
  if (n.includes('hue') || n.includes('thua thien')) return 'Thừa Thiên Huế';

  for (const p of PROVINCES) {
    const np = normName(p);
    if (np === n || n.includes(np) || np.includes(n)) return p;
  }
  return '';
}

function normalizeSalaryVnd(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return null;
  // Nếu AI trả về số nhỏ (VD: 15 thay vì 15000000 cho 15 triệu)
  if (num < 500) return Math.round(num * 1000000);
  // Nếu AI trả về đơn vị nghìn (VD: 15000 cho 15 triệu)
  if (num < 100000) return Math.round(num * 1000);
  return Math.round(num);
}

function normalizeBullets(text) {
  if (!text) return '';
  return String(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^[-•*+]\s+/.test(line)) return `- ${line.replace(/^[-•*+]\s+/, '').trim()}`;
      return line;
    })
    .join('\n')
    .trim();
}

async function parseJobDescriptionFile(file, skillNames = []) {
  if (!file || !file.buffer) {
    throw new AppError('Vui lòng chọn một file mô tả công việc (JD) để tải lên.', 400);
  }
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('Chức năng lọc thông tin bằng AI chưa được cấu hình (thiếu GEMINI_API_KEY trên máy chủ).', 503);
  }

  const originalName = Buffer.from(file.originalname || 'jd.pdf', 'latin1').toString('utf8');
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_JD_EXTENSIONS.includes(ext)) {
    throw new AppError(`Định dạng file không hỗ trợ. Chấp nhận: ${ALLOWED_JD_EXTENSIONS.join(', ')}`, 400);
  }

  const prompt =
    'Đây là tài liệu Mô tả công việc / Tin tuyển dụng (Job Description - JD). ' +
    'Hãy đọc kỹ và trích xuất chính xác các thông tin tuyển dụng theo quy tắc sau:\n\n' +
    '1. title: Tiêu đề công việc / Vị trí tuyển dụng (VD: "Lập trình viên Frontend (ReactJS)", "Senior Backend Engineer").\n' +
    '2. work_type: Hình thức làm việc, chọn 1 trong: FULL_TIME (toàn thời gian), PART_TIME (bán thời gian), REMOTE (làm từ xa), FREELANCE (tự do/theo dự án). Nếu không ghi rõ nhưng là việc làm văn phòng thông thường thì chọn FULL_TIME.\n' +
    '3. quantity: Số lượng cần tuyển (số nguyên dương, nếu không nêu rõ thì để null).\n' +
    '4. position_level: Cấp bậc, chọn 1 trong: INTERN (Thực tập sinh), FRESHER, JUNIOR, MIDDLE, SENIOR, LEAD (Team Lead/Tech Lead), MANAGER (Quản lý/Trưởng phòng). Không rõ thì để null.\n' +
    '5. experience: Yêu cầu số năm kinh nghiệm, chọn 1 trong: NONE (Không yêu cầu kinh nghiệm), UNDER_1 (Dưới 1 năm), Y1_2 (Từ 1 đến 2 năm), Y2_5 (Từ 2 đến 5 năm), OVER_5 (Trên 5 năm). Không rõ thì để null.\n' +
    '6. location: Tỉnh/Thành phố làm việc tại Việt Nam (VD: "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"... hoặc "Toàn quốc" nếu làm Remote hoàn toàn). Không rõ thì để null.\n' +
    '7. work_address: Địa chỉ nơi làm việc cụ thể (tòa nhà, số nhà, tên đường, quận/huyện...). Không rõ thì để null.\n' +
    '8. working_time: Thời gian / khung giờ làm việc (VD: "Thứ 2 – Thứ 6 (8h30 – 17h30)"). Không rõ thì để null.\n' +
    '9. salary_min & salary_max: Mức lương tối thiểu và tối đa quy đổi ra VNĐ/tháng (VD: "15 - 25 triệu" -> salary_min=15000000, salary_max=25000000; "Up to 30M" -> salary_min=null, salary_max=30000000; "Từ 20 triệu" -> salary_min=20000000, salary_max=null; nếu ghi bằng USD thì quy đổi 1 USD = 25000 VNĐ; nếu "Thỏa thuận" hoặc không đề cập thì để null).\n' +
    '10. deadline: Hạn chót nộp hồ sơ dạng YYYY-MM-DD (nếu có ghi rõ ngày/tháng/năm trong file, ngược lại để null).\n' +
    '11. description: Mô tả chi tiết công việc / trách nhiệm chính (mỗi ý một dòng bắt đầu bằng "- ").\n' +
    '12. requirements: Yêu cầu đối với ứng viên về chuyên môn, kỹ năng, bằng cấp (mỗi ý một dòng bắt đầu bằng "- ").\n' +
    '13. benefits: Quyền lợi, đãi ngộ, phúc lợi được hưởng (mỗi ý một dòng bắt đầu bằng "- ").\n' +
    '14. skills: Từ DANH SÁCH KỸ NĂNG bên dưới, chọn ra những kỹ năng được yêu cầu hoặc nhắc tới trong JD. Chỉ trả về đúng tên trong danh sách, không tự thêm tên ngoài danh sách.\n' +
    'Lưu ý: Chỉ trích xuất thông tin có thật trong tài liệu, không tự bịa thêm.\n\n' +
    'DANH SÁCH KỸ NĂNG HỆ THỐNG:\n' +
    skillNames.join(', ');

  const parts = [{ text: prompt }];
  if (MIME_BY_EXT[ext]) {
    parts.push({
      inline_data: {
        mime_type: MIME_BY_EXT[ext],
        data: file.buffer.toString('base64'),
      },
    });
  } else {
    const rawText =
      ext === '.docx'
        ? extractTextFromDocx(file.buffer)
        : file.buffer.toString('utf8').trim();
    if (!rawText) {
      throw new AppError('File tải lên đang trống hoặc không có nội dung văn bản.', 400);
    }
    parts.push({ text: `\n\nNỘI DUNG FILE JD (${originalName}):\n${rawText.slice(0, 40000)}` });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: JD_SCHEMA,
          temperature: 0,
        },
      }),
    });
  } catch {
    throw new AppError('Không kết nối được dịch vụ AI hoặc quá thời gian chờ. Vui lòng thử lại.', 503);
  }

  if (!res.ok) {
    console.error('Gemini JD parse error', res.status, (await res.text()).slice(0, 300));
    throw new AppError(
      res.status === 429
        ? 'Dịch vụ AI đang quá tải, vui lòng thử lại sau ít phút.'
        : 'Dịch vụ AI gặp lỗi khi đọc file, vui lòng thử lại.',
      503
    );
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AppError('AI không trích xuất được nội dung từ file này. Hãy kiểm tra lại file.', 422);
  }

  let salaryMin = normalizeSalaryVnd(parsed.salary_min);
  let salaryMax = normalizeSalaryVnd(parsed.salary_max);
  if (salaryMin && salaryMax && salaryMin > salaryMax) {
    [salaryMin, salaryMax] = [salaryMax, salaryMin];
  }

  const normDeadlineDate = normalizeDate(parsed.deadline);
  let deadline = '';
  let deadlineExpired = false;
  if (normDeadlineDate) {
    const candidateDt = `${normDeadlineDate}T23:59`;
    if (new Date(candidateDt) > new Date()) {
      deadline = candidateDt;
    } else {
      deadlineExpired = true;
    }
  }

  return {
    file_name: originalName,
    title: String(parsed.title || '').trim().slice(0, 200),
    work_type: WORK_TYPES.includes(parsed.work_type) ? parsed.work_type : '',
    quantity: Number.isInteger(parsed.quantity) && parsed.quantity > 0 ? parsed.quantity : null,
    position_level: POSITION_LEVELS.includes(parsed.position_level) ? parsed.position_level : '',
    experience: EXPERIENCES.includes(parsed.experience) ? parsed.experience : '',
    location: normalizeProvince(parsed.location),
    work_address: String(parsed.work_address || '').trim().slice(0, 500),
    working_time: String(parsed.working_time || '').trim().slice(0, 255),
    salary_min: salaryMin,
    salary_max: salaryMax,
    deadline,
    deadline_expired: deadlineExpired,
    description: normalizeBullets(parsed.description),
    requirements: normalizeBullets(parsed.requirements),
    benefits: normalizeBullets(parsed.benefits),
    skills: Array.isArray(parsed.skills) ? parsed.skills.filter((x) => typeof x === 'string') : [],
  };
}

module.exports = {
  parseJobDescriptionFile,
  ALLOWED_JD_EXTENSIONS,
};
