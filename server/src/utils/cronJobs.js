const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const {
  Company, CandidateProfile, CandidateCv, Application, ProjectApplication, TaskSubmission
} = require('../models');

// File mới upload được giữ 1 giờ (người dùng up file mà chưa kịp bấm Lưu form thì không bị xóa nhầm)
const GRACE_PERIOD_MS = 60 * 60 * 1000;

// Lấy tên file từ URL (bỏ query như ?name=...) nếu URL thuộc thư mục `folder`
const fileNameFromUrl = (url, folder) => {
  if (!url || !url.includes(`/uploads/${folder}/`)) return null;
  return path.basename(url.split('?')[0]);
};

// Lấy tập tên file đang được tham chiếu trong DB
const collectUsedFiles = async (folder, sources) => {
  const used = new Set();
  for (const { model, field } of sources) {
    const rows = await model.findAll({ attributes: [field], raw: true });
    rows.forEach(r => {
      const name = fileNameFromUrl(r[field], folder);
      if (name) used.add(name);
    });
  }
  return used;
};

// Xóa các file cũ hơn GRACE_PERIOD_MS mà không còn được tham chiếu
const cleanupFolder = (folder, used) => {
  const dir = path.join(__dirname, '../../uploads', folder);
  if (!fs.existsSync(dir)) return 0;
  let deleted = 0;
  fs.readdirSync(dir).forEach(file => {
    if (file.startsWith('.')) return; // Bỏ qua các file hệ thống (như .DS_Store)
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return;
    // ĐIỀU KIỆN XÓA: File cũ hơn 1 giờ VÀ không có tên trong DB
    if (Date.now() - stats.mtimeMs > GRACE_PERIOD_MS && !used.has(file)) {
      fs.unlinkSync(filePath);
      deleted++;
    }
  });
  return deleted;
};

// Hàm xử lý dọn rác
const cleanupOrphanFiles = async () => {
  try {
    // 1. Ảnh: logo doanh nghiệp, ảnh đại diện ứng viên
    const usedImages = await collectUsedFiles('images', [
      { model: Company, field: 'logo_url' },
      { model: CandidateProfile, field: 'avatar_url' },
    ]);
    cleanupFolder('images', usedImages);

    // 2. CV: CV mặc định trong hồ sơ, danh sách nhiều CV, CV đính kèm khi ứng tuyển (việc làm + dự án)
    const usedCvs = await collectUsedFiles('cvs', [
      { model: CandidateProfile, field: 'cv_url' },
      { model: CandidateCv, field: 'file_url' },
      { model: Application, field: 'cv_url' },
      { model: ProjectApplication, field: 'cv_url' },
    ]);
    cleanupFolder('cvs', usedCvs);

    // 3. File sản phẩm nộp cho task
    const usedTaskFiles = await collectUsedFiles('tasks', [
      { model: TaskSubmission, field: 'attachment_url' },
    ]);
    cleanupFolder('tasks', usedTaskFiles);
  } catch (error) {
    console.error('[CRON] ❌ Lỗi khi dọn dẹp file rác:', error);
  }
};

// Khởi chạy lập lịch (Cron)
const startCronJobs = () => {
  // Cú pháp cron: 'Phút Giờ Ngày Tháng Thứ'
  // '0 2 * * *' = Chạy vào đúng 2:00 AM (sáng sớm) mỗi ngày.
  cron.schedule('0 2 * * *', cleanupOrphanFiles);
};

module.exports = { startCronJobs, cleanupOrphanFiles };
